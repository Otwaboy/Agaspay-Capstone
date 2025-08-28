const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

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
      enum: ['admin', 'secretary', 'treasurer', 'maintenance', 'meter_reader'],
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
    purok: 
    {
      type: String,
      enum: ["1", "2", "3", "4", "5", "6", "7"],
      required: [true, 'Purok is required']
    },
    contact_no: 
    {
      type: String,
      required: [true, 'Contact number cannot be empty'],
      match: [/^09\d{9}$/, 'Please enter a valid PH number (e.g., 09XXXXXXXXX)']
    },
     email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
   assigned_zone: {
  type: String,
  required: function () {
    return this.role === 'meter_reader';
  },
  validate: {
    validator: function (val) {
      if (this.role === 'meter_reader') {
        return ['1', '2', '3'].includes(val);
      }
      return true; 
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


PersonnelSchema.pre('save', async function(next){
  if (!this.isModified('email')) return next();
  const salt = await bcrypt.genSalt(10);
  this.email = await bcrypt.hash(this.email, salt);
  next();
});


module.exports = mongoose.model('Personnel', PersonnelSchema);
