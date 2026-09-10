import { openDatabase, resetDatabaseConnection } from './Database';
import { InspectionSummary } from '../../../features/inspections/models/InspectionModels';
import { InspectionFormData, InspectionChecklistItem, MeasurementReading } from '../../../features/inspections/models/InspectionFormModels';
import { AIVerificationResult } from '../../../features/inspections/models/AIVerificationModels';
import { OfficerDecision, InspectionDecisionRecord, InspectionSubmissionPayload } from '../../../features/inspections/models/OfficerDecisionModels';
import { InspectionHistoryItem } from '../../../features/history/models/InspectionHistoryModels';
import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';

class InspectionLocalRepository {
  private get db() {
    return openDatabase();
  }

  private async safeExec<T>(op: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    try {
      return await op(this.db);
    } catch (err: any) {
      const errStr = String(err?.message || err);
      if (errStr.includes('NullPointerException') || errStr.includes('prepareAsync') || errStr.includes('rejected')) {
        console.warn('[InspectionLocalRepository] Re-opening database after native error...');
        resetDatabaseConnection();
        return await op(this.db);
      }
      throw err;
    }
  }

  /**
   * Initializes a local inspection record when an officer starts an inspection.
   */
  async startInspection(summary: InspectionSummary): Promise<void> {
    await this.safeExec(async (db) => {
      const existing = await db.getFirstAsync('SELECT id FROM inspections WHERE id = ?', [String(summary.id)]);
      
      if (!existing) {
        await db.runAsync(
          `INSERT INTO inspections (
            id, applicationId, businessName, instrumentName, instrumentModel,
            location, scheduledDate, scheduledTime, assignedOfficerId, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(summary.id ?? ''),
            String(summary.applicationId ?? ''),
            String(summary.businessName ?? ''),
            String(summary.instrumentName ?? ''),
            String(summary.instrumentModel ?? ''),
            String(summary.location ?? ''),
            String(summary.scheduledDate ?? ''),
            String(summary.scheduledTime ?? ''),
            String(summary.assignedOfficerId ?? ''),
            'IN_PROGRESS',
            String(summary.notes ?? '')
          ]
        );

        await this.queueSyncOperation('INSPECTION', summary.id, 'CREATE');
      }
    });
  }

  /**
   * Retrieves the full inspection record including checklist, measurements, and photos.
   */
  async getInspection(id: string): Promise<InspectionFormData | null> {
    return await this.safeExec(async (db) => {
      const inspectionRow = await db.getFirstAsync<any>('SELECT * FROM inspections WHERE id = ?', [String(id)]);
      if (!inspectionRow) return null;

      const checklistRows = await db.getAllAsync<any>('SELECT * FROM inspection_checklist WHERE inspectionId = ?', [String(id)]);
      const measurementRows = await db.getAllAsync<any>('SELECT * FROM inspection_measurements WHERE inspectionId = ?', [String(id)]);
      const photoRow = await db.getFirstAsync<any>("SELECT localUri FROM inspection_photos WHERE inspectionId = ? AND photoType = 'OFFICER_EVIDENCE'", [String(id)]);
      const refPhotoRow = await db.getFirstAsync<any>("SELECT localUri FROM inspection_photos WHERE inspectionId = ? AND photoType = 'CUSTOMER_REFERENCE'", [String(id)]);
      const aiResultRow = await db.getFirstAsync<any>('SELECT * FROM ai_verification_results WHERE inspectionId = ?', [String(id)]);

      const checklist: InspectionChecklistItem[] = checklistRows.map(row => ({
        id: row.checklistItemId,
        label: row.label,
        status: row.status as any,
      }));

      const measurements: MeasurementReading[] = measurementRows.map(row => ({
        id: row.measurementId,
        label: row.label,
        value: parseFloat(row.value) || 0,
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
        decision: inspectionRow.decision ?? undefined,
        decisionRemarks: inspectionRow.decisionRemarks ?? undefined,
        completedAt: inspectionRow.completedAt ?? undefined,
        localSyncStatus: inspectionRow.syncStatus ?? undefined,
      };
    });
  }

  async updateChecklist(inspectionId: string, checklist: InspectionChecklistItem[]): Promise<void> {
    await this.safeExec(async (db) => {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM inspection_checklist WHERE inspectionId = ?', [String(inspectionId)]);
        for (const item of checklist) {
          await db.runAsync(
            'INSERT INTO inspection_checklist (id, inspectionId, checklistItemId, label, status) VALUES (?, ?, ?, ?, ?)',
            [
              `${inspectionId}-${item.id}`,
              String(inspectionId),
              String(item.id),
              String(item.label),
              String(item.status),
            ]
          );
        }
      });
      await this.queueSyncOperation('CHECKLIST', inspectionId, 'UPDATE');
    });
  }

  async updateObservations(inspectionId: string, observations: string, remarks: string): Promise<void> {
    await this.safeExec(async (db) => {
      await db.runAsync(
        'UPDATE inspections SET observations = ?, remarks = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [String(observations ?? ''), String(remarks ?? ''), String(inspectionId)]
      );
      await this.queueSyncOperation('OBSERVATIONS', inspectionId, 'UPDATE');
    });
  }

  async saveMeasurements(inspectionId: string, measurements: MeasurementReading[]): Promise<void> {
    await this.safeExec(async (db) => {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM inspection_measurements WHERE inspectionId = ?', [String(inspectionId)]);
        for (const m of measurements) {
          await db.runAsync(
            'INSERT INTO inspection_measurements (id, inspectionId, measurementId, label, value, unit, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              `${inspectionId}-${m.id}`,
              String(inspectionId),
              String(m.id),
              String(m.label),
              String(m.value ?? '0'),
              String(m.unit ?? ''),
              String(m.note || ''),
            ]
          );
        }
      });
      await this.queueSyncOperation('MEASUREMENTS', inspectionId, 'UPDATE');
    });
  }

  async savePhoto(inspectionId: string, tempUri: string, photoType: 'OFFICER_EVIDENCE' | 'CUSTOMER_REFERENCE' = 'OFFICER_EVIDENCE'): Promise<string> {
    const filename = tempUri.split('/').pop() || `photo-${Date.now()}.jpg`;
    const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || 'file:///';
    const permanentUri = `${baseDir}${filename}`;
    
    await FileSystem.moveAsync({
      from: tempUri,
      to: permanentUri
    });

    await this.safeExec(async (db) => {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM inspection_photos WHERE inspectionId = ? AND photoType = ?', [String(inspectionId), photoType]);
        await db.runAsync(
          'INSERT INTO inspection_photos (id, inspectionId, photoType, localUri) VALUES (?, ?, ?, ?)',
          [`photo-${photoType}-${inspectionId}`, String(inspectionId), photoType, permanentUri]
        );
      });
      await this.queueSyncOperation('PHOTO', inspectionId, 'UPDATE');
    });

    return permanentUri;
  }

  async saveAiVerificationResult(result: AIVerificationResult): Promise<void> {
    await this.safeExec(async (db) => {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM ai_verification_results WHERE inspectionId = ?', [String(result.inspectionId)]);
        await db.runAsync(
          `INSERT INTO ai_verification_results (
            id, inspectionId, referencePhotoId, officerPhotoId, status,
            confidence, findings, processingStatus, errorMessage
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(result.id),
            String(result.inspectionId),
            result.referencePhotoId ? String(result.referencePhotoId) : null,
            result.officerPhotoId ? String(result.officerPhotoId) : null,
            String(result.status),
            result.confidence ?? null,
            result.findings ?? null,
            result.processingStatus ?? null,
            result.errorMessage ?? null,
          ]
        );
      });
      await this.queueSyncOperation('AI_VERIFICATION', result.id, 'CREATE_OR_UPDATE');
    });
  }

  async saveDecision(
    record: InspectionDecisionRecord,
    payload: InspectionSubmissionPayload
  ): Promise<void> {
    await this.safeExec(async (db) => {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE inspections
           SET decision = ?, decisionRemarks = ?, completedAt = ?,
               status = 'READY_FOR_SUBMISSION', syncStatus = 'PENDING',
               updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            String(record.decision),
            record.decisionRemarks ? String(record.decisionRemarks) : null,
            String(record.completedAt),
            String(record.inspectionId),
          ]
        );

        await db.runAsync(
          `DELETE FROM sync_queue WHERE entityType = 'INSPECTION_SUBMISSION' AND entityId = ?`,
          [String(record.inspectionId)]
        );

        await db.runAsync(
          `INSERT INTO sync_queue (entityType, entityId, operation, payload, status)
           VALUES ('INSPECTION_SUBMISSION', ?, 'CREATE_OR_UPDATE', ?, 'PENDING')`,
          [String(record.inspectionId), JSON.stringify(payload)]
        );
      });
    });
  }

  async completeInspection(inspectionId: string): Promise<void> {
    await this.safeExec(async (db) => {
      await db.runAsync(
        'UPDATE inspections SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        ['READY_FOR_SUBMISSION', String(inspectionId)]
      );
      await this.queueSyncOperation('INSPECTION', inspectionId, 'COMPLETE');
    });
  }

  private async queueSyncOperation(entityType: string, entityId: string, operation: string, payload?: any): Promise<void> {
    await this.safeExec(async (db) => {
      await db.runAsync(
        'INSERT INTO sync_queue (entityType, entityId, operation, payload) VALUES (?, ?, ?, ?)',
        [String(entityType), String(entityId), String(operation), payload ? JSON.stringify(payload) : null]
      );
    });
  }

  async getInspectionHistory(): Promise<InspectionHistoryItem[]> {
    return await this.safeExec(async (db) => {
      const rows = await db.getAllAsync<{
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
    });
  }

  /**
   * Registers a new instrument/scale with a unique generated Registration ID and official photograph.
   */
  async registerInstrument(data: {
    registrationId: string;
    userId?: string;
    businessName?: string;
    instrumentName: string;
    instrumentModel?: string;
    capacity?: string;
    registeredImageUri: string;
  }): Promise<void> {
    await this.safeExec(async (db) => {
      await db.runAsync(
        `INSERT INTO registered_instruments (
          id, registrationId, userId, businessName, instrumentName,
          instrumentModel, capacity, registeredImageUri
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `REG-${Date.now()}`,
          String(data.registrationId),
          data.userId ? String(data.userId) : null,
          data.businessName ? String(data.businessName) : null,
          String(data.instrumentName),
          data.instrumentModel ? String(data.instrumentModel) : null,
          data.capacity ? String(data.capacity) : null,
          String(data.registeredImageUri),
        ]
      );
    });
  }

  /**
   * Retrieves a registered instrument by its Registration ID.
   */
  async getRegisteredInstrumentByRegId(registrationId: string): Promise<any | null> {
    return await this.safeExec(async (db) => {
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM registered_instruments WHERE UPPER(registrationId) = UPPER(?)',
        [String(registrationId)]
      );
      return row || null;
    });
  }

  /**
   * Gets all registered instruments for display.
   */
  async getAllRegisteredInstruments(): Promise<any[]> {
    return await this.safeExec(async (db) => {
      const rows = await db.getAllAsync<any>('SELECT * FROM registered_instruments ORDER BY createdAt DESC');
      return rows || [];
    });
  }

}

export const repository = new InspectionLocalRepository();
