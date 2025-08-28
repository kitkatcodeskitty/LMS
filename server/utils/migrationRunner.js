import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migration Runner Utility
 * Handles running database migrations in order and tracking their status
 */

// Migration tracking schema
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  executedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
  result: { type: mongoose.Schema.Types.Mixed }
});

const Migration = mongoose.model('Migration', migrationSchema);

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
  }

  /**
   * Get all migration files in order
   */
  async getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.js'))
        .sort(); // Sort to ensure order (001_, 002_, etc.)
      
      return files;
    } catch (error) {
      console.error('Error reading migrations directory:', error);
      return [];
    }
  }

  /**
   * Get completed migrations from database
   */
  async getCompletedMigrations() {
    try {
      const completed = await Migration.find({ status: 'completed' }).select('name');
      return completed.map(m => m.name);
    } catch (error) {
      console.error('Error fetching completed migrations:', error);
      return [];
    }
  }

  /**
   * Load a migration module
   */
  async loadMigration(filename) {
    try {
      const migrationPath = path.join(this.migrationsPath, filename);
      const migration = await import(`file://${migrationPath}`);
      return migration.default || migration;
    } catch (error) {
      console.error(`Error loading migration ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Run a single migration
   */
  async runMigration(migrationModule) {
    const { name, up } = migrationModule;
    
    try {
      const result = await up();
      
      // Record successful migration
      await Migration.findOneAndUpdate(
        { name },
        { 
          name,
          executedAt: new Date(),
          status: 'completed',
          result
        },
        { upsert: true }
      );

      return { success: true, result };
    } catch (error) {
      // Record failed migration
      await Migration.findOneAndUpdate(
        { name },
        { 
          name,
          executedAt: new Date(),
          status: 'failed',
          result: { error: error.message }
        },
        { upsert: true }
      );

      throw error;
    }
  }

  /**
   * Rollback a single migration
   */
  async rollbackMigration(migrationModule) {
    const { name, down } = migrationModule;
    
    if (!down) {
      return { success: false, message: 'No rollback function' };
    }

    try {
      const result = await down();
      
      // Remove migration record
      await Migration.deleteOne({ name });

      return { success: true, result };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runPendingMigrations() {
    try {
      const migrationFiles = await this.getMigrationFiles();
      const completedMigrations = await this.getCompletedMigrations();

      const pendingMigrations = migrationFiles.filter(file => {
        const migrationName = file.replace('.js', '');
        return !completedMigrations.includes(migrationName);
      });

      if (pendingMigrations.length === 0) {
        return { success: true, message: 'No pending migrations' };
      }

      const results = [];

      for (const filename of pendingMigrations) {
        try {
          const migration = await this.loadMigration(filename);
          const result = await this.runMigration(migration);
          results.push({ migration: migration.name, ...result });
        } catch (error) {
          throw error;
        }
      }

      return { success: true, results };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rollback the last migration
   */
  async rollbackLastMigration() {
    try {
      const lastMigration = await Migration.findOne({ status: 'completed' })
        .sort({ executedAt: -1 });

      if (!lastMigration) {
        return { success: true, message: 'No migrations to rollback' };
      }

      const migrationFiles = await this.getMigrationFiles();
      const filename = migrationFiles.find(file => 
        file.replace('.js', '') === lastMigration.name
      );

      if (!filename) {
        return { success: false, message: 'Migration file not found' };
      }

      const migration = await this.loadMigration(filename);
      const result = await this.rollbackMigration(migration);

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getStatus() {
    try {
      const migrationFiles = await this.getMigrationFiles();
      const completedMigrations = await this.getCompletedMigrations();

      const status = migrationFiles.map(file => {
        const name = file.replace('.js', '');
        return {
          name,
          file,
          completed: completedMigrations.includes(name)
        };
      });

      return {
        total: migrationFiles.length,
        completed: completedMigrations.length,
        pending: migrationFiles.length - completedMigrations.length,
        migrations: status
      };
    } catch (error) {
      throw error;
    }
  }
}

export default MigrationRunner;