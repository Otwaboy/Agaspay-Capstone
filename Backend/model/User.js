const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
 
const UserSchema = new mongoose.Schema
(
    {
    username:
     {
        type: String,
        required: [true, 'Username cannot be empty'],
        unique: true,
        minlength: [3 , 'Username cannot be a less than 3 letter'],
        maxlength: [16 , 'Username cannot be a greater than 16 letter']
     },
     password: 
     {
        type: String, 
        required: [true, 'Password Cannot be empty']
     },
    role:
     {
        type: String,
        enum: ['resident', 'admin', 'secretary', 'treasurer', 'maintenance', 'meter_reader'],
        required:[true, 'Must choose your role']
  }
    }
)

UserSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


UserSchema.methods.createJWT = function () {
      return jwt.sign({userId: this._id, name: this.username, role: this.role}, 
         process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
      
}

UserSchema.methods.comparePassword = async function (candidatePassword) {
   const matchPassword = await bcrypt.compare(candidatePassword, this.password)
   return matchPassword
}

module.exports = mongoose.model('User', UserSchema)