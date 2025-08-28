import mongoose from "mongoose";
import User from "../models/User.js";



const migrationName = "001_add_withdrawal_fields_to_users";

export const up = async () => {
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
    
    return {
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Added withdrawal fields to ${result.modifiedCount} users`
    };
  } catch (error) {
    throw error;
  }
};

export const down = async () => {
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
    
    return {
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Removed withdrawal fields from ${result.modifiedCount} users`
    };
  } catch (error) {
    throw error;
  }
};

export default {
  name: migrationName,
  up,
  down
};