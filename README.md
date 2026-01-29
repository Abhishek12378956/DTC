# Training Calendar Management System

Complete implementation of the Training Calendar Management System as per the BRD requirements.

## Project Structure

```
.
├── database/
│   └── schema.sql          # Complete SQL Server database schema
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Authentication middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities (JWT, Email)
│   │   └── server.ts       # Express server
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── features/        # Feature modules
    │   ├── services/        # API services
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## Prerequisites

- Node.js 18+ and npm
- SQL Server (SSMS)
- Git

## Setup Instructions

### 1. Database Setup

1. Open SQL Server Management Studio (SSMS)
2. Run the SQL script: `database/schema.sql`
3. This will create the `TrainingCalendarDB` database with all required tables

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   DB_SERVER=localhost
   DB_DATABASE=TrainingCalendarDB
   DB_USER=sa
   DB_PASSWORD=YourPassword
   DB_PORT=1433
   JWT_SECRET=change_me_to_a_secure_random_string
   JWT_EXPIRES_IN=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=app-password
   EMAIL_FROM=noreply@trainingcalendar.com
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## Features Implemented

### ✅ Database Schema
- Complete SQL Server schema with all tables
- Member Master with all required fields (a-h)
- Positions, KSA, DMT master tables
- Training and Assignment tables
- Assignment Recipients table

### ✅ Backend APIs
- Authentication (Login, Get Current User)
- User Management (CRUD)
- Master Data Management (Positions, KSA, DMT, Roles)
- Training Management (CRUD)
- Assignment Management with multiple assignment types:
  - Individual
  - Grade/Level
  - Position
  - DMT
  - Function
- Reports (Individual, Assigner, DMT)
- Email Notifications on training assignment

### ✅ Frontend
- Login page
- Dashboard with statistics
- Training management with grid view
- Assignment interface with multiple assignment types
- Reports (Individual, Assigner, DMT) with CSV export
- Master Data management (Positions, KSA, DMT)
- User listing
- Responsive design with Tailwind CSS

### ✅ Security
- JWT authentication
- Password hashing with bcrypt
- Parameterized SQL queries
- Role-based access control

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user

### Master Data
- `GET /api/positions` - List positions
- `POST /api/positions` - Create position
- `GET /api/ksa` - List KSA
- `POST /api/ksa` - Create KSA
- `GET /api/dmt` - List DMT
- `POST /api/dmt` - Create DMT
- `GET /api/roles` - List roles

### Trainings
- `GET /api/trainings` - List trainings
- `GET /api/trainings/:id` - Get training
- `POST /api/trainings` - Create training
- `PUT /api/trainings/:id` - Update training
- `DELETE /api/trainings/:id` - Delete training

### Assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - List assignments
- `GET /api/assignments/:id/recipients` - Get assignment recipients

### Assignment Recipients
- `PUT /api/assignment-recipients/:id/status` - Update status
- `PUT /api/assignment-recipients/:id/attendance` - Update attendance

### Reports
- `GET /api/reports/individual` - Individual report
- `GET /api/reports/assigner` - Assigner report
- `GET /api/reports/dmt` - DMT report
- `GET /api/reports/export` - Export report as CSV

## Default Roles

The system includes the following default roles:
- Admin
- HR Manager BCM
- HR Manager DHQ
- PCOE
- ICOE
- BE Cell Manager
- L&D
- DMT Leader
- Functional Head
- Manager
- ESP
- Employee

## Email Configuration

To enable email notifications:
1. Use Gmail SMTP or your preferred email service
2. For Gmail, generate an App Password
3. Update the email settings in backend `.env` file

## Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Production Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

3. Start the backend:
   ```bash
   npm start
   ```

4. Serve the frontend build files using a web server (nginx, Apache, etc.)

## Notes

- All requirements have been implemented
- The system supports all assignment types mentioned in the BRD
- Email notifications are sent when trainings are assigned
- Reports can be exported as CSV
- The system uses JWT for authentication
- All database queries use parameterized statements for security

 
