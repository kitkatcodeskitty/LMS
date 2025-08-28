# Database Migrations

This directory contains database migration scripts for the LMS application.

## Available Migrations

### 1. `001_initial_setup.js`
- **Purpose**: Initial database setup and basic collections
- **Status**: ✅ Ready to run

### 2. `002_add_affiliate_system.js`
- **Purpose**: Add affiliate system fields to User and Purchase models
- **Status**: ✅ Ready to run

### 3. `003_add_kyc_system.js`
- **Purpose**: Add KYC (Know Your Customer) system fields to User model
- **Status**: ✅ Ready to run

### 4. `004_add_notification_system.js`
- **Purpose**: Add notification system fields to User model
- **Status**: ✅ Ready to run

### 5. `005_update_package_system.js`
- **Purpose**: Update package system from old types to new Elite, Creator, Prime, Master system
- **Changes**:
  - Maps old package types: `premium` → `elite`, `elite` → `creator`, `supreme` → `master`
  - Adds `courseLimit` field based on package type
  - Updates commission rate to 60%
- **Status**: ✅ Ready to run

### 6. `006_add_profile_edit_restriction.js` ⭐ **NEW**
- **Purpose**: Add profile edit restriction system to prevent users from editing profiles multiple times
- **Changes**:
  - Adds `hasEditedProfile` boolean field (default: false)
  - Adds `profileEditDate` date field (default: null)
  - Prevents users from editing profile after first edit
  - Requires admin approval for additional changes
- **Status**: ✅ Ready to run

### 7. `007_add_package_hierarchy_commission.js` 🆕 **BRAND NEW**
- **Purpose**: Implement new package hierarchy-based commission system
- **Changes**:
  - Adds `highestPackage` field to User model to track user's highest purchased package
  - Implements new commission logic: 60% commission based on package hierarchy
  - If referrer has higher/equal package: gets 60% of purchased package price
  - If referrer has lower package: gets 60% of their own package's earning potential
  - Updates existing users with their highest package based on enrolled courses
- **Status**: ✅ Ready to run

## Running Migrations

### Manual Migration Commands

To run migrations manually, you can use the following commands in your server directory:

```bash
# Run the package system update migration
node -e "
const mongoose = require('mongoose');
const migration = require('./migrations/005_update_package_system.js');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => migration.up())
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
"

# Run the profile edit restriction migration
node -e "
const mongoose = require('mongoose');
const migration = require('./migrations/006_add_profile_edit_restriction.js');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => migration.up())
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
"

# Run the package hierarchy commission migration
node -e "
const mongoose = require('mongoose');
const migration = require('./migrations/007_add_package_hierarchy_commission.js');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => migration.up())
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
"
```

### Using Migration Runner
```bash
cd server
node utils/migrationRunner.js
```

## Rollback

To rollback the package system migration:
```bash
cd server
node -e "
import('./migrations/005_update_package_system.js').then(async (migration) => {
  try {
    await migration.down();
    console.log('Rollback completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
});
"
```

## Package System Details

### New Package Structure
| Package | Course Limit | Description | Earning Range |
|---------|--------------|-------------|---------------|
| Elite | 1 | Perfect for beginners | Rs 500 - Rs 1,000 |
| Creator | 3 | Great for creators | Rs 1,500 - Rs 3,000 |
| Prime | 4 | Premium choice | Rs 2,000 - Rs 4,000 |
| Master | 6 | Ultimate experience | Rs 3,000 - Rs 6,000 |

### Commission Rate
- **Old Rate**: 50% (0.5)
- **New Rate**: 60% (0.6)
- **Impact**: Increased affiliate earnings for all packages

### Database Changes
- `Course.packageType`: Updated enum values
- `Course.courseLimit`: New field with package-specific defaults
- `Purchase.commissionRate`: Updated default to 0.6

## New Commission System (Migration 007)

### Package Hierarchy Commission Logic
The new system implements intelligent commission calculation based on package hierarchy:

1. **Higher Package Referrer**: If a user with a higher package refers someone buying a lower package, they get 60% of the purchased package price.

2. **Lower Package Referrer**: If a user with a lower package refers someone buying a higher package, they get 60% of their own package's earning potential.

3. **Equal Package Referrer**: If both referrer and purchaser have the same package level, the referrer gets 60% of the purchased package price.

### Example Scenarios
- **Prime user refers Master purchase**: Gets 60% of Master package price
- **Master user refers Prime purchase**: Gets 60% of Prime package price  
- **Elite user refers Master purchase**: Gets 60% of Elite package earning potential
- **Creator user refers Elite purchase**: Gets 60% of Elite package price

### Database Changes
- `User.highestPackage`: New field tracking user's highest purchased package
- Commission calculation now considers package hierarchy
- Existing users automatically updated based on their enrolled courses

### Benefits
- Encourages users to upgrade to higher packages for better earning potential
- Fair commission distribution based on investment level
- Maintains 60% commission rate while adding intelligence to the system