export type Notification = {
  notification_id: number;
  title: string | null;
  message: string;
  created_at: string;
  is_seen: boolean;
  seen_at: string | null;
  can_view_seen_by: boolean;
  read_by_user_ids: number[];
};

export type NotificationListResponse = {
  message: Notification[];
};

export type NotificationSeenResponse = {
  message: string;
  notification_id: number;
  user_id: number;
  is_seen: true;
  seen_at: string;
};

export type NotificationSocketEvent = {
  event: string;
  action: "created" | "updated" | "deleted";
  model: string;
  object_id: number;
  actor_id: number | null;
};
