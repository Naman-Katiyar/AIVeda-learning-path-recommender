export type LearningItemStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";
export type UserRole = "learner" | "admin";
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}
