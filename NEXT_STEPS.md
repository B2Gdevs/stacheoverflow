# Next Steps & Task Prioritization

## ✅ Completed
- ✅ Fixed image loading (using imageUrl from API, no more 401 errors)
- ✅ Cleaned up upload-files-step component (mobile-friendly, responsive)
- ✅ Removed console.logs (none found - already clean)

---

## 🔴 Critical Priority Tasks

### 1. Admin User Impersonation Tool (Task 6)
**Priority**: 🔴 CRITICAL - Needed before testing purchases  
**Time**: 2-3 hours  
**Why**: Essential for testing purchase flows without constant sign-in/out

**What to build**:
- API endpoint `/api/admin/impersonate` (POST/DELETE)
- Admin UI to search/select user
- Impersonation banner (clear visual indicator)
- Works with Supabase OAuth sessions
- Add to admin dashboard quick actions

**Files to create**:
- `app/api/admin/impersonate/route.ts`
- `app/(dashboard)/admin/impersonate/page.tsx`
- `components/admin/impersonation-banner.tsx`

**Files to modify**:
- `lib/db/queries.ts` (add impersonation check)
- `app/(dashboard)/admin/page.tsx` (add quick action)
- `app/(dashboard)/layout.tsx` (show banner)

---

### 2. Verify Purchase Flow End-to-End (Task 1)
**Priority**: 🔴 CRITICAL  
**Time**: 1-2 hours  
**Why**: Core functionality - users need to be able to purchase beats

**What to verify**:
- Stripe checkout flow works
- Purchase record created in database
- Download access granted after purchase
- Download functionality works
- Purchase appears in history

**Files to check**:
- `app/api/purchases/route.ts`
- `lib/stripe/subscriptions.ts`
- Download API endpoints

---

### 3. Verify Download System (Task 3)
**Priority**: 🔴 CRITICAL  
**Time**: 1-2 hours  
**Why**: Users need to download what they purchase

**What to verify**:
- `canUserDownload()` checks purchases (not subscriptions when disabled)
- Download API endpoint works
- Files download correctly
- Works with both paid and promo code purchases

---

## 🟡 High Priority Tasks

### 4. Create Purchase History Page (Task 2)
**Priority**: 🟡 HIGH  
**Time**: 2-3 hours  
**Why**: Users need to see what they've purchased

**What to build**:
- `/marketplace/purchases` page
- API endpoint `/api/user/purchases`
- Display: beat/pack name, image, date, amount (or "Free"), download buttons
- Add to navigation menu

---

### 5. Test Promo Code Integration (Task 5)
**Priority**: 🟡 HIGH  
**Time**: 1 hour  
**Why**: Verify promo codes work with purchase system

**What to test**:
- Promo code redemption
- $0 purchase record creation
- Download access granted
- Duplicate redemption prevention
- Shows in purchase history

---

## 🟢 Medium Priority Tasks

### 6. Add Purchase Indicators to Beat Cards (Task 4)
**Priority**: 🟢 MEDIUM  
**Time**: 1-2 hours  
**Why**: Better UX - show users what they own

**What to add**:
- "Purchased" badge on beat cards
- "Download" button for purchased beats
- Visual distinction for owned vs. available

---

### 7. Admin User Management & Purchase History (Admin Task 4)
**Priority**: 🟢 MEDIUM  
**Time**: 4-5 hours  
**Why**: Admins need to manage users and see purchase history

**What to build**:
- Enhanced `/admin/users` page
- Search/filter users
- View user details
- Edit user role
- Purchase history view per user

---

## 📋 Recommended Implementation Order

1. **Task 6: Impersonation Tool** (2-3 hours) - CRITICAL for testing
2. **Task 1: Verify Purchase Flow** (1-2 hours) - Core functionality
3. **Task 3: Verify Downloads** (1-2 hours) - Core functionality
4. **Task 2: Purchase History** (2-3 hours) - User-facing feature
5. **Task 5: Test Promo Integration** (1 hour) - Verification
6. **Task 4: Purchase Indicators** (1-2 hours) - UX improvement
7. **Admin Task 4: User Management** (4-5 hours) - Admin tool

**Total Estimated Time**: ~12-18 hours

---

## 🎯 Immediate Next Step

**Start with Task 6: Admin User Impersonation Tool**

This is critical because:
- You need to test purchases without constant sign-in/out
- It will make all subsequent testing much easier
- It's a foundational tool for admin workflow

Once impersonation is built, you can:
- Test purchase flows as different users
- Verify download access works
- Test promo code redemptions
- All without manual account switching

---

## 📝 Notes

- Focus on one task at a time
- Test each task before moving to next
- Update task documents as you complete them
- Ask for approval before starting next task
- Keep code clean and avoid vestigial code

