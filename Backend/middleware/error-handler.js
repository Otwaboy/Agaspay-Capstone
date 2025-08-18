const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = (err, req, res, next) => {

  let customError = {
    //set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'something went wrong try again later'
  }

  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: customError.msg})
  return res.status(customError.statusCode).json({msg: customError.msg})
}


module.exports = errorHandlerMiddleware
   