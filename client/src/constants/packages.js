export const PACKAGE_TYPES = {
  ELITE: 'elite',
  CREATOR: 'creator',
  PRIME: 'prime',
  MASTER: 'master'
};

export const PACKAGE_CONFIG = {
  [PACKAGE_TYPES.ELITE]: {
    name: 'Elite Package',
    courseLimit: 1,
    defaultPrice: 1000,
    description: `<h2>🚀 Elite Package - Your Gateway to Premium Learning</h2>
    
    <p><strong>Perfect for beginners and individual learners</strong> who want to start their journey with a single, high-quality course. This package is designed to give you a taste of our premium learning experience without overwhelming you with too many options.</p>
    
    <h3>🎯 What You'll Get:</h3>
    <ul>
      <li><strong>Access to 1 Premium Course:</strong> Choose from our carefully curated selection of top-tier courses taught by industry experts</li>
      <li><strong>Lifetime Access:</strong> Learn at your own pace with no time restrictions - revisit content whenever you need</li>
      <li><strong>Certificate of Completion:</strong> Earn a professional certificate to showcase your new skills on your resume and LinkedIn</li>
      <li><strong>24/7 Support:</strong> Get help whenever you need it with our round-the-clock customer support team</li>
      <li><strong>High-Quality Content:</strong> Access to professionally produced video lectures, downloadable resources, and practical exercises</li>
      <li><strong>Mobile-Friendly Learning:</strong> Study on any device - desktop, tablet, or smartphone</li>
    </ul>
    
    <h3>💡 Perfect For:</h3>
    <ul>
      <li>Beginners exploring a new field</li>
      <li>Professionals looking to upskill in a specific area</li>
      <li>Students wanting to supplement their formal education</li>
      <li>Anyone seeking to learn a new skill or hobby</li>
    </ul>
    
    <p><em>Start your learning journey today with our Elite Package and discover the power of premium online education!</em></p>`,
    features: [
      'Access to 1 premium course',
      'Lifetime access',
      'Certificate of completion',
      '24/7 support'
    ],
    color: 'blue',
    icon: '⭐',
    earningRange: 'Rs. 500 - Rs. 1,000',
    badge: 'BASIC',
    badgeColor: 'bg-blue-500 text-white',
    title: 'Elite Package',
    courseCount: '1 Premium Course',
    styling: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl shadow-gray-500/15 hover:shadow-2xl hover:shadow-gray-500/25'
  },
  [PACKAGE_TYPES.CREATOR]: {
    name: 'Creator Package',
    courseLimit: 3,
    defaultPrice: 2000,
    description: `<h2>🎨 Creator Package - Unleash Your Creative Potential</h2>
    
    <p><strong>Ideal for creators, entrepreneurs, and professionals</strong> who want to build a solid foundation across multiple disciplines. This package gives you the flexibility to explore different areas while building a comprehensive skill set that can transform your career.</p>
    
    <h3>🎯 What You'll Get:</h3>
    <ul>
      <li><strong>Access to 3 Premium Courses:</strong> Choose from our extensive library of courses covering various creative and professional domains</li>
      <li><strong>Lifetime Access:</strong> Learn at your own pace with no time restrictions - perfect for busy professionals</li>
      <li><strong>Certificate of Completion:</strong> Earn professional certificates for each completed course to enhance your portfolio</li>
      <li><strong>24/7 Support:</strong> Get expert help whenever you need it with our dedicated support team</li>
      <li><strong>Priority Customer Service:</strong> Enjoy faster response times and personalized assistance</li>
      <li><strong>Cross-Course Learning:</strong> Apply concepts from one course to another for deeper understanding</li>
      <li><strong>Project-Based Learning:</strong> Work on real-world projects that combine skills from multiple courses</li>
      <li><strong>Community Access:</strong> Connect with fellow learners and share your creative journey</li>
    </ul>
    
    <h3>💡 Perfect For:</h3>
    <ul>
      <li>Content creators and influencers</li>
      <li>Entrepreneurs building their business</li>
      <li>Professionals looking to diversify their skills</li>
      <li>Students wanting comprehensive knowledge in related fields</li>
      <li>Anyone seeking to become a multi-skilled professional</li>
    </ul>
    
    <h3>🚀 Career Impact:</h3>
    <p>With three courses under your belt, you'll have the skills to tackle complex projects, switch careers, or start your own business. The Creator Package is your ticket to becoming a versatile professional in today's dynamic job market.</p>
    
    <p><em>Transform your creative vision into reality with our Creator Package!</em></p>`,
    features: [
      'Access to 3 premium courses',
      'Lifetime access',
      'Certificate of completion',
      '24/7 support',
      'Priority customer service'
    ],
    color: 'green',
    icon: '🚀',
    earningRange: 'Rs. 1,500 - Rs. 3,000',
    badge: 'POPULAR',
    badgeColor: 'bg-green-500 text-white',
    title: 'Creator Package',
    courseCount: '3 Premium Courses',
    styling: 'bg-gradient-to-br from-white to-gray-50 border-2 border-green-200 shadow-xl shadow-green-500/15 hover:shadow-2xl hover:shadow-green-500/25'
  },
  [PACKAGE_TYPES.PRIME]: {
    name: 'Prime Package',
    courseLimit: 4,
    defaultPrice: 3000,
    description: `<h2>💎 Prime Package - Premium Learning Excellence</h2>
    
    <p><strong>Designed for serious learners and professionals</strong> who demand the highest quality education and want to build expertise across multiple domains. This package represents the perfect balance of breadth and depth, giving you comprehensive knowledge that sets you apart in your field.</p>
    
    <h3>🎯 What You'll Get:</h3>
    <ul>
      <li><strong>Access to 4 Premium Courses:</strong> Build expertise across multiple disciplines with our carefully selected course combinations</li>
      <li><strong>Lifetime Access:</strong> Master your skills over time with unlimited access to all course materials</li>
      <li><strong>Certificate of Completion:</strong> Earn professional certificates that demonstrate your comprehensive skill set</li>
      <li><strong>24/7 Support:</strong> Get expert guidance whenever you need it with our premium support team</li>
      <li><strong>Priority Customer Service:</strong> Enjoy VIP treatment with faster response times and personalized assistance</li>
      <li><strong>Exclusive Content Access:</strong> Unlock premium resources, bonus materials, and advanced techniques not available in basic packages</li>
      <li><strong>Advanced Learning Paths:</strong> Follow structured learning paths that build upon each other for maximum impact</li>
      <li><strong>Expert Q&A Sessions:</strong> Access to live Q&A sessions with course instructors and industry experts</li>
      <li><strong>Networking Opportunities:</strong> Connect with other Prime package learners for collaboration and networking</li>
    </ul>
    
    <h3>💡 Perfect For:</h3>
    <ul>
      <li>Mid-career professionals looking to advance</li>
      <li>Entrepreneurs building comprehensive business knowledge</li>
      <li>Students pursuing advanced studies in multiple fields</li>
      <li>Anyone seeking to become a subject matter expert</li>
      <li>Professionals preparing for career transitions</li>
    </ul>
    
    <h3>🚀 Career Impact:</h3>
    <p>The Prime Package positions you as a well-rounded professional with deep knowledge across multiple domains. This comprehensive skill set makes you invaluable to employers and gives you the confidence to pursue advanced career opportunities or start your own ventures.</p>
    
    <h3>🌟 Exclusive Benefits:</h3>
    <p>As a Prime package holder, you'll receive early access to new courses, special discounts on advanced programs, and invitations to exclusive industry events and workshops.</p>
    
    <p><em>Elevate your professional standing with our Prime Package and become the expert others turn to!</em></p>`,
    features: [
      'Access to 4 premium courses',
      'Lifetime access',
      'Certificate of completion',
      '24/7 support',
      'Priority customer service',
      'Exclusive content access'
    ],
    color: 'purple',
    icon: '💎',
    earningRange: 'Rs. 2,000 - Rs. 4,000',
    badge: 'PREMIUM',
    badgeColor: 'bg-purple-500 text-white',
    title: 'Prime Package',
    courseCount: '4 Premium Courses',
    styling: 'bg-gradient-to-br from-white to-gray-50 border-2 border-purple-200 shadow-xl shadow-purple-500/15 hover:shadow-2xl hover:shadow-purple-500/25'
  },
  [PACKAGE_TYPES.MASTER]: {
    name: 'Master Package',
    courseLimit: 6,
    defaultPrice: 5500,
    description: `<h2>👑 Master Package - Ultimate Learning Mastery</h2>
    
    <p><strong>The pinnacle of online learning excellence</strong> designed for those who are serious about becoming industry leaders and thought experts. This comprehensive package provides you with everything you need to master your field and establish yourself as an authority in your industry.</p>
    
    <h3>🎯 What You'll Get:</h3>
    <ul>
      <li><strong>Access to 6 Premium Courses:</strong> Build mastery across multiple disciplines with our most advanced and comprehensive course offerings</li>
      <li><strong>Lifetime Access:</strong> Master your skills over time with unlimited access to all course materials and future updates</li>
      <li><strong>Certificate of Completion:</strong> Earn prestigious certificates that demonstrate your comprehensive expertise and commitment to continuous learning</li>
      <li><strong>24/7 Support:</strong> Get expert guidance whenever you need it with our dedicated premium support team</li>
      <li><strong>Priority Customer Service:</strong> Enjoy VIP treatment with instant response times and personalized assistance from senior support staff</li>
      <li><strong>Exclusive Content Access:</strong> Unlock premium resources, bonus materials, advanced techniques, and insider knowledge not available in other packages</li>
      <li><strong>Personal Mentor Consultation:</strong> Schedule one-on-one sessions with industry experts and course instructors for personalized guidance</li>
      <li><strong>Advanced Analytics Dashboard:</strong> Track your learning progress, identify knowledge gaps, and optimize your learning journey with detailed analytics</li>
      <li><strong>Mastermind Groups:</strong> Join exclusive peer groups with other Master package learners for collaborative learning and networking</li>
      <li><strong>Industry Recognition:</strong> Get featured in our alumni directory and receive recommendations for career opportunities</li>
      <li><strong>Advanced Certification Paths:</strong> Follow specialized learning paths that lead to industry-recognized certifications</li>
      <li><strong>Exclusive Workshops:</strong> Access to advanced workshops, hackathons, and industry events</li>
    </ul>
    
    <h3>💡 Perfect For:</h3>
    <ul>
      <li>Senior professionals looking to become industry leaders</li>
      <li>Entrepreneurs building comprehensive business empires</li>
      <li>Consultants and advisors seeking to expand their expertise</li>
      <li>Anyone aspiring to become a recognized authority in their field</li>
      <li>Professionals preparing for executive-level positions</li>
      <li>Educators and trainers wanting to offer comprehensive programs</li>
    </ul>
    
    <h3>🚀 Career Impact:</h3>
    <p>The Master Package transforms you into a recognized expert with comprehensive knowledge across multiple domains. This level of expertise opens doors to executive positions, consulting opportunities, speaking engagements, and the ability to command premium rates for your services.</p>
    
    <h3>🌟 Exclusive Benefits:</h3>
    <ul>
      <li><strong>Early Access:</strong> Be the first to access new courses and features</li>
      <li><strong>Special Pricing:</strong> Exclusive discounts on advanced programs and certifications</li>
      <li><strong>Industry Events:</strong> Invitations to exclusive conferences, workshops, and networking events</li>
      <li><strong>Publication Opportunities:</strong> Chance to contribute to industry publications and thought leadership content</li>
      <li><strong>Mentorship Program:</strong> Opportunity to mentor other learners and build your leadership skills</li>
    </ul>
    
    <h3>🎓 Learning Methodology:</h3>
    <p>Our Master Package follows a proven methodology that combines theoretical knowledge with practical application, real-world projects, and continuous assessment to ensure you achieve true mastery in your chosen fields.</p>
    
    <p><em>Join the elite ranks of industry masters with our comprehensive Master Package and become the expert others aspire to be!</em></p>`,
    features: [
      'Access to 6 premium courses',
      'Lifetime access',
      'Certificate of completion',
      '24/7 support',
      'Priority customer service',
      'Exclusive content access',
      'Personal mentor consultation',
      'Advanced analytics dashboard'
    ],
    color: 'gold',
    icon: '👑',
    earningRange: 'Rs. 3,000 - Rs. 6,000',
    badge: 'ULTIMATE',
    badgeColor: 'bg-yellow-400 text-gray-900',
    title: 'Master Package',
    courseCount: '6 Premium Courses',
    styling: 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white'
  }
};

