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


//cors allowing cross origin request
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:5000', // Replit frontend port
    'http://0.0.0.0:5000',   // Replit frontend
    `https://${process.env.REPLIT_DOMAINS}`, // Replit deployment domain
    'http://localhost:3000'  // Backend
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

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


//cors
app.use(cors(corsOptions));




//extra packages 
app.use(express.json())


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


//webhooks
app.use("/paymongo/webhook",require("./routes/webhook"));

//error handler
app.use(notFoundErrorMiddleware)
app.use(errorHandlerMiddleware)

//port
const port = process.env.PORT || 3000

const start  = async ()=> {

        try {
            await connectDB(process.env.MONGO_URI)
            app.listen(port, 'localhost', ()=> {console.log(`Server is listening on localhost:${port}`);})
        } catch (error) {
            console.log(error);
            
        }
}

start()
