export type RequestType = "babysitting" | "dogsitting" | "pickup" | "other";

export type RequestStatus = "open" | "claimed" | "completed";

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
}

export interface FamilyRequest {
  id: string;
  type: RequestType;
  title: string;
  description?: string;
  dateTime: string; // ISO string
  postedBy: FamilyMember;
  claimedBy?: FamilyMember;
  status: RequestStatus;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
  notificationSent?: boolean;
  reminderSent?: boolean;
}

export interface Notification {
  id: string;
  type: "new_request" | "request_claimed" | "reminder" | "request_completed";
  requestId: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO string
}