export const PACKAGE_ORDER = [
  PACKAGE_TYPES.ELITE,
  PACKAGE_TYPES.CREATOR,
  PACKAGE_TYPES.PRIME,
  PACKAGE_TYPES.MASTER
];

// Helper functions
export const getPackageByType = (packageType) => {
  return PACKAGE_CONFIG[packageType] || null;
};

export const getPackageFeatures = (packageType) => {
  return PACKAGE_CONFIG[packageType]?.features || [];
};

export const getPackageCourseLimit = (packageType) => {
  return PACKAGE_CONFIG[packageType]?.courseLimit || 1;
};

export const getPackageEarningRange = (packageType) => {
  return PACKAGE_CONFIG[packageType]?.earningRange || 'Rs. 0 - Rs. 0';
};

export const getPackageDefaultPrice = (packageType) => {
  return PACKAGE_CONFIG[packageType]?.defaultPrice || 1000;
};

export const getPackageDefaultDescription = (packageType) => {
  return PACKAGE_CONFIG[packageType]?.description || 'Package description';
};

// New consolidated functions to replace duplicates
export const getPackageStyling = (packageType) => {
  return PACKAGE_CONFIG[packageType]?.styling || PACKAGE_CONFIG[PACKAGE_TYPES.ELITE].styling;
};

