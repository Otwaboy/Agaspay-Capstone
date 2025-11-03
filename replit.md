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
-   Personnel availability checking for task assignments.

### Technical Implementations
-   **Vite Configuration:** Proxies `/api` requests to the backend, `allowedHosts: true` for Replit compatibility.
-   **CORS:** Backend configured to allow Replit domains and localhost.
-   **Backend Server:** Binds to `0.0.0.0:3000`.
-   **Frontend Server:** Runs on `0.0.0.0:5000`.
-   **Nodemon Configuration:** Backend uses `nodemon.json` to watch specific directories (`controller`, `middleware`, `routes`, `model`, `server.js`) to prevent unnecessary restarts.
-   **Security:** Implemented zone-based filtering for meter readers and ensured JWT secrets are not logged.
-   **Admin Dashboard:** Comprehensive integration with all backend APIs, utilizing React Query for data fetching and state management, featuring modern stats cards, pending announcements, and system overview.
-   **Manual Meter Installation Scheduling:** Resident account creation creates PENDING water connection; secretary manually schedules meter installation through Assignments page with availability checking to prevent conflicts.

## External Dependencies
-   **Database:** MongoDB Atlas (Cloud)
-   **Payment Gateway:** PayMongo
-   **SMS Service:** PhilSMS

## Recent Changes
- **November 3, 2025 (Morning - Latest Update):**
  - ✅ **CUMULATIVE BILLING SYSTEM:** Bills now automatically accumulate unpaid balances from previous months
    - **User Requirement:** When generating new bills, all unpaid/overdue amounts should be added to current month charges
    - **Problem Solved:** Previously, if resident owed ₱20 from October and new bill was ₱12 in November, system only showed ₱12 instead of ₱32 total
    - **Backend Changes (Billing.js model):**
      - Added `previous_balance` field to track sum of all unpaid bills
      - Added `current_charges` field to track current month consumption charges
      - Updated `total_amount` calculation: previous_balance + current_charges
      - Fixed pre-save hook to preserve cumulative calculations from controller
    - **Backend Changes (billing.js controller):**
      - Modified `createBilling()` to find all unpaid bills (status: unpaid, partial, overdue)
      - Sums total_amount from all unpaid bills to calculate previous_balance
      - Calculates current_charges from current reading (consumption × rate)
      - Stores all three values: previous_balance, current_charges, total_amount
      - Enhanced logging shows breakdown when creating bills with accumulated balances
      - Updated `getBilling()` response to include previous_balance and current_charges breakdown
    - **Example Workflow:**
      1. Resident has ₱20 unpaid from October (status: unpaid)
      2. November reading: 10 cubic meters × ₱2/m³ = ₱20 current charges
      3. System generates bill: previous_balance = ₱20, current_charges = ₱20, **total_amount = ₱40**
      4. If November remains unpaid and December charges are ₱15:
         - previous_balance = ₱40 (Oct + Nov), current_charges = ₱15, **total_amount = ₱55**
    - **Benefits:**
      - Automatic accumulation of all unpaid balances (no manual tracking needed)
      - Clear breakdown shows residents what they owe from previous months vs current month
      - Works with partial payments (status: partial)
      - Handles multiple months of unpaid bills correctly
    - **Architect Review:** ✅ Passed - Cumulative totals persist correctly, pre-save hook preserves controller calculations, backward compatible

