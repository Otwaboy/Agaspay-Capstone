const mongoose = require('mongoose');

const PersonnelSchema = new mongoose.Schema(
  {
    user_id: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: 
    {
      type: String,
      enum: ['admin', 'secretary', 'treasurer', 'maintenance', 'meter reader'],
      required: [true, 'Personnel role is required']
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
    contact_no: 
    {
      type: String,
      required: [true, 'Contact number cannot be empty'],
      match: [/^09\d{9}$/, 'Please enter a valid PH number (e.g., 09XXXXXXXXX)']
    },
    assigned_zone: {
      type: Number,
      enum: [1, 2, 3],
      required: function () {
        return this.role === 'meter reader';
    },
      validate: {
        validator: function (val) {
          if (this.role === 'meter reader') {
            return [1, 2, 3].includes(val);
          }
          return true; // If not meter reader, it's valid regardless
        },
        message: 'Assigned zone must be 1, 2, or 3 for meter readers'
      }
  },
    created_at: { 
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('Personnel', PersonnelSchema);
