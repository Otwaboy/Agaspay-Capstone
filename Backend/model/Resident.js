const mongoose = require('mongoose');

const ResidentSchema = new mongoose.Schema(
  {
    user_id:
     {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'please provide a user']
    },
    first_name: 
    {
      type: String,
      required: [true, 'First name cannot be empty']
    },
    last_name: 
    {
      type: String,
      required: [true, 'Last name cannot be empty']
    },
    zone: 
    {
      type: Number,
      enum: [1, 2, 3],
      required: [true, 'Zone is required']
    },
    purok: 
    {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7],
      required: [true, 'Purok is required']
    },
    contact_no: 
    {
      type: String,
      required: [true, 'Contact number cannot be empty'],
      match: [/^09\d{9}$/, 'Please enter a valid PH number (e.g., 09XXXXXXXXX)']
    },
    status: 
    {
      type: String,
      enum: ['active', 'inactive'],
      required: [true, 'Status of water connection is required'],
      default: 'active'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('Resident', ResidentSchema);
