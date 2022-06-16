import Pmanager from '../models/Pmanager.js'
// status codes package
import { StatusCodes } from 'http-status-codes'
import { BadRequestError, UnAuthenticatedError } from '../errors/index.js'
import checkPermissions from '../utils/checkPermissions.js'

// createPassword
const createPassword = async (req, res) => {
  const { websiteName, userName, email, domainPassword } = req.body

  if (!websiteName || !userName || !email || !domainPassword) {
    throw new BadRequestError('Please Provide all values')
  }

  // for particular user
  req.body.createdBy = req.user.userId

  const passmanage = await Pmanager.create(req.body)
  res.status(StatusCodes.CREATED).json({ passmanage })
}

// getAllPassword
const getAllPassword = async (req, res) => {
  const passmanage = await Pmanager.find({ createdBy: req.user.userId })

  res
    .status(StatusCodes.OK)
    .json({ passmanage, totalPasswords: passmanage.length })
}

// updatePassword
const updatePassword = async (req, res) => {
  const { id: passId } = req.params

  const { websiteName, userName, email, domainPassword } = req.body

  if (!websiteName || !userName || !email || !domainPassword) {
    throw new BadRequestError('Please Provide all values')
  }

  const passmanage = await Pmanager.findOne({ _id: passId })

  if (!passmanage) {
    throw new NotFoundError(`No password id matches to ${passId}`)
  }

  checkPermissions(req.user, passmanage.createdBy)

  // findOneAndUpdate method
  const updatePassword = await Pmanager.findOneAndUpdate(
    { _id: passId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  res.status(StatusCodes.OK).json({ updatePassword })
}

// deletePassword
const deletePassword = async (req, res) => {
  const { id: passId } = req.params

  const passmanage = await Pmanager.findOne({ _id: passId })

  if (!passmanage) {
    throw new NotFoundError(`No password id matches to ${passId}`)
  }

  checkPermissions(req.user, passmanage.createdBy)

  await passmanage.remove()

  res.status(StatusCodes.OK).json({ msg: 'Your password is Removed' })
}

export { createPassword, getAllPassword, updatePassword, deletePassword }
