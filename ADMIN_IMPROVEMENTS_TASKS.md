# Admin Dashboard Improvements - Task Breakdown

## Current Status
- ✅ Feature flag system with CRUD
- ✅ Admin dashboard exists (basic)
- ✅ Promo code system implemented
- ⚠️ Need to reorganize admin routes
- ⚠️ Need to improve admin dashboard
- ⚠️ Need user purchase history

---

## Task 1: Feature Flag Admin UI with CRUD ✅
**Status**: ✅ Completed  
**Priority**: 🔴 Critical  
**Estimated Time**: 2-3 hours

**What was done**:
- ✅ Create `/admin/feature-flags` page
- ✅ Create API endpoints (GET, POST, PATCH, DELETE)
- ✅ Store feature flags in database
- ✅ Toggle UI for each feature flag
- ✅ Create new feature flags
- ✅ Delete feature flags
- ✅ Real-time updates when toggled
- ✅ Added to admin navigation

---

## Task 2: Reorganize Admin Routes
**Status**: ✅ Completed  
**Priority**: 🔴 Critical  
**Estimated Time**: 1-2 hours

**Objective**: Consolidate all admin functionality under `/admin` route structure

**Current State**:
- Feature Flags: `/admin/feature-flags` ✅
- Promo Codes: `/admin/promos` ✅
- Users: `/admin/users` ✅
- Subscriptions: `/admin/subscriptions` ✅
- Payments: `/admin/payments` (to be removed - use Stripe dashboard)

**Steps**:
- [x] Verify all admin routes are under `/admin`
- [x] Remove payments route/page (not needed - use Stripe)
- [x] Update navigation to reflect structure
- [x] Ensure consistent URL patterns

**Files to Modify**:
- `components/navigation/app-sidebar.tsx` (remove payments, organize nav)
- `app/(dashboard)/admin/payments/page.tsx` (remove if exists)

**Acceptance Criteria**:
- [x] All admin routes are `/admin/*`
- [x] Payments removed from navigation
- [x] Navigation is clean and organized

---

## Task 3: Redesign Admin Dashboard with Real Stats
**Status**: ⬜ Not Started  
**Priority**: 🔴 Critical  
**Estimated Time**: 3-4 hours

**Objective**: Replace mock data with real stats and improve layout

**Steps**:
- [ ] Create API endpoint `/api/admin/stats`
- [ ] Fetch real data:
  - Total users count
  - Total beats/packs count
  - Average price
  - Total revenue (from purchases)
  - Recent activity
- [ ] Update admin dashboard to use real data
- [ ] Add quick action cards:
  - "Create Promo Code" → `/admin/promos`
  - "Upload Beat" → `/admin/upload`
  - "Create Beat Pack" → `/admin/edit-pack`
  - "Manage Users" → `/admin/users`
- [ ] Improve layout and styling
- [ ] Make mobile-responsive

**Files to Create**:
- `app/api/admin/stats/route.ts`

**Files to Modify**:
- `app/(dashboard)/admin/page.tsx`

**Acceptance Criteria**:
- [ ] All stats show real data
- [ ] Average price calculated correctly
- [ ] Quick actions work (upload, create promo, etc.)
- [ ] Layout is clean and organized
- [ ] Mobile-responsive

---

## Task 4: User Management & Purchase History
**Status**: ⬜ Not Started  
**Priority**: 🔴 Critical  
**Estimated Time**: 4-5 hours

**Objective**: Add comprehensive user management with purchase history

**Steps**:
- [ ] Enhance `/admin/users` page:
  - [ ] List all users with key info (email, role, signup date)
  - [ ] Search/filter users
  - [ ] View user details
  - [ ] Edit user role (admin/user)
- [ ] Add purchase history view:
  - [ ] Show all purchases (paid + promo code redemptions)
  - [ ] Include: date, asset type (beat/pack), price ($0 for promos), promo code if applicable
  - [ ] Link to asset details
  - [ ] Show download status
- [ ] Create API endpoint `/api/admin/users/[id]/purchases`
- [ ] Add user detail modal/page

**Files to Create**:
- `app/api/admin/users/[id]/purchases/route.ts`
- `app/(dashboard)/admin/users/[id]/page.tsx` (optional - could be modal)

**Files to Modify**:
- `app/(dashboard)/admin/users/page.tsx`
- `lib/db/queries.ts` (add purchase history query)

**Acceptance Criteria**:
- [ ] Can view all users
- [ ] Can search/filter users
- [ ] Can view user purchase history
- [ ] Purchase history includes promo code redemptions
- [ ] Shows $0 for promo code purchases
- [ ] Links to assets work

---

## Task 5: Test Promo Code System End-to-End
**Status**: ⬜ Not Started  
**Priority**: 🟡 High  
**Estimated Time**: 30 minutes

**Objective**: Verify promo code system works completely

**Steps**:
- [ ] Create a test promo code in admin
- [ ] Test validation endpoint
- [ ] Test redemption endpoint
- [ ] Verify $0 purchase record created
- [ ] Verify download access granted
- [ ] Test UI flow (enter code, redeem, download)
- [ ] Verify purchase history shows promo redemption

**Acceptance Criteria**:
- [ ] Can create promo code
- [ ] Validation works
- [ ] Redemption works
- [ ] Purchase record created
- [ ] Download access granted
- [ ] UI flow is smooth
- [ ] Purchase history shows promo

---

## Implementation Order (Recommended)

1. **Task 2** (1-2 hours) - Reorganize admin routes (quick cleanup)
2. **Task 3** (3-4 hours) - Redesign admin dashboard with real stats
3. **Task 4** (4-5 hours) - User management & purchase history
4. **Task 5** (30 min) - Test promo codes end-to-end

**Total Estimated Time**: ~9-12 hours

---

## Notes

- Focus on one task at a time
- Test each task before moving to next
- Update this document as tasks are completed
- Keep code clean and avoid vestigial code
- Payments removed - use Stripe dashboard instead
