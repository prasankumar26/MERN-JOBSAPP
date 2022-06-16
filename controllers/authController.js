import User from '../models/User.js'

// status codes package
import { StatusCodes } from 'http-status-codes'
import { BadRequestError, UnAuthenticatedError } from '../errors/index.js'

// register
const register = async (req, res) => {
  // destructure values
  const { name, email, password } = req.body
  // check empty values
  if (!name || !email || !password) {
    throw new BadRequestError('Please Provide All Valuess')
  }
  // email already in use
  const userAlreadyExists = await User.findOne({ email })
  if (userAlreadyExists) {
    throw new BadRequestError('Email already in Use')
  }
  //  create User
  const user = await User.create({ name, email, password })
  // jwt invoke
  const token = user.createJWT()
  res.status(StatusCodes.CREATED).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
    },
    token,
    location: user.location,
  })
}

// login
const login = async (req, res) => {
  // destructure values
  const { email, password } = req.body

  //  if email or pass empty throw error
  if (!email || !password) {
    throw new BadRequestError('please provide all Values')
  }

  //  find user / email and select password
  const user = await User.findOne({ email }).select('+password')

  //  if user empty throw error
  if (!user) {
    throw new UnAuthenticatedError('Invalid Credentials')
  }

  //  compare password
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError('Invalid Credentials')
  }

  // invoke JWT
  const token = user.createJWT()
  // remove password
  user.password = undefined
  // send user
  res.status(StatusCodes.OK).json({ user, token, location: user.location })
}

// updateUser
const updateUser = async (req, res) => {
  // destructure in model req.body
  const { email, name, lastName, location } = req.body

  // if one of them missing throw error
  if (!email || !name || !lastName || !location) {
    throw new BadRequestError('Please provide all values')
  }

  // find user by Userid created in Middleware
  const user = await User.findOne({ _id: req.user.userId })

  // update the all values
  user.email = email
  user.name = name
  user.lastName = lastName
  user.location = location

  // instance method
  await user.save()

  // invoke JWT
  const token = user.createJWT()

  // send user
  res.status(StatusCodes.OK).json({ user, token, location: user.location })
}

export { register, login, updateUser }
