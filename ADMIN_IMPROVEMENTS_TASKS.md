# Admin Dashboard Improvements - Task Breakdown

## Current Status
- ✅ Feature flag system exists
- ✅ Admin dashboard exists (basic)
- ✅ Promo code system implemented
- ⚠️ Need feature flag admin UI
- ⚠️ Need to remove API logs
- ⚠️ Need to improve admin dashboard

---

## Task 1: Create Feature Flag Admin UI
**Status**: ⬜ Not Started  
**Priority**: 🔴 Critical  
**Estimated Time**: 1-2 hours

**Objective**: Allow admins to toggle feature flags on/off from the admin dashboard

**Steps**:
- [ ] Create `/admin/feature-flags` page
- [ ] Create API endpoint `/api/admin/feature-flags` (GET/PATCH)
- [ ] Store feature flags in database or environment (decide approach)
- [ ] Create toggle UI for each feature flag
- [ ] Add real-time updates when toggled
- [ ] Add to admin navigation

**Files to Create**:
- `app/(dashboard)/admin/feature-flags/page.tsx`
- `app/api/admin/feature-flags/route.ts`

**Files to Modify**:
- `components/navigation/app-sidebar.tsx` (add feature flags link)
- `lib/feature-flags.ts` (maybe add database support)

**Acceptance Criteria**:
- [ ] Admins can see all feature flags
- [ ] Admins can toggle flags on/off
- [ ] Changes take effect immediately
- [ ] UI shows current state clearly

---

## Task 2: Remove API Logs from Admin Navigation
**Status**: ⬜ Not Started  
**Priority**: 🟡 Medium  
**Estimated Time**: 5 minutes

**Objective**: Remove API Logs menu item from admin navigation

**Steps**:
- [ ] Remove "API Logs" from adminNavItems array

**Files to Modify**:
- `components/navigation/app-sidebar.tsx`

**Acceptance Criteria**:
- [ ] API Logs no longer appears in admin menu
- [ ] No broken links

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
  - Total revenue
  - Recent activity
- [ ] Update admin dashboard to use real data
- [ ] Add "Create Promo Code" quick action
- [ ] Add links to upload beat/pack
- [ ] Improve layout and styling

**Files to Create**:
- `app/api/admin/stats/route.ts`

**Files to Modify**:
- `app/(dashboard)/admin/page.tsx`

**Acceptance Criteria**:
- [ ] All stats show real data
- [ ] Average price calculated correctly
- [ ] Quick actions work (upload, create promo)
- [ ] Layout is clean and organized
- [ ] Mobile-responsive

---

## Task 4: Add Promo Code Management to Admin Dashboard
**Status**: ⬜ Not Started  
**Priority**: 🟡 High  
**Estimated Time**: 1 hour

**Objective**: Add quick access to promo code management from admin dashboard

**Steps**:
- [ ] Add "Promo Codes" card to admin dashboard
- [ ] Link to `/admin/promos` page
- [ ] Show recent promo codes or stats
- [ ] Add "Create New" button

**Files to Modify**:
- `app/(dashboard)/admin/page.tsx`

**Acceptance Criteria**:
- [ ] Promo code card visible on admin dashboard
- [ ] Links to promo management page
- [ ] Quick create button works

---

## Task 5: Test Promo Code System End-to-End
**Status**: ⬜ Not Started  
**Priority**: 🔴 Critical  
**Estimated Time**: 30 minutes

**Objective**: Verify promo code system works completely

**Steps**:
- [ ] Create a test promo code in admin
- [ ] Test validation endpoint
- [ ] Test redemption endpoint
- [ ] Verify $0 purchase record created
- [ ] Verify download access granted
- [ ] Test UI flow (enter code, redeem, download)

**Acceptance Criteria**:
- [ ] Can create promo code
- [ ] Validation works
- [ ] Redemption works
- [ ] Purchase record created
- [ ] Download access granted
- [ ] UI flow is smooth

---

## Implementation Order

1. **Task 2** (5 min) - Remove API logs (quick win)
2. **Task 1** (1-2 hours) - Feature flag admin UI
3. **Task 3** (3-4 hours) - Redesign admin dashboard
4. **Task 4** (1 hour) - Add promo code management
5. **Task 5** (30 min) - Test promo codes

---

## Notes

- Focus on one task at a time
- Test each task before moving to next
- Update this document as tasks are completed

