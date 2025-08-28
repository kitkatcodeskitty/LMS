import mongoose from 'mongoose';

const MIGRATION_NAME = '005_update_package_system';

// Map old package types to new ones
const PACKAGE_MAPPING = {
  'premium': 'elite',
  'elite': 'creator', 
  'supreme': 'master'
};

// New package configuration
const NEW_PACKAGE_CONFIG = {
  'elite': {
    courseLimit: 1,
    description: 'Perfect for beginners - access to 1 premium course'
  },
  'creator': {
    courseLimit: 3,
    description: 'Great for creators - access to 3 premium courses'
  },
  'prime': {
    courseLimit: 4,
    description: 'Premium choice - access to 4 premium courses'
  },
  'master': {
    courseLimit: 6,
    description: 'Ultimate learning experience - access to 6 premium courses'
  }
};

export const up = async () => {
  // Starting migration: ${MIGRATION_NAME}
  
  try {
    // Connect to MongoDB
    const Course = mongoose.model('Course');
    
    // Update existing courses with old package types
    const updateResult = await Course.updateMany(
      { packageType: { $in: Object.keys(PACKAGE_MAPPING) } },
      [
        {
          $set: {
            packageType: {
              $switch: {
                branches: [
                  { case: { $eq: ['$packageType', 'premium'] }, then: 'elite' },
                  { case: { $eq: ['$packageType', 'elite'] }, then: 'creator' },
                  { case: { $eq: ['$packageType', 'supreme'] }, then: 'master' }
                ],
                default: 'elite'
              }
            },
            courseLimit: {
              $switch: {
                branches: [
                  { case: { $eq: ['$packageType', 'premium'] }, then: 1 },
                  { case: { $eq: ['$packageType', 'elite'] }, then: 3 },
                  { case: { $eq: ['$packageType', 'supreme'] }, then: 6 }
                ],
                default: 1
              }
            }
          }
        }
      ]
    );
    
    // Updated ${updateResult.modifiedCount} courses to new package system
    
    // Verify the migration
    const courses = await Course.find({});
    // Package type distribution after migration:
    
    const packageCounts = {};
    courses.forEach(course => {
      packageCounts[course.packageType] = (packageCounts[course.packageType] || 0) + 1;
    });
    
    Object.entries(packageCounts).forEach(([type, count]) => {
              // ${type}: ${count} courses
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
    const Course = mongoose.model('Course');
    
    // Reverse mapping for rollback
    const REVERSE_MAPPING = {
      'elite': 'premium',
      'creator': 'elite',
      'master': 'supreme'
    };
    
    // Rollback to old package types
    const rollbackResult = await Course.updateMany(
      { packageType: { $in: Object.keys(REVERSE_MAPPING) } },
      [
        {
          $set: {
            packageType: {
              $switch: {
                branches: [
                  { case: { $eq: ['$packageType', 'elite'] }, then: 'premium' },
                  { case: { $eq: ['$packageType', 'creator'] }, then: 'elite' },
                  { case: { $eq: ['$packageType', 'master'] }, then: 'supreme' }
                ],
                default: 'premium'
              }
            }
          }
        },
        {
          $unset: 'courseLimit'
        }
      ]
    );
    
    // Rolled back ${rollbackResult.modifiedCount} courses to old package system
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
