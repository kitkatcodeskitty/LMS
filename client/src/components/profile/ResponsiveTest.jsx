import React, { useState } from 'react';
import { FaDesktop, FaTabletAlt, FaMobileAlt, FaCheckCircle } from 'react-icons/fa';

const ResponsiveTest = () => {
  const [activeView, setActiveView] = useState('mobile');

  const viewports = {
    mobile: { width: '375px', label: 'Mobile', icon: FaMobileAlt },
    tablet: { width: '768px', label: 'Tablet', icon: FaTabletAlt },
    desktop: { width: '100%', label: 'Desktop', icon: FaDesktop }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            📱 Responsive Design Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test the responsive improvements across different screen sizes
          </p>
          
          {/* Viewport Selector */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(viewports).map(([key, viewport]) => {
              const IconComponent = viewport.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveView(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeView === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{viewport.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive Features Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Mobile-First Design */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 card-hover">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mobile-First Approach</h3>
                <p className="text-sm text-gray-600">Optimized for touch and small screens</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Touch Targets</span>
                <span className="text-sm text-green-600">44px minimum</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Responsive Typography</span>
                <span className="text-sm text-green-600">Scales with screen</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Adaptive Layouts</span>
                <span className="text-sm text-green-600">Flexible grids</span>
              </div>
            </div>
          </div>

          {/* Enhanced Interactions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 card-hover">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Enhanced UX</h3>
                <p className="text-sm text-gray-600">Smooth animations and feedback</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Hover Effects</span>
                <span className="text-sm text-purple-600">Smooth transitions</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Loading States</span>
                <span className="text-sm text-purple-600">Engaging animations</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Visual Hierarchy</span>
                <span className="text-sm text-purple-600">Clear organization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Component Examples */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Component Responsive Examples
            </h2>
            <p className="text-gray-600">
              See how components adapt to different screen sizes
            </p>
          </div>

          <div className="p-6">
            {/* Tab Navigation Example */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tab Navigation</h3>
              
              {/* Mobile Version */}
              <div className="sm:hidden mb-4">
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                  <option>💸 Make Withdrawal</option>
                  <option>⏳ Pending Requests</option>
                  <option>📄 Statements</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">Mobile: Dropdown navigation</p>
              </div>

              {/* Desktop Version */}
              <div className="hidden sm:flex border-b border-gray-200 mb-4">
                <button className="flex-1 px-4 py-3 text-center font-medium bg-blue-50 text-blue-600 border-b-2 border-blue-600">
                  💸 Make Withdrawal
                </button>
                <button className="flex-1 px-4 py-3 text-center font-medium text-gray-600 hover:bg-gray-50">
                  ⏳ Pending Requests
                </button>
                <button className="flex-1 px-4 py-3 text-center font-medium text-gray-600 hover:bg-gray-50">
                  📄 Statements
                </button>
              </div>
              <p className="text-sm text-gray-500 hidden sm:block">Desktop: Horizontal tabs</p>
            </div>

            {/* Card Layout Example */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsive Cards</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 card-hover">
                  <div className="text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="text-lg font-bold text-green-700">Rs 5,000</div>
                    <div className="text-sm text-green-600">Available Balance</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 card-hover">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-lg font-bold text-blue-700">Rs 15,000</div>
                    <div className="text-sm text-blue-600">Total Earnings</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 card-hover">
                  <div className="text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="text-lg font-bold text-purple-700">25</div>
                    <div className="text-sm text-purple-600">Referrals</div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Cards automatically adjust: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
              </p>
            </div>

            {/* Form Layout Example */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsive Forms</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Forms stack vertically on mobile, side-by-side on desktop
              </p>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">🧪 Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Manual Testing</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Resize browser window to test breakpoints</li>
                <li>• Test on actual mobile devices</li>
                <li>• Check touch interactions on mobile</li>
                <li>• Verify text readability at all sizes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Browser Dev Tools</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use responsive design mode (F12)</li>
                <li>• Test common device presets</li>
                <li>• Check network throttling</li>
                <li>• Verify accessibility features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTest;