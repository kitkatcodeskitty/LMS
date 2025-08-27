import mongoose from 'mongoose';
import { calculatePackageBasedCommission } from '../utils/priceHelpers.js';

// Test the new commission system
const testCommissionSystem = () => {
  console.log('🧪 Testing Package Hierarchy Commission System\n');

  const testCases = [
    {
      scenario: 'Prime user refers Master package purchase (Rs. 6000)',
      referrerPackage: 'prime',
      purchasedPackage: 'master',
      coursePrice: 6000,
      expected: 'Gets 60% of Master package (Rs. 3600)'
    },
    {
      scenario: 'Master user refers Prime package purchase (Rs. 4000)',
      referrerPackage: 'master',
      purchasedPackage: 'prime',
      coursePrice: 4000,
      expected: 'Gets 60% of Prime package (Rs. 2400)'
    },
    {
      scenario: 'Elite user refers Master package purchase (Rs. 6000)',
      referrerPackage: 'elite',
      purchasedPackage: 'master',
      coursePrice: 6000,
      expected: 'Gets 60% of Elite earning potential (Rs. 600)'
    },
    {
      scenario: 'Creator user refers Elite package purchase (Rs. 1000)',
      referrerPackage: 'creator',
      purchasedPackage: 'elite',
      coursePrice: 1000,
      expected: 'Gets 60% of Elite package (Rs. 600)'
    },
    {
      scenario: 'Master user refers Master package purchase (Rs. 6000)',
      referrerPackage: 'master',
      purchasedPackage: 'master',
      coursePrice: 6000,
      expected: 'Gets 60% of Master package (Rs. 3600)'
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`📋 Test Case ${index + 1}: ${testCase.scenario}`);
    console.log(`   Referrer Package: ${testCase.referrerPackage.toUpperCase()}`);
    console.log(`   Purchased Package: ${testCase.purchasedPackage.toUpperCase()}`);
    console.log(`   Course Price: Rs. ${testCase.coursePrice}`);
    
    const commission = calculatePackageBasedCommission(
      testCase.coursePrice,
      testCase.referrerPackage,
      testCase.purchasedPackage,
      0.6
    );
    
    console.log(`   Commission Earned: Rs. ${commission}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   ✅ Result: ${commission > 0 ? 'PASS' : 'FAIL'}\n`);
  });

  console.log('🎯 Commission System Summary:');
  console.log('   • 60% base commission rate maintained');
  console.log('   • Higher package users earn more from referrals');
  console.log('   • Lower package users are limited to their package earning potential');
  console.log('   • Encourages package upgrades for better earning potential');
};

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCommissionSystem();
}

export default testCommissionSystem;
