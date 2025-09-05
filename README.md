# Admin Panel Dashboard

## Description

A comprehensive admin panel dashboard built with Node.js, Express.js, and MongoDB. This application provides a complete role-based access control (RBAC) system with user management, session handling, audit logging, category management, authentication features, and optional two-factor authentication (email-based verification codes). The system is designed for secure administration with JWT-based authentication, permission management, and comprehensive audit trails.

## Features

- **User Management**: Complete CRUD operations for user accounts with role assignments
- **Role-Based Access Control (RBAC)**: Flexible permission system with role and permission management
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **Two-Factor Authentication (TFA)**: Optional Gmail-based verification code flow before issuing tokens
- **Session Management**: Track and manage user sessions with device information
- **Audit Logging**: Comprehensive logging of all system activities and user actions
- **Permission System**: Granular permissions for different resources and actions
- **Category Management**: Manage categories with CRUD operations and parent-child hierarchy
- **Input Validation**: Robust validation using express-validator
- **Rate Limiting**: Protection against brute force attacks on authentication endpoints
- **Error Handling**: Centralized error handling with detailed error responses
- **Database Seeding**: Automated setup of initial admin users and permissions
- **Health Check**: System health monitoring endpoint

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OmerOztprk/admin-panel-dashboard.git
   cd admin-panel-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/admin-panel-dashboard
   JWT_ACCESS_SECRET=your-secure-access-secret-at-least-32-characters
   JWT_REFRESH_SECRET=your-secure-refresh-secret-at-least-32-characters
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   SEED_ADMIN_EMAIL=admin@example.com
   SEED_ADMIN_PASSWORD=ChangeMe123!
   TFA_ENABLED=false
   TFA_CODE_TTL_SECONDS=300
   TFA_MAX_ATTEMPTS=5
   GMAIL_USER=your-gmail-address@gmail.com
   GMAIL_PASS=your-gmail-app
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or update the `MONGO_URI` to point to your MongoDB instance.

5. **Seed the database**
   ```bash
   npm run seed
   ```

## Running the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The application will be available at `http://localhost:3000` (or your configured PORT).

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
