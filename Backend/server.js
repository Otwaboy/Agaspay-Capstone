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


//cors
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:5000', // Replit server
    'http://localhost:3000'  // Your backend
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

//import routes
const authRoutes = require('./routes/auth')
const meterReadingRoutes = require('./routes/meter-reading')
const rateRoutes = require('./routes/rate')
const billingRoutes = require('./routes/billing') 
const paymentRoutes = require('./routes/payment')


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




//error handler
app.use(notFoundErrorMiddleware)
app.use(errorHandlerMiddleware)

//port
const port = process.env.PORT || 3000

const start  = async ()=> {

        try {
            await connectDB(process.env.MONGO_URI)
            app.listen(port, ()=> {console.log(`Server is listening to port ${port}`);})
        } catch (error) {
            console.log(error);
            
        }
}

start()
