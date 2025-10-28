const Receipt = require('../model/Receipt');
const Payment = require('../model/Payment');
const Billing = require('../model/Billing');

// Generate temporary receipt (after online payment)
const generateTemporaryReceipt = async (req, res) => {
  try {
    const { payment_id } = req.body;
    
    const payment = await Payment.findById(payment_id).populate('bill_id');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const bill = await Billing.findById(payment.bill_id).populate({
      path: 'connection_id',
      populate: { path: 'resident_id' }
    });

    const receipt = await Receipt.create({
      payment_id: payment._id,
      bill_id: bill._id,
      resident_id: bill.connection_id.resident_id._id,
      receipt_type: 'temporary',
      amount: payment.amount_paid,
      payment_method: payment.payment_method
    });

    await payment.updateOne({ official_receipt_status: 'temporary_receipt' });

    res.status(201).json({
      success: true,
      message: 'Temporary receipt generated',
      receipt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate official receipt (Treasurer after confirmation)
const generateOfficialReceipt = async (req, res) => {
  try {
    const { payment_id } = req.body;
    const user = req.user;

    if (user.role !== 'treasurer') {
      return res.status(403).json({ message: 'Only Treasurer can issue official receipts' });
    }

    const payment = await Payment.findById(payment_id).populate('bill_id');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.payment_status !== 'confirmed') {
      return res.status(400).json({ message: 'Payment must be confirmed first' });
    }

    const bill = await Billing.findById(payment.bill_id).populate({
      path: 'connection_id',
      populate: { path: 'resident_id' }
    });

    const receipt = await Receipt.create({
      payment_id: payment._id,
      bill_id: bill._id,
      resident_id: bill.connection_id.resident_id._id,
      receipt_type: 'official',
      amount: payment.amount_paid,
      payment_method: payment.payment_method,
      issued_by: user.userId
    });

    await payment.updateOne({ official_receipt_status: 'official_receipt' });

    res.status(201).json({
      success: true,
      message: 'Official receipt generated',
      receipt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get receipts for a resident
const getResidentReceipts = async (req, res) => {
  try {
    const { resident_id } = req.params;

    const receipts = await Receipt.find({ resident_id })
      .populate('payment_id')
      .populate('bill_id')
      .populate('issued_by', 'first_name last_name')
      .sort({ issued_date: -1 });

    res.status(200).json({
      success: true,
      receipts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get receipt by ID
const getReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findById(id)
      .populate('payment_id')
      .populate('bill_id')
      .populate('resident_id')
      .populate('issued_by', 'first_name last_name');

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.status(200).json({
      success: true,
      receipt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateTemporaryReceipt,
  generateOfficialReceipt,
  getResidentReceipts,
  getReceipt
};
