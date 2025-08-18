const { UnauthorizedError } = require("../errors")

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)){
            throw new UnauthorizedError('Access Denied')
        }

        next()
    }
}
 
module.exports = roleMiddleware