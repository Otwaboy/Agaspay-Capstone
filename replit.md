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
1. **Vite Config:** 
   - Configured with `allowedHosts: true` to work with Replit's proxy system
   - **Vite Proxy:** All `/api` requests are forwarded to backend on `localhost:3000`
2. **CORS:** Backend allows Replit domains and localhost origins
3. **Database:** Uses MongoDB Atlas (cloud) with connection string in .env
4. **Backend Server:** Binds to `0.0.0.0:3000` (accessible from frontend via Vite proxy)
5. **Frontend Server:** Runs on `0.0.0.0:5000` (public-facing port)

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

## Working Credentials
- **Username:** `replitadmin`
- **Password:** `replit2025`

**Note:** Your original database users exist but may have different passwords. Use the credentials above or check your database for other valid accounts.

## Design System
- **Modern Healthcare-Inspired UI** (October 28, 2025):
  - Dark navy sidebar (#2C3E50) with organized menu sections
  - Clean white header with search and notifications
  - Rounded icon badges in stat cards
  - Inline mini bar charts for trends
  - Professional spacing and typography
  - Consistent across ALL user roles

## Recent Changes
- **November 1, 2025:**
  - 🔒 **CRITICAL SECURITY FIX:** Implemented zone-based filtering for meter readers
    - Fixed major security vulnerability where meter readers could see ALL residents
    - Backend now enforces zone-based filtering in `getLatestReadings` API
    - Meter readers with `assigned_zone=2` can now ONLY see residents with `zone=2`
    - Added Personnel model lookup to get meter reader's assigned zone
    - Frontend already had client-side filtering, but backend now enforces server-side security
    - Added zone field to API response for debugging and display
    - Treasurers can still see all zones (no filter applied)
  - ✅ Unified all Meter Reader pages with consistent header design
    - All 6 meter-reader pages now use `MeterReaderTopHeader` component
    - Moved page titles from custom headers to main content area
    - Consistent layout structure across: Readings, History, Zones, Schedule, Issues, Settings

- **October 28, 2025:**
  - ✅ Migrated from GitHub to Replit successfully
  - ✅ Configured Vite to allow Replit proxy domains
  - ✅ Set up MongoDB Atlas cloud database connection
  - ✅ Removed unused Stripe dependency (system uses PayMongo)
  - ✅ Configured backend CORS for Replit environment
  - ✅ **Implemented Vite proxy** to forward API requests from frontend to backend
  - ✅ Created test admin account: `replitadmin` / `replit2025`
  - ✅ Verified login functionality and database connectivity
  - ✅ Set up deployment configuration for autoscale deployment
  
  **Admin Dashboard Integration (100% Complete):**
  - ✅ All backend APIs implemented (Dashboard, Personnel, Reports, Incidents, Users, Connections, Billing, Scheduling)
  - ✅ Comprehensive adminApi service created for all admin endpoints
  - ✅ All 7 admin pages integrated with real data (no mock data):
    - Dashboard Overview with real statistics
    - Admin Users page (search, filter, manage residents)
    - Admin Personnel page (full CRUD operations)
    - Admin Connections page (status updates, search, filter)
    - Admin Billing page (billing & payment data)
    - Admin Incidents page (status updates, resolution)
    - Admin Scheduling page (task management, status updates)
    - Admin Reports page (real report generation)
  - ✅ All pages use React Query (useQuery, useMutation)
  - ✅ All buttons fully functional (delete, update, resolve, etc.)
  - ✅ Proper loading states with Skeleton components
  - ✅ Toast notifications for success/error
  - ✅ Query invalidation for real-time updates
  - ✅ **Modern Dashboard Design** - Redesigned with:
    - Modern stats cards with inline trend charts
    - **Pending Announcements** section (replaces revenue overview):
      - Shows announcements created by Secretary awaiting Admin approval
      - Approve/Reject buttons for each announcement
      - Category badges (Maintenance, Event, Information, Billing, Alert)
      - Priority indicators (high, normal, low)
      - Real-time updates using React Query
    - Connection status donut chart breakdown
    - **System Overview** section (replaces today's schedule):
      - Overdue payments tracker
      - Pending connections count
      - Unresolved incidents alert
      - Pending announcements count
      - Active connections status
      - Pending payments summary
      - Real-time system status indicator
    - Recent activities with avatar displays
    - Clean, professional layout inspired by modern healthcare dashboards
  
  **Chapter 3 Requirements Implementation (85% Complete):**
  - ✅ All 9 backend models updated/created
  - ✅ All 6 connection statuses implemented
  - ✅ Approval workflow APIs (announcements & schedules)
  - ✅ Notification system (SMS via PhilSMS, Email)
  - ✅ Receipt generation (temporary & official)
  - ✅ Voluntary disconnection & archive request APIs
  - ✅ Delinquency tracking & auto-task scheduling
  - ⏳ Secretary, Treasurer, Meter Reader, Maintenance, Resident dashboards
  - ⏳ End-to-end testing and bug fixes

## Development
- Frontend runs with hot module replacement (HMR)
- Backend uses nodemon for automatic restarts on file changes
- MongoDB Atlas provides cloud database access

## Deployment
Configured for Replit Autoscale deployment:
- Build command: `npm run build` (Frontend)
- Run command: Starts backend and serves frontend build
