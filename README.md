# Admin Panel Dashboard

## Description

Admin Panel Dashboard is a full-stack administration platform built with **Node.js, Express, and MongoDB** on the backend, and **Angular** on the frontend.
It provides secure JWT-based authentication, role-based access control (RBAC), permission management, audit logging, and system health monitoring.
The Angular frontend delivers a responsive, card-based UI that follows global design standards, offering dashboards, activity insights,and CRUD management modules.

The project is designed with **scalability, security, and maintainability** in mind, making it suitable for professional administration needs.

## Features

- **Authentication**: Secure login with JWT access/refresh tokens and optional 2FA
- **RBAC**: Role and permission management with fine-grained access control
- **CRUD Modules**: Full management of Users, Roles, Permissions, and Categories
- **Dashboard**: Quick Actions, System Health, Recent Audit Logs
- **Statistics**: Totals, active/inactive users, and users by role
- **Audit Logs**: Detailed tracking of user actions and system activities
- **Sessions**: Session tracking, management, and audit trail
- **List Views**: Pagination, filtering, and sorting for efficient data handling
- **UI/UX**: Consistent, responsive, card-based design with global style guidelines

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/omeroztprk/admin-panel-dashboard.git
   cd admin-panel-dashboard
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Set up backend environment**
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
   CORS_ORIGIN=http://localhost:4200
   ```

4. **Start MongoDB and seed data**
   ```bash
   npm run seed
   ```

5. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

6. **Set up frontend environment**
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```
   By default, the environment.ts file includes settings such as:
   ```ts
   export const environment = {
      production: false,
      apiUrl: 'http://localhost:3000/api'
   };
   ```

## Running the Application

**Start the backend (Express API):**
```bash
npm run dev   # development mode with nodemon
npm start     # production mode
```

The backend will be available at http://localhost:3000.

**Start the frontend (Angular app):**
```bash
cd frontend
ng serve --open
```

The frontend will be available at http://localhost:4200.

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
