# User & Admin Management Module

Production-ready User & Admin Management module built for the Admin Dashboard, strictly matching the clean SaaS design specification.

## File Structure

```
frontend/src/
├── app/
│   └── users/
│       ├── page.tsx          # Screen 1: User & Admin list (with User & Admin tabs)
│       ├── new/
│       │   └── page.tsx      # Screen 2: Add a New User form (40% desktop card)
│       └── [id]/
│           └── page.tsx      # Screen 3: User Details (Activities Log & Orders tabs + Profile)
├── components/
│   └── users/
│       ├── UserStatusBadge.tsx    # Soft pill badges (Muted, Activated, Deactivated)
│       ├── UserPagination.tsx     # Centered pagination with blue filled square indicator
│       ├── UserActionMenu.tsx     # 3-dot row menu with confirmation dialog
│       └── UserBulkActionBar.tsx  # Master checkbox and bulk operations bar
└── lib/
    ├── services/users/
    │   ├── userTypes.ts           # Domain models and query params
    │   ├── usersService.ts        # Typed REST API service layer
    │   ├── README.md              # Module documentation & API connection guide
    │   └── __tests__/
    │       └── userLogic.test.ts  # Filter, search, and form validation tests
    └── mocks/users/
        └── mockUsersData.ts       # Isolated sample data
```

## How to Connect the Real API

Currently, `usersService.ts` interacts with persistent mock data in `mockUsersData.ts`. To switch to your production backend:

1. Replace the functions in `usersService.ts` with `authenticatedFetch`:
   ```typescript
   export async function getUsers(params: UserQueryParams): Promise<PaginatedUsersResponse> {
     const query = new URLSearchParams(params as any).toString();
     const res = await authenticatedFetch(`/api/v1/users?${query}`);
     if (!res.ok) throw new Error("Failed to fetch users");
     return res.json();
   }
   ```
2. Ensure your backend provides the corresponding endpoints:
   - `GET /api/v1/users`
   - `POST /api/v1/users`
   - `PATCH /api/v1/users/:id`
   - `DELETE /api/v1/users/:id`
   - `GET /api/v1/users/:id`
   - `GET /api/v1/users/:id/activities`
   - `GET /api/v1/users/:id/orders`

## Design Alignment Checklist

| Requirement | Implementation | Status |
| :--- | :--- | :--- |
| **Color Tokens** | `#4A86E8` Primary Blue, `#F5F6F8` Background, `#FFFFFF` Cards | Compliant |
| **Status Badges** | Mute (`#F9D9DE`/`#C5221F`), Activated (`#D7FCDA`/`#137333`), Deactivated (`#EAECEF`/`#5F6368`) | Compliant |
| **Screen 1: List** | Floating row cards with subtle shadow, master checkbox, bulk actions, search, status filter, centered pagination | Compliant |
| **Screen 2: Form** | 40% desktop card, 2-col names, +880 contact, show/hide password, role select, notification checkbox | Compliant |
| **Screen 3: Details** | 70/30 layout. Left: Activities Log (Activities & Order tabs). Right: Profile card | Compliant |
| **Query Sync** | URL query parameters (`tab`, `status`, `q`, `page`) are fully synchronized | Compliant |
| **Responsiveness** | Mobile horizontal scrolling for table; form card expands to full width on mobile | Compliant |
| **Accessibility** | ARIA roles, full keyboard navigation, visible focus rings, semantic table headers | Compliant |
