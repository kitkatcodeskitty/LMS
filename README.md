# Learning Management System (LMS)

A comprehensive Learning Management System built with React and Node.js, featuring course management, user authentication, payment processing, and affiliate marketing capabilities.

## 🚀 Features

### Core Features
- **Course Management**: Create, edit, and manage online courses
- **User Authentication**: Secure user registration and login system
- **Payment Processing**: Integrated payment system for course purchases
- **Video Player**: Built-in video player for course content
- **Progress Tracking**: Monitor student progress and completion
- **Admin Dashboard**: Comprehensive admin panel for course and user management

### Advanced Features
- **Affiliate Marketing**: Referral system with commission tracking
- **KYC Verification**: Know Your Customer verification system
- **Withdrawal Management**: Automated withdrawal processing for affiliates
- **Notification System**: Real-time notifications for users
- **Mobile Responsive**: Optimized for all device sizes
- **Multi-language Support**: Internationalization ready

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Icons** - Icon library
- **AOS** - Animate On Scroll library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload middleware
- **Cloudinary** - Cloud image/video management
- **bcrypt** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Nodemon** - Development server with auto-restart

## 📁 Project Structure

```
LMS/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   ├── public/            # Public static files
│   └── package.json       # Frontend dependencies
├── server/                 # Backend Node.js application
│   ├── configs/           # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   ├── utils/             # Helper functions
│   └── package.json       # Backend dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LMS
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/lms
   
   # JWT
   JWT_SECRET=your_jwt_secret_here
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Clerk (Authentication)
   CLERK_SECRET_KEY=your_clerk_secret
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

5. **Start the development servers**

   **Backend (Terminal 1):**
   ```bash
   cd server
   npm run dev
   ```

   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Course Endpoints
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/kyc` - KYC verification requests
- `GET /api/admin/withdrawals` - Withdrawal requests
- `PUT /api/admin/kyc/:id` - Approve/reject KYC
- `PUT /api/admin/withdrawals/:id` - Process withdrawal

### Cart & Payment
- `POST /api/cart/add` - Add course to cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/checkout` - Process payment

## 🔧 Available Scripts

### Frontend (client/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend (server/)
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm run migrate      # Run database migrations
npm run migrate:rollback  # Rollback migrations
npm run migrate:status    # Check migration status
```

## 🗄️ Database Models

- **User**: User accounts, profiles, and authentication
- **Course**: Course information, content, and metadata
- **Purchase**: Course purchase records and payment history
- **Cart**: Shopping cart functionality
- **KYC**: Know Your Customer verification data
- **Withdrawal**: Affiliate withdrawal requests
- **Notification**: User notification system

## 🔐 Authentication & Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/User)
- CORS configuration for security
- Rate limiting middleware
- Input validation and sanitization

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices
- Various screen resolutions

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd server
npm start
# Use PM2 or similar process manager for production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Contact the development team

## 🔄 Updates & Maintenance

- Regular security updates
- Performance optimizations
- Feature enhancements
- Bug fixes and patches

---

**Built with ❤️ using modern web technologies**