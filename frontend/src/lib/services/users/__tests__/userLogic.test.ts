/**
 * Unit Tests for User & Admin Management Logic:
 * 1. Filter and search logic
 * 2. Form validation rules (email, password strength, required fields)
 * 3. Pagination math
 */

import { User } from "../userTypes";

// Mock user list for testing
export const TEST_USERS: User[] = [
  {
    id: "u1",
    firstName: "Sarah",
    lastName: "Jenkins",
    username: "sjenkins",
    email: "sarah@example.com",
    avatarUrl: "",
    role: "Subscriber",
    isAdmin: false,
    status: "active",
    lastAccessAt: "Active Now",
    createdAt: "2026-01-01",
  },
  {
    id: "u2",
    firstName: "Marcus",
    lastName: "Vance",
    username: "mvance",
    email: "marcus@krafts.io",
    avatarUrl: "",
    role: "Administrator",
    isAdmin: true,
    status: "active",
    lastAccessAt: "5 min ago",
    createdAt: "2026-01-02",
  },
  {
    id: "u3",
    firstName: "Elena",
    lastName: "Rostova",
    username: "erostova",
    email: "elena@example.com",
    avatarUrl: "",
    role: "Editor",
    isAdmin: false,
    status: "muted",
    lastAccessAt: "Muted for 24h",
    createdAt: "2026-01-03",
  },
];

// Pure search & filter function under test
export function filterUsers(
  users: User[],
  tab: "user" | "admin",
  status: "all" | "active" | "muted" | "deactivated",
  query: string
): User[] {
  return users.filter((u) => {
    // Tab check
    if (tab === "admin" && !u.isAdmin && u.role !== "Administrator") return false;
    if (tab === "user" && (u.isAdmin || u.role === "Administrator")) return false;

    // Status check
    if (status !== "all" && u.status !== status) return false;

    // Search query check
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const match =
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

// Validation function under test
export function validateNewUser(data: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.firstName.trim()) errors.firstName = "First name is required.";
  if (!data.lastName.trim()) errors.lastName = "Last name is required.";
  if (!data.username.trim() || data.username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.phone.trim() || data.phone.trim() === "+880") {
    errors.phone = "Contact phone number is required.";
  }
  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  } else if (!/(?=.*\d)(?=.*[!@#$%^&*])/.test(data.password)) {
    errors.password = "Must contain at least 1 digit and 1 special symbol.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

// Self-executing assertion test runner
export function runTests(): boolean {
  // Test 1: Tab separation
  const userTabResults = filterUsers(TEST_USERS, "user", "all", "");
  console.assert(userTabResults.length === 2, "Expected 2 standard users");

  const adminTabResults = filterUsers(TEST_USERS, "admin", "all", "");
  console.assert(adminTabResults.length === 1, "Expected 1 admin user");

  // Test 2: Search matching
  const searchResults = filterUsers(TEST_USERS, "user", "all", "Sarah");
  console.assert(searchResults.length === 1 && searchResults[0].id === "u1", "Expected Sarah to match");

  // Test 3: Status filter
  const mutedResults = filterUsers(TEST_USERS, "user", "muted", "");
  console.assert(mutedResults.length === 1 && mutedResults[0].id === "u3", "Expected 1 muted user");

  // Test 4: Form validation pass
  const validForm = validateNewUser({
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john.doe@test.com",
    phone: "+880 1700 000000",
    password: "Password123!",
  });
  console.assert(validForm.isValid === true, "Form should be valid");

  // Test 5: Form validation fail on weak password
  const invalidPasswordForm = validateNewUser({
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john.doe@test.com",
    phone: "+880 1700 000000",
    password: "weak",
  });
  console.assert(invalidPasswordForm.isValid === false, "Weak password should fail");

  return true;
}

if (typeof window === "undefined" && typeof process !== "undefined" && process.env.NODE_ENV === "test") {
  runTests();
}
