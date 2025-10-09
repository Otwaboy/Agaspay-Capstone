const { StatusCodes } = require('http-status-codes');
const Rate = require('../model/Rate');
const { BadRequestError } = require('../errors');

// ✅ CREATE RATE
const createRate = async (req, res) => {
  try {
    const { amount, effective_date, rate_status } = req.body;

    if (!amount || !effective_date || !rate_status) {
      throw new BadRequestError('Must provide amount, effective date, and status');
    }

    // If new rate is "active", deactivate all previous ones
    if (rate_status === 'active') {
      await Rate.updateMany({ rate_status: 'active' }, { $set: { rate_status: 'inactive' } });
    }

    // Save the new rate
    const rate = await Rate.create({
      amount,
      effective_date: new Date(effective_date),
      rate_status,
    });

    res.status(StatusCodes.CREATED).json({ rate });

  } catch (error) {
    console.error("🔥 createRate error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// ✅ GET LATEST ACTIVE RATE
const getRate = async (req, res) => {
  try {
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

  } catch (error) {
    console.error("🔥 getRate error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = { createRate, getRate };
