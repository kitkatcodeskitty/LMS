# Database Migrations

This directory contains database migration scripts for the LMS withdrawal system. Migrations are used to safely update the database schema and data while maintaining data integrity.

## Migration Files

### 001_add_withdrawal_fields_to_users.js
Adds withdrawal-related fields to existing User documents:
- `withdrawableBalance`: Amount available for withdrawal (Number, default: 0)
- `totalWithdrawn`: Total amount withdrawn by user (Number, default: 0)
- `pendingWithdrawals`: Amount in pending withdrawal requests (Number, default: 0)

### 002_create_withdrawal_indexes.js
Creates database indexes for efficient withdrawal queries:

**Withdrawal Collection Indexes:**
- Single field indexes: `userId`, `status`, `createdAt`, `processedAt`, `transactionReference`
- Compound indexes for admin queries: `{userId, status}`, `{status, createdAt}`, `{status, processedAt}`
- Filtering indexes: `{status, amount}`, `{status, method, createdAt}`

**User Collection Indexes:**
- Balance-related indexes: `withdrawableBalance`, `totalWithdrawn`, `pendingWithdrawals`
- Compound indexes: `{affiliateEarnings, withdrawableBalance}`, `{pendingWithdrawals, withdrawableBalance}`

### 003_migrate_existing_user_balances.js
Migrates existing user data to set initial withdrawable balance values:
- Calculates withdrawable balance as 50% of current affiliate earnings
- Sets initial values for users without earnings
- Maintains data integrity during the migration process

## Running Migrations

### Prerequisites
- MongoDB connection configured in `.env` file
- Node.js environment set up

### Commands

```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback the last migration
npm run migrate:rollback
```

### Manual Migration Runner

You can also run migrations manually using the migration runner:

```javascript
import MigrationRunner from './utils/migrationRunner.js';
import connectDB from './configs/mongodb.js';

const runner = new MigrationRunner();

// Connect to database
await connectDB();

// Run all pending migrations
await runner.runPendingMigrations();

// Check status
const status = await runner.getStatus();
console.log(status);

// Rollback last migration
await runner.rollbackLastMigration();
```

## Migration Structure

Each migration file should export:

```javascript
export const up = async () => {
  // Migration logic
  return { success: true, message: 'Migration completed' };
};

export const down = async () => {
  // Rollback logic (optional)
  return { success: true, message: 'Rollback completed' };
};

export default {
  name: 'migration_name',
  up,
  down
};
```

## Migration Tracking

Migrations are tracked in the `migrations` collection with the following schema:

```javascript
{
  name: String,           // Migration name
  executedAt: Date,       // When migration was executed
  status: String,         // 'completed' or 'failed'
  result: Mixed          // Migration result data
}
```

## Best Practices

1. **Naming Convention**: Use numbered prefixes (001_, 002_, etc.) to ensure proper execution order
2. **Idempotency**: Migrations should be safe to run multiple times
3. **Rollback Support**: Provide rollback functions when possible
4. **Data Validation**: Validate data before and after migrations
5. **Error Handling**: Handle errors gracefully and provide meaningful messages
6. **Testing**: Write comprehensive tests for each migration

## Testing

Migration tests are located in `tests/migrations/`:

```bash
# Run migration tests
npm test tests/migrations/

# Run specific migration test
npm test tests/migrations/userMigration.test.js
```

## Troubleshooting

### Common Issues

1. **Connection Errors**: Ensure MongoDB is running and connection string is correct
2. **Permission Errors**: Ensure database user has necessary permissions
3. **Index Creation Failures**: Check for existing indexes or naming conflicts
4. **Data Validation Errors**: Verify data integrity before running migrations

### Recovery

If a migration fails:

1. Check the error message and logs
2. Fix the underlying issue
3. Run the migration again (migrations are idempotent)
4. If necessary, rollback and fix the migration code

### Monitoring

Monitor migration execution:

```bash
# Check current status
npm run migrate:status

# View migration logs
tail -f logs/migration.log
```

## Production Deployment

For production deployments:

1. **Backup Database**: Always backup before running migrations
2. **Test Migrations**: Run migrations on staging environment first
3. **Maintenance Mode**: Consider putting application in maintenance mode
4. **Monitor Performance**: Watch for performance impact during migration
5. **Rollback Plan**: Have a rollback plan ready

### Example Production Workflow

```bash
# 1. Backup database
mongodump --uri="mongodb://..." --out=backup-$(date +%Y%m%d)

# 2. Check migration status
npm run migrate:status

# 3. Run migrations
npm run migrate

# 4. Verify results
npm run migrate:status

# 5. Test application functionality
```

## Security Considerations

1. **Access Control**: Limit migration execution to authorized personnel
2. **Audit Trail**: All migrations are logged with timestamps
3. **Data Validation**: Validate sensitive data during migrations
4. **Environment Separation**: Use different databases for different environments

## Performance Considerations

1. **Index Creation**: Large collections may take time to index
2. **Data Migration**: Large datasets may require batching
3. **Connection Pooling**: Use appropriate connection settings
4. **Resource Monitoring**: Monitor CPU and memory usage during migrations

For questions or issues, refer to the development team or create an issue in the project repository.