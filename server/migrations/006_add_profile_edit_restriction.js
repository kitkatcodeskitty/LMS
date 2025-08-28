import mongoose from 'mongoose';

const MIGRATION_NAME = '006_add_profile_edit_restriction';

export const up = async () => {
  try {
    // Starting migration: ${MIGRATION_NAME}
    
    // Get the User model
    const User = mongoose.model('User');
    
    // Add the new fields to all existing users
    const result = await User.updateMany(
      { 
        hasEditedProfile: { $exists: false },
        profileEditDate: { $exists: false }
      },
      {
        $set: {
          hasEditedProfile: false,
          profileEditDate: null
        }
      }
    );
    
    // Migration ${MIGRATION_NAME} completed successfully
    // Updated ${result.modifiedCount} users with profile edit restriction fields
    
    return {
      success: true,
      message: `Migration ${MIGRATION_NAME} completed successfully`,
      updatedUsers: result.modifiedCount
    };
  } catch (error) {
    console.error(`❌ Migration ${MIGRATION_NAME} failed:`, error);
    throw error;
  }
};

export const down = async () => {
  try {
    // Rolling back migration: ${MIGRATION_NAME}
    
    // Get the User model
    const User = mongoose.model('User');
    
    // Remove the new fields from all users
    const result = await User.updateMany(
      {},
      {
        $unset: {
          hasEditedProfile: "",
          profileEditDate: ""
        }
      }
    );
    
    // Rollback of ${MIGRATION_NAME} completed successfully
    // Removed profile edit restriction fields from ${result.modifiedCount} users
    
    return {
      success: true,
      message: `Rollback of ${MIGRATION_NAME} completed successfully`,
      updatedUsers: result.modifiedCount
    };
  } catch (error) {
    console.error(`❌ Rollback of ${MIGRATION_NAME} failed:`, error);
    throw error;
  }
};

export default {
  name: MIGRATION_NAME,
  up,
  down
};
