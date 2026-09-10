export type NotificationType =
  | 'ASSIGNMENT'
  | 'INSPECTION_REMINDER'
  | 'PENDING_SYNC'
  | 'SYSTEM';

/** Data embedded in a notification payload so tapping it can navigate correctly. */
export interface NotificationNavigationData {
  notificationType: NotificationType;
  inspectionId?: string;
}

/** A record stored locally tracking a scheduled local notification. */
export interface NotificationRecord {
  id: string;                   // stable key = `${inspectionId}-${notificationType}`
  inspectionId: string;
  notificationType: NotificationType;
  scheduledNotificationId: string; // the ID returned by expo-notifications
  scheduledFor: string;            // ISO timestamp
  status: 'SCHEDULED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}