- **November 2, 2025 (Afternoon - Latest Update):**
  - ✅ **INTEGRATED SCHEDULING IN CREATE RESIDENT FORM:** Secretary can now optionally schedule meter installation when creating resident accounts
    - **User Requirement:** User requested scheduling option directly in create resident form instead of separate steps
    - **Frontend Changes (create-resident-modal.jsx):**
      - Added optional "Schedule Meter Installation Now" checkbox
      - When enabled, shows scheduling section with:
        - Date picker (minimum date = today)
        - **Grid-style time slot picker** (below installation date for clean layout)
          - Exactly 4 time slots: 09:30-10:30, 11:30-12:30, 13:30-14:30, 15:30-16:30
          - 2-column grid layout (1 column on mobile, 2 on tablet/desktop)
          - Each card shows time range + "Duration: 60 min" + green "Available" badge
          - Selected slot has gray border and background
          - Clean card design matching user's screenshot
        - Personnel dropdown with real-time availability checking
      - Fetches maintenance personnel with availability when date/time selected
      - Displays green "✓ Available" / red "✗ Busy" badges for each personnel
      - Shows yellow warning card if secretary selects busy personnel
      - Form validation ensures all scheduling fields filled if checkbox enabled
      - Sends scheduling data to backend only if checkbox enabled
    - **Backend Changes (register.js):**
      - Accepts optional scheduling fields: `schedule_installation`, `schedule_date`, `schedule_time`, `assigned_personnel`
      - Validates scheduling fields if scheduling requested
      - Creates **both ScheduleTask AND Assignment** if scheduling data provided (complete workflow)
        - ScheduleTask: Links task to water connection with date/time
        - Assignment: Links task to assigned personnel (same as assignment controller)
      - Returns contextual success message based on whether scheduling was done
      - Response includes task_id, assignment_id, and scheduling metadata
    - **Two Workflow Options:**
      1. **Schedule Now:** Secretary checks box → fills date/time/personnel → creates account with scheduled installation in one step
      2. **Schedule Later:** Secretary unchecks box → creates account only → manually schedules later via Assignments page
    - **Benefits:**
      - Flexible: Secretary chooses to schedule now or later
      - Convenient: One-click workflow if scheduling immediately
      - Informed decisions: Availability badges show personnel status
      - Still prevents conflicts: Uses availability checking
      - Maintains manual control: No forced automatic scheduling
    - **Bug Fixes:**
      - Fixed personnel dropdown disappearing when all busy
      - Corrected response.personnel extraction from API
      - Fixed field name mapping (id vs _id, name vs first_name/last_name)
    - **Architect Review:** ✅ Passed - Complete end-to-end workflow functional with availability-aware personnel selection

- **November 2, 2025 (Afternoon):**
  - ✅ **CHANGED TO MANUAL METER INSTALLATION SCHEDULING:** Removed automatic scheduling to give secretary full control
    - **Reason for Change:** User requested manual scheduling to avoid:
      - Weekend scheduling when maintenance is unavailable
      - Conflicts when maintenance personnel are sick or busy
      - Inflexible fixed time (9:00 AM) that doesn't consider workload
    - **Backend Changes (register.js):**
      - Removed automatic ScheduleTask creation from `registerResident` function
      - Removed unused ScheduleTask import
      - Updated response message to instruct secretary to schedule manually
      - **Still creates:** User + Resident + WaterConnection (PENDING status)
    - **New Workflow:**
      1. Secretary creates resident account → Only creates account and PENDING connection
      2. Secretary manually schedules meter installation through Assignments page
      3. Uses availability checking feature to prevent conflicts
      4. Full control over date, time, and personnel assignment
    - **Benefits:** 
      - Avoids weekend/holiday scheduling
      - Secretary can check maintenance availability first
      - Flexible scheduling based on workload
      - Uses conflict detection to prevent double-booking
    - **Architect Review:** ✅ Passed - Clean removal with no orphaned references

- **November 2, 2025 (Afternoon):**
  - ✅ **PERSONNEL AVAILABILITY CHECKING FEATURE:** Secretary Assignment page now shows real-time availability to prevent double-booking
    - **Backend Changes (assignment.js):**
      - Added `checkTimeConflict()` helper function to detect overlapping time slots
        - Supports both 12-hour format ("09:00 AM") and 24-hour format ("14:30")
        - Handles time ranges ("09:00 AM - 10:00 AM") and single times
        - Converts times to minutes since midnight for accurate overlap detection
      - Enhanced `getMaintenancePersonnel` API to accept query parameters (`schedule_date`, `schedule_time`)
      - Returns availability status: `isAvailable`, `conflictingTasks`, `tasksOnDate`
    - **Frontend Changes (secretary-assignments.jsx, api.js):**
      - Fetches personnel with availability when opening assignment modal
      - **Green badge "✓ Available"** for personnel with no conflicts
      - **Red badge "✗ Busy"** for personnel already scheduled at that time
      - Shows conflict details (time and task count) for busy personnel
      - **Yellow warning card** when selecting unavailable personnel
    - **Benefits:** Prevents accidental double-booking, provides clear visual feedback, shows exact conflict times
    - **Architect Review:** ✅ Passed - Time parsing correctly handles AM/PM and 24-hour formats

- **November 2, 2025 (Morning):**
  - ✅ **CHAPTER 3 WORKFLOW IMPLEMENTATION:** Resident account creation (originally with automatic meter installation - changed to manual in afternoon)
  - **Security Fixes:** Authentication/authorization validation moved to TOP of registerResident (before DB operations)
  - Fixed JWT secret logging vulnerability in User.js model
  - Added authentication middleware to `/register-resident` and `/register-personnel` routes