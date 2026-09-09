import { openDatabase } from './Database';
import { InspectionSummary } from '../../../features/inspections/models/InspectionModels';
import { InspectionFormData, InspectionChecklistItem, MeasurementReading } from '../../../features/inspections/models/InspectionFormModels';
import { AIVerificationResult } from '../../../features/inspections/models/AIVerificationModels';
import { OfficerDecision, InspectionDecisionRecord, InspectionSubmissionPayload } from '../../../features/inspections/models/OfficerDecisionModels';
import { InspectionHistoryItem } from '../../../features/history/models/InspectionHistoryModels';
import * as FileSystem from 'expo-file-system/legacy';

class InspectionLocalRepository {
  private get db() {
    return openDatabase();
  }

  /**
   * Initializes a local inspection record when an officer starts an inspection.
   */
  async startInspection(summary: InspectionSummary): Promise<void> {
    const existing = await this.db.getFirstAsync('SELECT id FROM inspections WHERE id = ?', [summary.id]);
    
    if (!existing) {
      await this.db.runAsync(
        `INSERT INTO inspections (
          id, applicationId, businessName, instrumentName, instrumentModel,
          location, scheduledDate, scheduledTime, assignedOfficerId, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          summary.id,
          summary.applicationId,
          summary.businessName || '',
          summary.instrumentName,
          summary.instrumentModel || '',
          summary.location || '',
          summary.scheduledDate,
          summary.scheduledTime,
          summary.assignedOfficerId || '',
          'IN_PROGRESS',
          summary.notes || ''
        ]
      );

      await this.queueSyncOperation('INSPECTION', summary.id, 'CREATE');
    }
  }

  /**
   * Retrieves the full inspection record including checklist, measurements, and photos.
   */
  async getInspection(id: string): Promise<InspectionFormData | null> {
    const inspectionRow = await this.db.getFirstAsync<any>('SELECT * FROM inspections WHERE id = ?', [id]);
    if (!inspectionRow) return null;

    const checklistRows = await this.db.getAllAsync<any>('SELECT * FROM inspection_checklist WHERE inspectionId = ?', [id]);
    const measurementRows = await this.db.getAllAsync<any>('SELECT * FROM inspection_measurements WHERE inspectionId = ?', [id]);
    const photoRow = await this.db.getFirstAsync<any>("SELECT localUri FROM inspection_photos WHERE inspectionId = ? AND photoType = 'OFFICER_EVIDENCE'", [id]);
    const refPhotoRow = await this.db.getFirstAsync<any>("SELECT localUri FROM inspection_photos WHERE inspectionId = ? AND photoType = 'CUSTOMER_REFERENCE'", [id]);
    const aiResultRow = await this.db.getFirstAsync<any>('SELECT * FROM ai_verification_results WHERE inspectionId = ?', [id]);

    const checklist: InspectionChecklistItem[] = checklistRows.map(row => ({
      id: row.checklistItemId,
      label: row.label,
      status: row.status as any,
    }));

    const measurements: MeasurementReading[] = measurementRows.map(row => ({
      id: row.measurementId,
      label: row.label,
      value: parseFloat(row.value), // Ensure value stays numeric
      unit: row.unit,
      note: row.note,
    }));

    return {
      inspectionId: inspectionRow.id,
      checklist,
      measurements,
      observations: inspectionRow.observations || '',
      remarks: inspectionRow.remarks || '',
      photoUri: photoRow ? photoRow.localUri : undefined,
      referencePhotoUri: refPhotoRow ? refPhotoRow.localUri : undefined,
      aiResult: aiResultRow ? {
        id: aiResultRow.id,
        inspectionId: aiResultRow.inspectionId,
        referencePhotoId: aiResultRow.referencePhotoId,
        officerPhotoId: aiResultRow.officerPhotoId,
        status: aiResultRow.status,
        confidence: aiResultRow.confidence,
        findings: aiResultRow.findings,
        processingStatus: aiResultRow.processingStatus,
        errorMessage: aiResultRow.errorMessage,
        createdAt: aiResultRow.createdAt,
      } : undefined,
      // Phase 10 decision fields
      decision: inspectionRow.decision ?? undefined,
      decisionRemarks: inspectionRow.decisionRemarks ?? undefined,
      completedAt: inspectionRow.completedAt ?? undefined,
      localSyncStatus: inspectionRow.syncStatus ?? undefined,
    };
  }

  async updateChecklist(inspectionId: string, checklist: InspectionChecklistItem[]): Promise<void> {
    // We could do an upsert or delete and insert. Given SQLite's simplicity, a transaction is best.
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync('DELETE FROM inspection_checklist WHERE inspectionId = ?', [inspectionId]);
      for (const item of checklist) {
        await this.db.runAsync(
          'INSERT INTO inspection_checklist (id, inspectionId, checklistItemId, label, status) VALUES (?, ?, ?, ?, ?)',
          [`${inspectionId}-${item.id}`, inspectionId, item.id, item.label, item.status]
        );
      }
      await this.queueSyncOperation('CHECKLIST', inspectionId, 'UPDATE');
    });
  }

  async updateObservations(inspectionId: string, observations: string, remarks: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE inspections SET observations = ?, remarks = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [observations, remarks, inspectionId]
    );
    await this.queueSyncOperation('OBSERVATIONS', inspectionId, 'UPDATE');
  }

  async saveMeasurements(inspectionId: string, measurements: MeasurementReading[]): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync('DELETE FROM inspection_measurements WHERE inspectionId = ?', [inspectionId]);
      for (const m of measurements) {
        await this.db.runAsync(
          'INSERT INTO inspection_measurements (id, inspectionId, measurementId, label, value, unit, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [`${inspectionId}-${m.id}`, inspectionId, m.id, m.label, m.value.toString(), m.unit, m.note || '']
        );
      }
      await this.queueSyncOperation('MEASUREMENTS', inspectionId, 'UPDATE');
    });
  }

  async savePhoto(inspectionId: string, tempUri: string, photoType: 'OFFICER_EVIDENCE' | 'CUSTOMER_REFERENCE' = 'OFFICER_EVIDENCE'): Promise<string> {
    // Move from cache to persistent document directory
    const filename = tempUri.split('/').pop() || `photo-${Date.now()}.jpg`;
    // documentDirectory can be null on some platforms in some edge cases, fallback to cache
    const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || 'file:///';
    const permanentUri = `${baseDir}${filename}`;
    
    await FileSystem.moveAsync({
      from: tempUri,
      to: permanentUri
    });

    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync('DELETE FROM inspection_photos WHERE inspectionId = ? AND photoType = ?', [inspectionId, photoType]);
      await this.db.runAsync(
        'INSERT INTO inspection_photos (id, inspectionId, photoType, localUri) VALUES (?, ?, ?, ?)',
        [`photo-${photoType}-${inspectionId}`, inspectionId, photoType, permanentUri]
      );
      await this.queueSyncOperation('PHOTO', inspectionId, 'UPDATE');
    });

    return permanentUri;
  }

  async saveAiVerificationResult(result: AIVerificationResult): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync('DELETE FROM ai_verification_results WHERE inspectionId = ?', [result.inspectionId]);
      await this.db.runAsync(
        `INSERT INTO ai_verification_results (
          id, inspectionId, referencePhotoId, officerPhotoId, status,
          confidence, findings, processingStatus, errorMessage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          result.id,
          result.inspectionId,
          result.referencePhotoId || null,
          result.officerPhotoId || null,
          result.status,
          result.confidence || null,
          result.findings || null,
          result.processingStatus || null,
          result.errorMessage || null
        ]
      );
      await this.queueSyncOperation('AI_VERIFICATION', result.id, 'CREATE_OR_UPDATE');
    });
  }

  /**
   * Persists the officer's final decision. Marks the inspection READY_FOR_SUBMISSION
   * and queues the full submission payload for future sync.
   */
  async saveDecision(
    record: InspectionDecisionRecord,
    payload: InspectionSubmissionPayload
  ): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `UPDATE inspections
         SET decision = ?, decisionRemarks = ?, completedAt = ?,
             status = 'READY_FOR_SUBMISSION', syncStatus = 'PENDING',
             updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          record.decision,
          record.decisionRemarks || null,
          record.completedAt,
          record.inspectionId,
        ]
      );

      // Delete any pre-existing queue entry for this inspection submission to avoid duplicates
      await this.db.runAsync(
        `DELETE FROM sync_queue WHERE entityType = 'INSPECTION_SUBMISSION' AND entityId = ?`,
        [record.inspectionId]
      );

      await this.db.runAsync(
        `INSERT INTO sync_queue (entityType, entityId, operation, payload, status)
         VALUES ('INSPECTION_SUBMISSION', ?, 'CREATE_OR_UPDATE', ?, 'PENDING')`,
        [record.inspectionId, JSON.stringify(payload)]
      );
    });
  }

  async completeInspection(inspectionId: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE inspections SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      ['READY_FOR_SUBMISSION', inspectionId]
    );
    await this.queueSyncOperation('INSPECTION', inspectionId, 'COMPLETE');
  }

  private async queueSyncOperation(entityType: string, entityId: string, operation: string, payload?: any): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO sync_queue (entityType, entityId, operation, payload) VALUES (?, ?, ?, ?)',
      [entityType, entityId, operation, payload ? JSON.stringify(payload) : null]
    );
  }

  /**
   * Returns all locally completed inspections ordered newest first.
   * Pure read — does NOT write to sync_queue.
   */
  async getInspectionHistory(): Promise<InspectionHistoryItem[]> {
    const rows = await this.db.getAllAsync<{
      id: string;
      applicationId: string;
      businessName: string | null;
      instrumentName: string;
      instrumentModel: string | null;
      location: string | null;
      scheduledDate: string;
      scheduledTime: string;
      decision: string | null;
      decisionRemarks: string | null;
      completedAt: string | null;
      status: string;
      syncStatus: string | null;
    }>(
      `SELECT id, applicationId, businessName, instrumentName, instrumentModel,
              location, scheduledDate, scheduledTime,
              decision, decisionRemarks, completedAt, status,
              COALESCE(syncStatus, 'PENDING') AS syncStatus
       FROM inspections
       WHERE status = 'READY_FOR_SUBMISSION' OR status = 'SYNCED' OR status = 'COMPLETED'
       ORDER BY
         CASE WHEN completedAt IS NOT NULL THEN completedAt ELSE updatedAt END DESC`
    );

    return rows.map(row => ({
      id: row.id,
      applicationId: row.applicationId,
      businessName: row.businessName ?? undefined,
      instrumentName: row.instrumentName,
      instrumentModel: row.instrumentModel ?? undefined,
      location: row.location ?? undefined,
      scheduledDate: row.scheduledDate,
      scheduledTime: row.scheduledTime,
      decision: row.decision as OfficerDecision | undefined,
      decisionRemarks: row.decisionRemarks ?? undefined,
      completedAt: row.completedAt ?? undefined,
      localStatus: row.status,
      syncStatus: row.syncStatus ?? undefined,
    }));
  }
}

export const repository = new InspectionLocalRepository();
