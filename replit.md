# AGASPAY - Barangay Waterworks Management System

## Overview
AGASPAY is a comprehensive water billing and management system for barangay waterworks. It manages resident accounts, water meter readings, billing, payments, incident reports, task scheduling, and personnel. The system aims to streamline operations for barangay officials and provide convenient services for residents, including online payments and issue reporting.

## User Preferences
- The user prefers clear and concise explanations.
- The user wants the agent to focus on completing tasks efficiently.
- The user prefers that the agent asks for confirmation before making significant architectural changes or refactoring large portions of code.
- The user expects the agent to adhere to the established design system and maintain UI/UX consistency.
- The user wants the agent to prioritize security fixes and robust error handling.
- The user prefers an iterative development approach, focusing on one feature or fix at a time.
- Do not make changes to the folder `node_modules/` in the `Backend` directory.

## System Architecture

### Tech Stack
-   **Frontend:** React 19, Vite 7, Tailwind CSS 4
-   **Backend:** Node.js 20, Express 4
-   **Database:** MongoDB (Cloud - MongoDB Atlas)

### Project Structure
The project is divided into `Backend` (Express.js API) and `Frontend` (React + Vite). The backend includes controllers, models, routes, and middleware, while the frontend is structured with components, pages, utility libraries, and hooks.

### User Roles
The system supports six distinct roles with tailored permissions: Admin, Treasurer, Secretary, Meter Reader, Maintenance, and Resident.

### UI/UX Design
The system currently implements a "Premium Frosted Glass Design" characterized by:
-   A gradient background (`bg-gradient-to-br from-blue-50 via-white to-cyan-50`).
-   Decorative blurry water drop overlays for visual depth.
-   Frosted glass effect for cards (`bg-white/70 backdrop-blur-md border-white/30`).
-   Solid white sidebar.
-   Standardized header text styling (`text-3xl font-bold text-gray-900` for titles, `text-gray-600` for subtitles).
-   Consistent layering using `relative z-10` for content.
This design is applied consistently across all pages and user roles.

### Key Features
-   User authentication and role-based access control.
-   Water meter reading and automated billing.
-   Online payment processing.
-   Incident reporting and task scheduling.
-   Water connection management.
-   Financial reporting and analytics.
-   SMS notifications.
-   Zone-based filtering for meter readers.
-   Monthly Reading Progress Tracker.
-   Resident account creation automatically schedules meter installation.

### Technical Implementations
-   **Vite Configuration:** Proxies `/api` requests to the backend, `allowedHosts: true` for Replit compatibility.
-   **CORS:** Backend configured to allow Replit domains and localhost.
-   **Backend Server:** Binds to `0.0.0.0:3000`.
-   **Frontend Server:** Runs on `0.0.0.0:5000`.
-   **Nodemon Configuration:** Backend uses `nodemon.json` to watch specific directories (`controller`, `middleware`, `routes`, `model`, `server.js`) to prevent unnecessary restarts.
-   **Security:** Implemented zone-based filtering for meter readers and ensured JWT secrets are not logged.
-   **Admin Dashboard:** Comprehensive integration with all backend APIs, utilizing React Query for data fetching and state management, featuring modern stats cards, pending announcements, and system overview.
-   **Automated Workflow:** Resident account creation triggers automatic meter installation task scheduling.

## External Dependencies
-   **Database:** MongoDB Atlas (Cloud)
-   **Payment Gateway:** PayMongo
-   **SMS Service:** PhilSMS