const mongoose = require('mongoose');

const WaterConnectionSchema = new mongoose.Schema({
     
  resident_id: 
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  meter_no:  
  {
    type: String, 
    required: [true, 'Meter number is required'],
    unique: true
  },
  connection_status: 
  {
    type: String,
    enum: ['pending', 'active', 'for_disconnection', 'scheduled_for_disconnection', 'disconnected', 'scheduled_for_reconnection'],
    default: 'pending'
  }, 
  // purok: 
  // {
  //   type: String, 
  //   enum: ["1", "2", "3", "4", "5", "6", "7"],
  //   // required: [true, 'Purok is required']
  // },
  type: 
  {
    type: String,
    enum: ['household', 'restaurant', 'establishment', 'others'],
    required: [true, 'Connection type is required']
  },
  created_at: 
  {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WaterConnection', WaterConnectionSchema);
