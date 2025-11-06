// Backend file: server.js
require('dotenv').config()
require('express-async-errors')

const express = require('express')
const cors = require('cors');
const app = express()


//import database Connection
const connectDB = require('./connect/connect')

//import Middleware 
const notFoundErrorMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')


// --- ✅ ROBUST CORS CONFIGURATION ---

// List of explicitly allowed origins
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Local backend if needed
  'https://agaspay-frontend.vercel.app', // Main production alias
  // Add the newest one explicitly just in case the regex fails
  'https://agaspay-frontend-pyad6f4fw-otwaboys-projects.vercel.app', 
];

// Regex to allow ALL Vercel preview/deployment URLs for your project structure
const vercelPreviewRegex = /^https:\/\/agaspay-frontend-([a-z0-9]+-)*otwaboys-projects\.vercel\.app$/;

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like Postman or server-to-server)
        if (!origin) return callback(null, true); 

        // Check if the origin is in the explicit list OR matches the Vercel preview regex
        if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
            return callback(null, true);
        }

        // Block the request
        callback(new Error(`CORS policy: Origin ${origin} not allowed.`), false);
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true
};

app.use(cors(corsOptions)); // Use the defined options object

// --- END ROBUST CORS CONFIGURATION ---


//import routes
const authRoutes = require('./routes/auth')
const meterReadingRoutes = require('./routes/meter-reading')
const rateRoutes = require('./routes/rate')
const billingRoutes = require('./routes/billing') 
const paymentRoutes = require('./routes/payment')
const manageUserRoutes = require('./routes/manage-user')
const waterConnectionRoutes = require('./routes/water-connection')
const IncidentReportRoutes = require('./routes/Incident-reports')
const scheduleTaskRoutes = require('./routes/schedule-task')
const assignmentRoutes= require('./routes/assignments')
const announcementRoutes = require('./routes/announcement')
const waterScheduleRoutes = require('./routes/water-schedule')
const receiptRoutes = require('./routes/receipt')
const archiveRoutes = require('./routes/archive')
const connectionManagementRoutes = require('./routes/connection-management')
const dashboardRoutes = require('./routes/dashboard')
const personnelRoutes = require('./routes/personnel')
const reportsRoutes = require('./routes/reports')


//extra packages 
app.use(express.json())
 
app.get('/', (req, res) => {res.status(200).json({message: 'Hello Vercel!'})})
//routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/meter-reader', meterReadingRoutes) 
app.use('/api/v1/rate', rateRoutes)
app.use('/api/v1/billing', billingRoutes)
app.use('/api/v1/payment', paymentRoutes) 
app.use('/api/v1/user', manageUserRoutes)
app.use('/api/v1/water-connection', waterConnectionRoutes)
app.use('/api/v1/incident-report', IncidentReportRoutes)
app.use('/api/v1/schedule-task', scheduleTaskRoutes)
app.use('/api/v1/assignments', assignmentRoutes)
app.use('/api/v1/announcements', announcementRoutes)
app.use('/api/v1/water-schedules', waterScheduleRoutes)
app.use('/api/v1/receipts', receiptRoutes)
app.use('/api/v1/archive', archiveRoutes)
app.use('/api/v1/connection-management', connectionManagementRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/personnel', personnelRoutes)
app.use('/api/v1/reports', reportsRoutes)


//webhooks
app.use("/paymongo/webhook",require("./routes/webhook"));

//error handler
app.use(notFoundErrorMiddleware)
app.use(errorHandlerMiddleware)

//port
const port = process.env.PORT || 3000

const start  = async ()=> {

        try {
            await connectDB(process.env.MONGO_URI)
            app.listen(port, ()=> {console.log(`Server is listening on :${port}`);})
        } catch (error) {
            console.log(error);
            
        }
}

start()