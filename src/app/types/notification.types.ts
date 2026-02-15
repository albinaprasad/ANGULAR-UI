export type NotificationType = {
    id?: number;
    name: string;
    description?: string;
}

export type Notification = {
  id?: number;
  title: string;
  message: string;
  type: NotificationType;
  created_at: string; 
};

