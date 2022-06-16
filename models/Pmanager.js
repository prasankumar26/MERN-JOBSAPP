import mongoose from 'mongoose'

// email validation
import validator from 'validator'

const PmanagerSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      trim: true,
      required: [true, 'Please Provide Domain name'],
      min: [2, 'Must be at least 6, got {VALUE}'],
      max: 30,
    },
    userName: {
      type: String,
      trim: true,
      required: [true, 'Please Provide User name'],
      min: [2, 'Must be at least 6, got {VALUE}'],
      max: 30,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email',
      },
    },
    domainPassword: {
      type: Number,
      required: [true, 'Please Provide Domain Password'],
      min: [2, 'Must be at least 6, got {VALUE}'],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please Provide User'],
    },
  },
  { timestamps: true }
)

export default mongoose.model('Pmanager', PmanagerSchema)
