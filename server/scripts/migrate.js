#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";
import MigrationRunner from "../utils/migrationRunner.js";


dotenv.config();



const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB disconnection failed:', error);
  }
};

const main = async () => {
  const command = process.argv[2] || 'up';
  const runner = new MigrationRunner();

  try {
    await connectDB();

    switch (command) {
      case 'up':
      case 'run':
        await runner.runPendingMigrations();
        break;

      case 'down':
      case 'rollback':
        await runner.rollbackLastMigration();
        break;

      case 'status':
        const status = await runner.getStatus();
        console.log('\n📊 Migration Status:');
        console.log(`Total migrations: ${status.total}`);
        console.log(`Completed: ${status.completed}`);
        console.log(`Pending: ${status.pending}\n`);

        console.log('📋 Migration Details:');
        status.migrations.forEach(migration => {
          const icon = migration.completed ? '✅' : '⏳';
          console.log(`  ${icon} ${migration.name}`);
        });
        break;

      default:
        console.log('❓ Unknown command. Available commands:');
        console.log('  up, run     - Run all pending migrations');
        console.log('  down, rollback - Rollback last migration');
        console.log('  status      - Show migration status');
        process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Migration interrupted');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Migration terminated');
  await disconnectDB();
  process.exit(0);
});

// Run the script
main();