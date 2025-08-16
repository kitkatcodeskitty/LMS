import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * Migration: Add withdrawal-related fields to existing User documents
 * This migration adds withdrawableBalance, totalWithdrawn, and pendingWithdrawals fields
 * to existing users who don't have these fields.
 */

const migrationName = "001_add_withdrawal_fields_to_users";

export const up = async () => {
  console.log(`Running migration: ${migrationName}`);
  
  try {
    // Update all users who don't have the new withdrawal fields
    const result = await User.updateMany(
      {
        $or: [
          { withdrawableBalance: { $exists: false } },
          { totalWithdrawn: { $exists: false } },
          { pendingWithdrawals: { $exists: false } }
        ]
      },
      {
        $set: {
          withdrawableBalance: 0,
          totalWithdrawn: 0,
          pendingWithdrawals: 0
        }
      }
    );

    console.log(`Migration ${migrationName} completed successfully.`);
    console.log(`Updated ${result.modifiedCount} user documents.`);
    
    return {
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Added withdrawal fields to ${result.modifiedCount} users`
    };
  } catch (error) {
    console.error(`Migration ${migrationName} failed:`, error);
    throw error;
  }
};

export const down = async () => {
  console.log(`Rolling back migration: ${migrationName}`);
  
  try {
    // Remove the withdrawal fields from all users
    const result = await User.updateMany(
      {},
      {
        $unset: {
          withdrawableBalance: "",
          totalWithdrawn: "",
          pendingWithdrawals: ""
        }
      }
    );

    console.log(`Rollback ${migrationName} completed successfully.`);
    console.log(`Removed withdrawal fields from ${result.modifiedCount} user documents.`);
    
    return {
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Removed withdrawal fields from ${result.modifiedCount} users`
    };
  } catch (error) {
    console.error(`Rollback ${migrationName} failed:`, error);
    throw error;
  }
};

export default {
  name: migrationName,
  up,
  down
};