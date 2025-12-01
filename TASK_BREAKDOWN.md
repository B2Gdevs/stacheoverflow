# Task Breakdown - Purchase & Download System

## Current Status
- ✅ Feature flag system created
- ✅ Subscription features hidden when disabled
- ✅ Promo code system working
- ✅ Purchase records created for Stripe purchases
- ✅ Purchase records created for promo code redemptions ($0)
- ⚠️ SWR cache error fixed

## Remaining Tasks

### Task 1: Verify Purchase Flow Works End-to-End
**Status**: ⬜ Not Started  
**Priority**: 🔴 Critical  
**Estimated Time**: 1-2 hours

**Objective**: Ensure users can purchase beats via Stripe and get download access

**Steps**:
- [ ] Test Stripe checkout flow
- [ ] Verify purchase record is created in database
- [ ] Verify download access is granted after purchase
- [ ] Test download functionality for purchased beats
- [ ] Verify purchase appears in user's purchase history

**Files to Check**:
- `app/api/purchases/route.ts`
- `lib/stripe/subscriptions.ts` (purchase functions)
- Download API endpoints

**Acceptance Criteria**:
- [ ] User can complete Stripe checkout
- [ ] Purchase record created with correct amount
- [ ] User can download purchased beat immediately
- [ ] Download access persists (permanent)

---

### Task 2: Create Purchase History Page
**Status**: ⬜ Not Started  
**Priority**: 🟡 High  
**Estimated Time**: 2-3 hours

**Objective**: Show users their purchase history (paid + promo codes)

**Steps**:
- [ ] Create `/marketplace/purchases` page
- [ ] Create API endpoint `/api/user/purchases`
- [ ] Display list of purchases with:
  - Beat/pack name and image
  - Purchase date
  - Amount paid (or "Free" for promo codes)
  - Download buttons
- [ ] Add to navigation menu

**Files to Create**:
- `app/(dashboard)/marketplace/purchases/page.tsx`
- `app/api/user/purchases/route.ts`

**Files to Modify**:
- `components/navigation/app-sidebar.tsx` (add purchases link)

**Acceptance Criteria**:
- [ ] Page shows all user purchases
- [ ] Paid purchases show amount
- [ ] Promo code purchases show "Free"
- [ ] Download buttons work for all purchases
- [ ] Mobile-responsive design

---

### Task 3: Verify Download System Works
**Status**: ⬜ Not Started  
**Priority**: 🔴 Critical  
**Estimated Time**: 1-2 hours

**Objective**: Ensure download system checks purchases correctly

**Steps**:
- [ ] Test `canUserDownload()` function
- [ ] Verify it checks purchases (not subscriptions when disabled)
- [ ] Test download API endpoint
- [ ] Verify file downloads work correctly
- [ ] Test with both paid and promo code purchases

**Files to Check**:
- `lib/stripe/subscriptions.ts` (`canUserDownload` function)
- `app/api/files/[...path]/route.ts` (download endpoint)

**Acceptance Criteria**:
- [ ] Download check works for purchases
- [ ] Download check skips subscriptions when feature disabled
- [ ] Files download correctly
- [ ] Download history is recorded

---

### Task 4: Add Purchase Indicators to Beat Cards
**Status**: ⬜ Not Started  
**Priority**: 🟡 Medium  
**Estimated Time**: 1-2 hours

**Objective**: Show users which beats they've purchased

**Steps**:
- [ ] Add "Purchased" badge to beat cards
- [ ] Add "Download" button for purchased beats
- [ ] Check purchase status when rendering cards
- [ ] Update card styling for purchased items

**Files to Modify**:
- `components/dashboard/grid/beat-card.tsx`
- `components/dashboard/grid/pack-card.tsx`

**Acceptance Criteria**:
- [ ] Purchased beats show "Purchased" badge
- [ ] Download button visible for purchased beats
- [ ] Visual distinction for owned vs. available beats
- [ ] Mobile-responsive

---

### Task 5: Test Promo Code + Purchase Integration
**Status**: ⬜ Not Started  
**Priority**: 🟡 High  
**Estimated Time**: 1 hour

**Objective**: Verify promo codes work correctly with purchase system

**Steps**:
- [ ] Test promo code redemption
- [ ] Verify $0 purchase record is created
- [ ] Verify download access is granted
- [ ] Test that user can't redeem same code twice
- [ ] Verify promo code purchase appears in history

**Files to Check**:
- `app/api/promo/redeem/route.ts`
- `app/api/promo/validate/route.ts`

**Acceptance Criteria**:
- [ ] Promo codes create purchase records
- [ ] Download access granted immediately
- [ ] Duplicate redemption prevented
- [ ] Shows in purchase history

---

### Task 6: Admin User Impersonation Tool
**Status**: ⬜ Not Started  
**Priority**: 🔴 Critical (Before Testing Purchases)  
**Estimated Time**: 2-3 hours

**Objective**: Allow admins to impersonate users for testing purchases and user experience

**Steps**:
- [ ] Create API endpoint `/api/admin/impersonate` (POST/DELETE)
- [ ] Add impersonation state to session/context
- [ ] Create admin UI to search and select user to impersonate
- [ ] Show clear banner when impersonating (with "Stop Impersonating" button)
- [ ] Ensure impersonation works with Supabase OAuth sessions
- [ ] Add to admin dashboard quick actions

**Files to Create**:
- `app/api/admin/impersonate/route.ts`
- `app/(dashboard)/admin/impersonate/page.tsx`
- `components/admin/impersonation-banner.tsx`

**Files to Modify**:
- `lib/db/queries.ts` (add impersonation check to getUser)
- `app/(dashboard)/admin/page.tsx` (add impersonation quick action)
- `app/(dashboard)/layout.tsx` (show impersonation banner)

**Acceptance Criteria**:
- [ ] Admin can search for users by email/name
- [ ] Admin can start impersonation with one click
- [ ] Clear visual indicator when impersonating
- [ ] All API routes respect impersonation (act as that user)
- [ ] Can stop impersonation easily
- [ ] Works with both OAuth and email/password users

**Security Considerations**:
- Only admins can impersonate
- Log all impersonation actions
- Clear session on logout
- Prevent impersonating other admins (optional)

---

## Next Steps

1. **Start with Task 6** - Build impersonation tool (CRITICAL - needed before testing)
2. **Then Task 1** - Verify the purchase flow works
3. **Then Task 3** - Ensure downloads work
4. **Then Task 2** - Create purchase history page
5. **Then Task 4** - Add purchase indicators
6. **Finally Task 5** - Test integration

---

## Notes

- Focus on one task at a time
- Test each task before moving to next
- Update this document as tasks are completed
- Ask for approval before starting next task

