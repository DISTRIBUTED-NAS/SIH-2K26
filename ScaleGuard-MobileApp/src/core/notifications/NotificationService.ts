/**
 * NotificationService — centralized notification management for ScaleGuard.
 *
 * Phase 12 uses local/device notifications only.
 * Phase 13 will wire in backend push-notification events (NEW_ASSIGNMENT,
 * ASSIGNMENT_UPDATED, SYNC_FAILED, etc.) without replacing this service.
 *
 * Architecture for Phase 13:
 *   Backend Event → API → NotificationService.handleBackendEvent() → scheduleLocal()
 */

import * as Notifications from 'expo-notifications';
import { openDatabase } from '../storage/database/Database';
import { NotificationType, NotificationNavigationData, NotificationRecord } from './NotificationModels';

// ── Expo handler (must be set before any notification scheduling) ──────────
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('[NotificationService] setNotificationHandler error:', e);
}

// ── Default reminder lead-time (configurable, not a legal requirement) ─────
const DEFAULT_REMINDER_MINUTES_BEFORE = 30;

class NotificationService {
  private get db() {
    return openDatabase();
  }

  // ── Permission ──────────────────────────────────────────────────────────

  /**
   * Requests notification permission if not already granted.
   * Silently returns false if denied — the app continues normally.
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === 'granted') return true;

      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('[NotificationService] Permission request failed:', e);
      return false;
    }
  }

  /**
   * Returns the current notification permission status.
   */
  async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status as 'granted' | 'denied' | 'undetermined';
    } catch {
      return 'undetermined';
    }
  }

  // ── Core scheduling ─────────────────────────────────────────────────────

  /**
   * Schedule an upcoming inspection reminder.
   * - If a reminder for this inspectionId+type already exists, it is cancelled first.
   * - Does nothing if the scheduled time is in the past.
   * - Does nothing if permission is not granted.
   */
  async scheduleInspectionReminder(
    inspectionId: string,
    applicationId: string,
    scheduledDate: string,  // YYYY-MM-DD
    scheduledTime: string,  // HH:mm
    minutesBefore: number = DEFAULT_REMINDER_MINUTES_BEFORE
  ): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      const target = this.parseScheduledDateTime(scheduledDate, scheduledTime);
      if (!target) return; // invalid date — skip

      const reminderTime = new Date(target.getTime() - minutesBefore * 60 * 1000);
      if (reminderTime <= new Date()) return; // already past — skip

      const stableId = `${inspectionId}-INSPECTION_REMINDER`;

      // Cancel any existing reminder first (dedup)
      await this.cancelNotificationRecord(stableId);

      const trigger: Notifications.DateTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
      };

      const payload: NotificationNavigationData = {
        notificationType: 'INSPECTION_REMINDER',
        inspectionId,
      };

      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Inspection Reminder',
          body: `Inspection ${applicationId} is scheduled in ${minutesBefore} minutes.`,
          data: payload as unknown as Record<string, unknown>,
        },
        trigger,
      });

      await this.saveNotificationRecord({
        id: stableId,
        inspectionId,
        notificationType: 'INSPECTION_REMINDER',
        scheduledNotificationId: notifId,
        scheduledFor: reminderTime.toISOString(),
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[NotificationService] scheduleInspectionReminder failed:', e);
    }
  }

  /**
   * Schedule a pending-sync reminder (immediate, not date-triggered).
   * Safe to call only when the inspection is READY_FOR_SUBMISSION and sync has been
   * pending for a noticeable period. The caller controls the timing.
   */
  async schedulePendingSyncNotification(
    inspectionId: string,
    applicationId: string
  ): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      const stableId = `${inspectionId}-PENDING_SYNC`;

      // Only schedule if one does not already exist
      const existing = await this.getNotificationRecord(stableId);
      if (existing) return;

      const payload: NotificationNavigationData = {
        notificationType: 'PENDING_SYNC',
        inspectionId,
      };

      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏳ Inspection Pending Synchronisation',
          body: `Completed inspection ${applicationId} is waiting to be synchronised.`,
          data: payload as unknown as Record<string, unknown>,
        },
        trigger: null, // immediate
      });

      await this.saveNotificationRecord({
        id: stableId,
        inspectionId,
        notificationType: 'PENDING_SYNC',
        scheduledNotificationId: notifId,
        scheduledFor: new Date().toISOString(),
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[NotificationService] schedulePendingSyncNotification failed:', e);
    }
  }

  // ── Cancellation ────────────────────────────────────────────────────────

  /**
   * Cancel all scheduled notifications for an inspection (e.g. on completion).
   */
  async cancelAllNotificationsForInspection(inspectionId: string): Promise<void> {
    try {
      const types: NotificationType[] = ['INSPECTION_REMINDER', 'PENDING_SYNC', 'ASSIGNMENT', 'SYSTEM'];
      for (const type of types) {
        await this.cancelNotificationRecord(`${inspectionId}-${type}`);
      }
    } catch (e) {
      console.warn('[NotificationService] cancelAllNotificationsForInspection failed:', e);
    }
  }

  // ── Tap navigation helper ───────────────────────────────────────────────

  /**
   * Extract navigation data from a notification response.
   * Returns null if the notification has no inspectionId.
   */
  extractNavigationData(
    response: Notifications.NotificationResponse
  ): NotificationNavigationData | null {
    try {
      const data = response.notification.request.content.data as Partial<NotificationNavigationData>;
      if (!data?.notificationType) return null;
      return {
        notificationType: data.notificationType,
        inspectionId: data.inspectionId,
      };
    } catch {
      return null;
    }
  }

  // ── Private persistence helpers ─────────────────────────────────────────

  private async saveNotificationRecord(record: NotificationRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO notification_records
       (id, inspectionId, notificationType, scheduledNotificationId, scheduledFor, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.inspectionId,
        record.notificationType,
        record.scheduledNotificationId,
        record.scheduledFor,
        record.status,
        record.createdAt,
        record.updatedAt,
      ]
    );
  }

  private async getNotificationRecord(id: string): Promise<NotificationRecord | null> {
    const row = await this.db.getFirstAsync<{
      id: string;
      inspectionId: string;
      notificationType: string;
      scheduledNotificationId: string;
      scheduledFor: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    }>('SELECT * FROM notification_records WHERE id = ?', [id]);
    if (!row) return null;
    return {
      id: row.id,
      inspectionId: row.inspectionId,
      notificationType: row.notificationType as NotificationType,
      scheduledNotificationId: row.scheduledNotificationId,
      scheduledFor: row.scheduledFor,
      status: row.status as NotificationRecord['status'],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private async cancelNotificationRecord(stableId: string): Promise<void> {
    const existing = await this.getNotificationRecord(stableId);
    if (!existing) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(existing.scheduledNotificationId);
    } catch {
      // Notification may have already been delivered — ignore
    }
    await this.db.runAsync(
      `UPDATE notification_records SET status = 'CANCELLED', updatedAt = ? WHERE id = ?`,
      [new Date().toISOString(), stableId]
    );
  }

  // ── Date parsing ────────────────────────────────────────────────────────

  private parseScheduledDateTime(date: string, time: string): Date | null {
    try {
      if (!date || !time) return null;
      const combined = `${date}T${time}`;
      const d = new Date(combined);
      if (isNaN(d.getTime())) return null;
      return d;
    } catch {
      return null;
    }
  }
}

export const notificationService = new NotificationService();
