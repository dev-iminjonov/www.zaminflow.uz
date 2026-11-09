/**
 * User & Admin Management Domain Types
 */

export type UserRole =
  | "All User"
  | "Administrator"
  | "Editor"
  | "Author"
  | "Contributor"
  | "Subscriber";

export type UserStatus = "active" | "muted" | "deactivated";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl: string;
  webAddress?: string;
  phone?: string;
  role: UserRole;
  isAdmin: boolean;
  status: UserStatus;
  lastAccessAt: string;
  mutedUntil?: string;
  createdAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  actorName: string;
  avatarUrl?: string;
  action: string;
  description: string;
  timestamp: string;
}

export interface UserOrderProduct {
  id: string;
  name: string;
  thumbnailUrl: string;
  price: string;
}

export interface UserOrderDetails {
  totalOrders: number;
  receivedOrders: number;
  cancelledOrders: number;
  billingAddress: {
    address: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    phone: string;
  };
  products: UserOrderProduct[];
}

export interface UserQueryParams {
  tab?: "user" | "admin";
  status?: "all" | "active" | "muted" | "deactivated";
  q?: string;
  page?: number;
  pageSize?: number;
  range?: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  username: string;
  webAddress?: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  sendNotification: boolean;
}