export const getPackageBadge = (packageType) => {
  return PACKAGE_CONFIG[packageType]?.badge || PACKAGE_CONFIG[PACKAGE_TYPES.ELITE].badge;
};

export const getPackageBadgeColor = (packageType) => {
  return PACKAGE_CONFIG[packageType]?.badgeColor || PACKAGE_CONFIG[PACKAGE_TYPES.ELITE].badgeColor;
};

export const getPackageTitle = (packageType) => {
  return PACKAGE_CONFIG[packageType]?.title || PACKAGE_CONFIG[PACKAGE_TYPES.ELITE].title;
};

export const getPackageCourseCount = (packageType) => {
  return PACKAGE_CONFIG[packageType]?.courseCount || PACKAGE_CONFIG[PACKAGE_TYPES.ELITE].courseCount;
};

// CourseCard specific styling function
export const getCourseCardStyling = (packageType) => {
  switch (packageType) {
    case 'master':
      return {
        borderColor: 'border-blue-500',
        badgeBg: 'bg-gradient-to-r from-blue-600 to-blue-700',
        badgeText: 'text-white',
        badgeLabel: 'MASTER',
        cardShadow: 'hover:shadow-blue-500/25',
        specialEffect: 'relative overflow-hidden'
      };
    case 'prime':
      return {
        borderColor: 'border-purple-500',
        badgeBg: 'bg-gradient-to-r from-purple-600 to-purple-700',
        badgeText: 'text-white',
        badgeLabel: 'PRIME',
        cardShadow: 'hover:shadow-purple-500/25',
        specialEffect: ''
      };
    case 'creator':
      return {
        borderColor: 'border-green-500',
        badgeBg: 'bg-gradient-to-r from-green-600 to-green-700',
        badgeText: 'text-white',
        badgeLabel: 'CREATOR',
        cardShadow: 'hover:shadow-green-500/25',
        specialEffect: ''
      };
    case 'elite':
    default:
      return {
        borderColor: 'border-gray-500/30',
        badgeBg: 'bg-gradient-to-r from-rose-500 to-pink-600',
        badgeText: 'text-white',
        badgeLabel: 'ELITE',
        cardShadow: 'hover:shadow-lg',
        specialEffect: ''
      };
  }
};
