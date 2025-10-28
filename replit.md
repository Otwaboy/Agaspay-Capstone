# AGASPAY - Barangay Waterworks Management System

## Overview
AGASPAY is a comprehensive water billing and management system designed for barangay waterworks. The system manages residents, water connections, meter readings, billing, payments, and maintenance tasks.

## Project Structure
- **Backend/** - Node.js/Express API server (Port 3000)
  - MongoDB database using Mongoose ODM
  - RESTful API endpoints
  - JWT authentication
  - PayMongo payment integration
  
- **Frontend/** - React + Vite application (Port 5000)
  - Modern UI with Tailwind CSS
  - Role-based dashboards (Admin, Treasurer, Secretary, Meter Reader, Resident, Maintenance)
  - Real-time updates with React Query

## Technology Stack

### Backend
- Node.js with Express
- MongoDB (Cloud: MongoDB Atlas)
- Authentication: JWT
- Payment Gateway: PayMongo
- SMS: PhilSMS API

### Frontend
- React 19
- Vite 7
- Tailwind CSS 4
- Wouter (routing)
- React Query (data fetching)
- Radix UI components

## User Roles
1. **Admin** - Full system access
2. **Treasurer** - Financial management, billing, payments
3. **Secretary** - Resident registration, document management
4. **Meter Reader** - Input meter readings
5. **Maintenance** - Handle incident reports and maintenance tasks
6. **Resident** - View bills, make payments, report issues

## Demo Credentials
- Username: `admin`
- Password: `admin123`

## Environment Configuration
The backend uses MongoDB Atlas (cloud database) and includes:
- PayMongo payment processing
- PhilSMS for notifications
- JWT token authentication

## Development Setup
Both backend and frontend run automatically via Replit workflows:
- Backend starts MongoDB and runs on localhost:3000
- Frontend runs on 0.0.0.0:5000

## Recent Changes
- **2025-10-28**: Initial Replit setup
  - Configured Vite to bind to 0.0.0.0:5000 for Replit preview
  - Updated CORS settings to allow Replit domains
  - Connected to MongoDB Atlas cloud database
  - Removed unused Stripe dependency (using PayMongo)
  - Set up automated workflows for both backend and frontend

## API Endpoints
- `/api/v1/auth` - Authentication
- `/api/v1/meter-reader` - Meter readings
- `/api/v1/rate` - Water rates
- `/api/v1/billing` - Billing management
- `/api/v1/payment` - Payment processing
- `/api/v1/user` - User management
- `/api/v1/water-connection` - Water connections
- `/api/v1/incident-report` - Incident reports
- `/api/v1/schedule-task` - Task scheduling
- `/api/v1/assignments` - Assignment management
