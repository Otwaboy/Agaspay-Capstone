# AGASPAY - Barangay Waterworks Management System

**Last Updated:** October 28, 2025

## Overview
AGASPAY is a comprehensive water billing and management system designed for barangay waterworks. The system handles resident accounts, water meter readings, billing, payments, incident reports, task scheduling, and personnel management.

## Project Architecture

### Tech Stack
- **Frontend:** React 19 + Vite 7 + Tailwind CSS 4
- **Backend:** Node.js 20 + Express 4
- **Database:** MongoDB (Cloud - MongoDB Atlas)
- **Payment Gateway:** PayMongo
- **SMS Service:** PhilSMS

### Project Structure
```
├── Backend/               # Express.js API server
│   ├── controller/       # Route controllers (auth, billing, payments, etc.)
│   ├── model/           # MongoDB Mongoose models
│   ├── routes/          # API route definitions
│   ├── middleware/      # Authentication & error handling
│   └── server.js        # Main server entry point
├── Frontend/             # React + Vite application
│   ├── src/
│   │   ├── components/  # UI components (dashboards, modals, layouts)
│   │   ├── pages/       # Page components for different roles
│   │   ├── lib/         # API client & utilities
│   │   └── hooks/       # Custom React hooks
│   └── vite.config.js   # Vite configuration
└── start-backend.sh      # Backend startup script (includes MongoDB setup)
```

## User Roles
The system supports multiple user roles with different permissions:
1. **Admin** - Full system access
2. **Treasurer** - Financial management, billing, payments
3. **Secretary** - Resident registration, document management
4. **Meter Reader** - Water meter reading input
5. **Maintenance** - Task assignments and incident handling
6. **Resident** - View bills, make payments, report issues

## Environment Configuration

### Backend Environment Variables (.env)
- `PORT` - Backend server port (3000)
- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `JWT_LIFETIME` - Token expiration time
- `PAYMONGO_SECRET_KEY` - PayMongo payment gateway API key
- `PHILSMS_API_KEY` - PhilSMS service API key
- `NODE_ENV` - Environment (development/production)

## Replit Setup Notes

### Ports
- **Frontend:** Port 5000 (Vite dev server, bound to 0.0.0.0)
- **Backend:** Port 3000 (Express server, bound to localhost)
- **MongoDB:** Port 27017 (local instance for development, cloud for production)

### Key Configurations
1. **Vite Config:** Configured with `allowedHosts: true` to work with Replit's proxy system
2. **CORS:** Backend allows Replit domains and localhost origins
3. **Database:** Uses MongoDB Atlas (cloud) with connection string in .env

### Workflows
- **Backend:** Starts MongoDB (if needed) and runs Express server with nodemon
- **Frontend:** Runs Vite dev server on port 5000 with HMR enabled

## Features
- User authentication & role-based access control
- Water meter reading management
- Automated billing generation
- Online payment processing (PayMongo integration)
- Incident reporting system
- Task scheduling and assignment
- Water connection management
- Financial reports and analytics
- SMS notifications for overdue bills

## Demo Credentials
- **Username:** admin
- **Password:** admin123

## Recent Changes
- **October 28, 2025:**
  - Migrated from GitHub to Replit
  - Configured Vite to allow Replit proxy domains
  - Set up MongoDB connection to Atlas cloud database
  - Removed unused Stripe dependency (system uses PayMongo)
  - Configured backend CORS for Replit environment
  - Set up deployment configuration for autoscale deployment

## Development
- Frontend runs with hot module replacement (HMR)
- Backend uses nodemon for automatic restarts on file changes
- MongoDB Atlas provides cloud database access

## Deployment
Configured for Replit Autoscale deployment:
- Build command: `npm run build` (Frontend)
- Run command: Starts backend and serves frontend build
