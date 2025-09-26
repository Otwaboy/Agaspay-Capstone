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

// GET /api/v1/rate
const getRate = async (req, res) => {
  // get only the active/latest rate
        const rate = await Rate.findOne({ rate_status: 'active' }).sort({ effective_date: -1 });

        if (!rate) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'No active rate found' });
        }
            res.status(StatusCodes.OK).json({
                rate_id: rate._id,
                amount: rate.amount,
                effective_date: rate.effective_date,
                status: rate.rate_status,
            });
            };      

module.exports = {createRate, getRate}