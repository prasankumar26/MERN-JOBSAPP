import mongoose from 'mongoose'

// email validation
import validator from 'validator'

// hash password package
import bcrypt from 'bcryptjs'

// jwt
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please Provide name'],
    min: [2, 'Must be at least 6, got {VALUE}'],
    max: 30,
  },
  lastName: {
    type: String,
    trim: true,
    max: 30,
    default: 'lastname',
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email',
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please Provide Password'],
    min: [6, 'Must be at least 6, got {VALUE}'],
    select: false,
  },
  location: {
    type: String,
    trim: true,
    max: 30,
    default: 'my city',
  },
})

// hash password
UserSchema.pre('save', async function () {
  // console.log(this.modifiedPaths());
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// create jwt token
UserSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })
}

// compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password)
  return isMatch
}

export default mongoose.model('User', UserSchema)
