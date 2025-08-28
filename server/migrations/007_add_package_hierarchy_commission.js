import mongoose from 'mongoose';

const MIGRATION_NAME = '007_add_package_hierarchy_commission';

export const up = async () => {
  // Starting migration: ${MIGRATION_NAME}
  
  try {
    // Connect to MongoDB
    const User = mongoose.model('User');
    const Course = mongoose.model('Course');
    
    // Updating existing users with their highest purchased package...
    
    // Get all users who have enrolled courses
    const users = await User.find({ enrolledCourses: { $exists: true, $ne: [] } });
          // Found ${users.length} users with enrolled courses
    
    let updatedUsers = 0;
    
    for (const user of users) {
      try {
        // Get all courses enrolled by this user
        const enrolledCourses = await Course.find({ 
          _id: { $in: user.enrolledCourses } 
        }).select('packageType');
        
        if (enrolledCourses.length > 0) {
          // Find the highest package among enrolled courses
          const packageHierarchy = {
            'elite': 1,
            'creator': 2,
            'prime': 3,
            'master': 4
          };
          
          let highestPackage = null;
          let highestValue = 0;
          
          enrolledCourses.forEach(course => {
            const packageValue = packageHierarchy[course.packageType] || 0;
            if (packageValue > highestValue) {
              highestValue = packageValue;
              highestPackage = course.packageType;
            }
          });
          
          // Update user's highest package if it's different
          if (highestPackage && user.highestPackage !== highestPackage) {
            user.highestPackage = highestPackage;
            await user.save();
            updatedUsers++;
            // Updated user ${user.email} with highest package: ${highestPackage}
          }
        }
      } catch (error) {
        console.error(`Error updating user ${user._id}:`, error.message);
      }
    }
    
    // Updated ${updatedUsers} users with their highest package
    
    // Verify the migration
    const usersWithPackages = await User.find({ highestPackage: { $exists: true, $ne: null } });
    // Package distribution after migration:
    
    const packageCounts = {};
    usersWithPackages.forEach(user => {
      packageCounts[user.highestPackage] = (packageCounts[user.highestPackage] || 0) + 1;
    });
    
    Object.entries(packageCounts).forEach(([type, count]) => {
              // ${type}: ${count} users
    });
    
    // Migration ${MIGRATION_NAME} completed successfully
    
  } catch (error) {
    console.error(`❌ Migration ${MIGRATION_NAME} failed:`, error);
    throw error;
  }
};

export const down = async () => {
      // Rolling back migration: ${MIGRATION_NAME}
  
  try {
    // Connect to MongoDB
    const User = mongoose.model('User');
    
    // Remove the highestPackage field from all users
    const rollbackResult = await User.updateMany(
      { highestPackage: { $exists: true } },
      { $unset: { highestPackage: 1 } }
    );
    
    // Removed highestPackage field from ${rollbackResult.modifiedCount} users
    // Rollback of migration ${MIGRATION_NAME} completed successfully
    
  } catch (error) {
    console.error(`❌ Rollback of migration ${MIGRATION_NAME} failed:`, error);
    throw error;
  }
};

export default {
  name: MIGRATION_NAME,
  up,
  down
};
