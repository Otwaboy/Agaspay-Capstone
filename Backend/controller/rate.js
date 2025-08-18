const { StatusCodes } = require('http-status-codes')
const Rate = require('../model/Rate')
const { BadRequestError } = require('../errors')
 

const createRate = async (req, res) => {
    const {amount , effective_date, rate_status} = req.body

    if(!amount || !effective_date || !rate_status){
        throw new BadRequestError('Must provide amount rate and effective date')
    }

    const rate = await Rate.create(req.body)
    
    res.status(StatusCodes.CREATED).json({rate})

    
}

module.exports = {createRate}