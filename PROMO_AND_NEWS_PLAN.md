# Promo Code & News/Notifications System
## Making the App Feel Alive and Active

---

## 🎯 Goals

1. **Promo Code System**: Allow users to enter codes to download free assets
2. **News/Announcements Header**: Sticky banner with latest news/updates
3. **Notifications System**: Bell icon with dropdown showing activity
4. **Activity Feed**: Show recent purchases, new releases, trending items

---

## 📋 Implementation Plan

### Phase 1: Promo Code System

#### 1.1 Database Schema
**File**: `lib/db/schema.ts`

```typescript
// Promo Codes
export const promoCodes = pgTable('promo_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 20 }).notNull(), // 'free_asset', 'percentage', 'fixed'
  discountValue: integer('discount_value'), // For percentage/fixed, null for free_asset
  assetId: integer('asset_id').references(() => beats.id), // For free_asset type
  assetType: varchar('asset_type', { length: 20 }).notNull().default('beat'), // 'beat' or 'pack'
  maxUses: integer('max_uses'), // null = unlimited
  usesCount: integer('uses_count').notNull().default(0),
  validFrom: timestamp('valid_from').notNull().defaultNow(),
  validUntil: timestamp('valid_until'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Promo Code Redemptions
export const promoCodeRedemptions = pgTable('promo_code_redemptions', {
  id: serial('id').primaryKey(),
  promoCodeId: integer('promo_code_id')
    .notNull()
    .references(() => promoCodes.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  assetId: integer('asset_id')
    .notNull()
    .references(() => beats.id),
  redeemedAt: timestamp('redeemed_at').notNull().defaultNow(),
});
```

#### 1.2 API Endpoints
**Files to Create**:
- `app/api/promo/validate/route.ts` - Validate promo code
- `app/api/promo/redeem/route.ts` - Redeem promo code and grant download access

#### 1.3 UI Components
**Files to Create**:
- `components/dashboard/promo/promo-code-input.tsx` - Promo code input with validation
- `components/dashboard/promo/promo-banner.tsx` - Sticky banner for promo codes

---

### Phase 2: News & Announcements System

#### 2.1 Database Schema
**File**: `lib/db/schema.ts`

```typescript
// Announcements
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 20 }).notNull().default('info'), // 'info', 'success', 'warning', 'promo'
  priority: integer('priority').notNull().default(0), // Higher = more important
  isActive: integer('is_active').notNull().default(1),
  showUntil: timestamp('show_until'),
  linkUrl: text('link_url'),
  linkText: varchar('link_text', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User Dismissed Announcements
export const dismissedAnnouncements = pgTable('dismissed_announcements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  announcementId: integer('announcement_id')
    .notNull()
    .references(() => announcements.id),
  dismissedAt: timestamp('dismissed_at').notNull().defaultNow(),
  primaryKey: primaryKey({ columns: [userId, announcementId] }),
});
```

#### 2.2 API Endpoints
**Files to Create**:
- `app/api/announcements/route.ts` - Get active announcements
- `app/api/announcements/dismiss/route.ts` - Dismiss announcement

#### 2.3 UI Components
**Files to Create**:
- `components/dashboard/news/news-banner.tsx` - Sticky news banner
- `components/dashboard/news/announcement-card.tsx` - Individual announcement card

---

### Phase 3: Notifications System

#### 3.1 Database Schema
**File**: `lib/db/schema.ts`

```typescript
// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(), // 'new_release', 'purchase', 'trending', 'promo'
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  linkUrl: text('link_url'),
  isRead: integer('is_read').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

#### 3.2 API Endpoints
**Files to Create**:
- `app/api/notifications/route.ts` - Get user notifications
- `app/api/notifications/[id]/read/route.ts` - Mark notification as read
- `app/api/notifications/read-all/route.ts` - Mark all as read

#### 3.3 UI Components
**Files to Create**:
- `components/dashboard/notifications/notification-bell.tsx` - Bell icon with badge
- `components/dashboard/notifications/notification-dropdown.tsx` - Dropdown with notifications list

---

### Phase 4: Activity Feed

#### 4.1 Data Sources
- Recent purchases (from `purchases` table)
- New releases (from `beats` table, `createdAt`)
- Trending items (based on download count)
- Promo code redemptions

#### 4.2 UI Components
**Files to Create**:
- `components/dashboard/activity/activity-feed.tsx` - Activity feed component
- `components/dashboard/activity/activity-item.tsx` - Individual activity item

---

## 🎨 Design Specifications

### Promo Code Input
- **Location**: Sticky banner at top or in header
- **Design**: 
  - Gift icon + input field + "Apply" button
  - Green checkmark when valid
  - Error message when invalid
  - Success state shows what asset is unlocked
- **Mobile**: Full-width banner, dismissible

### News Banner
- **Location**: Below header, sticky top
- **Design**:
  - Rotating announcements (auto-rotate every 5 seconds)
  - Dismissible (X button)
  - Color-coded by type (info=blue, success=green, warning=amber, promo=purple)
  - Optional link button
- **Mobile**: Full-width, scrollable if multiple

### Notifications Bell
- **Location**: Header, next to user menu
- **Design**:
  - Bell icon with red badge (unread count)
  - Dropdown shows last 10 notifications
  - "Mark all as read" button
  - Click notification to navigate
- **Mobile**: In header, accessible

---

## 🚀 Implementation Order

1. **Promo Code System** (Core feature)
   - Database schema
   - API endpoints
   - UI component
   - Download access logic

2. **News Banner** (Quick win for "alive" feeling)
   - Database schema
   - API endpoint
   - UI component
   - Admin interface (future)

3. **Notifications System** (Engagement)
   - Database schema
   - API endpoints
   - UI components
   - Auto-create notifications (new releases, etc.)

4. **Activity Feed** (Social proof)
   - Query logic
   - UI components
   - Real-time updates (future)

---

## 📝 Next Steps

1. Create database migration for promo codes
2. Create database migration for announcements
3. Create database migration for notifications
4. Implement API endpoints
5. Create UI components
6. Integrate into dashboard layout
7. Test end-to-end flow

---

**Status**: Ready for Implementation  
**Priority**: High (Core feature + Engagement)

