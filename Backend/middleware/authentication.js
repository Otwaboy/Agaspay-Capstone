const { BadRequestError, UnauthorizedError } = require("../errors")
const jwt = require('jsonwebtoken')

const authMiddleware = async (req, res, next ) => {
 
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer ')){ 
        throw new BadRequestError('No token have seen')
    }

    const token = authHeader.split(' ')[1]

    try {
        console.log('JWT SECRET VERIFYING:', process.env.JWT_SECRET);
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = 
        {
            userId: payload.userId,
            username: payload.name,
            role: payload.role
        }
        next()
          
    } catch (error) {
        throw new UnauthorizedError('Authentication invalid shesh')
        
    }
}


module.exports = authMiddleware
