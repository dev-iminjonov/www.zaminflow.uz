/**
 * User & Admin Management API Service Layer
 * 
 * Implements REST endpoints:
 * - GET /users?tab=&status=&q=&page=&pageSize=&range=
 * - POST /users
 * - PATCH /users/:id (status: active | muted | deactivated)
 * - DELETE /users/:id
 * - GET /users/:id
 * - GET /users/:id/activities
 * - GET /users/:id/orders
 */

import {
  User,
  UserActivity,
  UserOrderDetails,
  UserQueryParams,
  PaginatedUsersResponse,
  CreateUserPayload,
  UserStatus,
} from "./userTypes";
import {
  INITIAL_MOCK_USERS,
  MOCK_USER_ACTIVITIES,
  MOCK_USER_ORDERS,
} from "@/lib/mocks/users/mockUsersData";

const STORAGE_KEY = "zaminflow_users_db";

function getStoredUsers(): User[] {
  if (typeof window === "undefined") return INITIAL_MOCK_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_USERS));
      return INITIAL_MOCK_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_USERS;
  }
}

function saveStoredUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn("Failed to persist users to localStorage", err);
  }
}

// Simulated network delay for realistic UX states (loading skeletons)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getUsers(
  params: UserQueryParams = {}
): Promise<PaginatedUsersResponse> {
  await delay(180);

  const {
    tab = "user",
    status = "all",
    q = "",
    page = 1,
    pageSize = 6,
  } = params;

  let all = getStoredUsers();

  // Tab filter: 'admin' vs 'user'
  if (tab === "admin") {
    all = all.filter((u) => u.isAdmin || u.role === "Administrator");
  } else {
    all = all.filter((u) => !u.isAdmin && u.role !== "Administrator");
  }

  // Status filter
  if (status !== "all") {
    all = all.filter((u) => u.status === status);
  }

  // Search filter (First name, Last name, Email, Username)
  if (q.trim()) {
    const term = q.trim().toLowerCase();
    all = all.filter(
      (u) =>
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term)
    );
  }

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginatedUsers = all.slice(start, start + pageSize);

  return {
    users: paginatedUsers,
    total,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  await delay(120);
  const all = getStoredUsers();
  return all.find((u) => u.id === id) || null;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  await delay(250);
  const all = getStoredUsers();

  // Unique email check
  if (all.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error("A user with this email address already exists.");
  }

  // Unique username check
  if (all.some((u) => u.username.toLowerCase() === payload.username.toLowerCase())) {
    throw new Error("This username is already taken. Please choose another.");
  }

  const isAdmin = payload.role === "Administrator";
  const newUser: User = {
    id: `usr-${Date.now().toString(36)}`,
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    avatarUrl: "/images/team-muhammadaziz.webp",
    webAddress: payload.webAddress || "",
    phone: payload.phone,
    role: payload.role,
    isAdmin,
    status: "active",
    lastAccessAt: "Active Now",
    createdAt: new Date().toISOString(),
  };

  saveStoredUsers([newUser, ...all]);
  return newUser;
}

export async function updateUserStatus(
  id: string,
  status: UserStatus
): Promise<User> {
  await delay(150);
  const all = getStoredUsers();
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("User not found");

  all[idx] = {
    ...all[idx],
    status,
    lastAccessAt: status === "muted" ? "Muted for 24 hours" : all[idx].lastAccessAt,
  };

  saveStoredUsers(all);
  return all[idx];
}

export async function deleteUser(id: string): Promise<boolean> {
  await delay(150);
  const all = getStoredUsers();
  const filtered = all.filter((u) => u.id !== id);
  saveStoredUsers(filtered);
  return true;
}

export async function bulkUpdateStatus(
  ids: string[],
  status: UserStatus
): Promise<number> {
  await delay(200);
  const all = getStoredUsers();
  let updatedCount = 0;
  const updated = all.map((u) => {
    if (ids.includes(u.id)) {
      updatedCount++;
      return {
        ...u,
        status,
        lastAccessAt: status === "muted" ? "Muted for 24 hours" : u.lastAccessAt,
      };
    }
    return u;
  });
  saveStoredUsers(updated);
  return updatedCount;
}

export async function bulkDeleteUsers(ids: string[]): Promise<number> {
  await delay(200);
  const all = getStoredUsers();
  const filtered = all.filter((u) => !ids.includes(u.id));
  saveStoredUsers(filtered);
  return ids.length;
}

export async function getUserActivities(userId: string): Promise<UserActivity[]> {
  await delay(140);
  return (
    MOCK_USER_ACTIVITIES[userId] || [
      {
        id: `act-gen-1`,
        userId,
        actorName: "System Core",
        avatarUrl: "/images/team-muhammadaziz.webp",
        action: "signed in",
        description: "Standard session authentication logged via Web.",
        timestamp: "1 hour ago",
      },
      {
        id: `act-gen-2`,
        userId,
        actorName: "System Core",
        avatarUrl: "/images/team-akrom.webp",
        action: "updated profile settings",
        description: "Verified contact telephone numbers.",
        timestamp: "Yesterday",
      },
    ]
  );
}

export async function getUserOrders(userId: string): Promise<UserOrderDetails> {
  await delay(140);
  return (
    MOCK_USER_ORDERS[userId] || {
      totalOrders: 14,
      receivedOrders: 12,
      cancelledOrders: 2,
      billingAddress: {
        address: "House 12, Road 4, Sector 7, Uttara, Dhaka-1230",
        phone: "Mob: +880 1819 000111",
      },
      shippingAddress: {
        address: "Plot 45, Mirpur Commercial Area, Dhaka-1216",
        phone: "Mob: +880 1819 000111",
      },
      products: [
        {
          id: "prod-gen-1",
          name: "Standard Digital Titration Analyzer v3",
          thumbnailUrl: "/images/team-akrom.webp",
          price: "$1,450.00",
        },
        {
          id: "prod-gen-2",
          name: "IoT Temperature Sensor Node",
          thumbnailUrl: "/images/team-muhammadaziz.webp",
          price: "$380.00",
        },
      ],
    }
  );
}
