import Job from '../models/Job.js'
// status codes package
import { StatusCodes } from 'http-status-codes'
import { BadRequestError, UnAuthenticatedError } from '../errors/index.js'
import checkPermissions from '../utils/checkPermissions.js'
import mongoose from 'mongoose'
import moment from 'moment'

// createJob
const createJob = async (req, res) => {
  // destructure from req.body
  const { company, position } = req.body

  // if one of them missing throw error
  if (!company || !position) {
    throw new BadRequestError('Please provide All values')
  }

  // for particular user
  req.body.createdBy = req.user.userId

  // create Job
  const job = await Job.create(req.body)
  res.status(StatusCodes.CREATED).json({ job })
}

// getAllJobs
const getAllJobs = async (req, res) => {
  // search functionality
  const { status, jobType, sort, search } = req.query

  // user
  const queryObject = {
    createdBy: req.user.userId,
  }

  // add stuff based on condtion
  if (status && status !== 'all') {
    queryObject.status = status
  }

  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType
  }

  if (search) {
    queryObject.position = { $regex: search, $options: 'i' }
  }

  // find user id created in Middleware NO AWAIT
  let result = Job.find(queryObject)

  if (sort === 'latest') {
    result = result.sort('-createdAt')
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt')
  }
  if (sort === 'a-z') {
    result = result.sort('position')
  }
  if (sort === 'z-a') {
    result = result.sort('-position')
  }

  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 5
  const skip = (page - 1) * limit

  result = result.skip(skip).limit(limit)

  // chain sort conditions
  const jobs = await result

  const totalJobs = await Job.countDocuments(queryObject)
  const numOfPages = Math.ceil(totalJobs / limit)

  // Get all Jobs
  res.status(StatusCodes.OK).json({ jobs, totalJobs: jobs.length, numOfPages })
}

// update job
const updateJob = async (req, res) => {
  // destruture from routes params
  const { id: jobId } = req.params

  // destructure req.body
  const { company, position } = req.body

  // if company or position empty throw error
  if (!company || !position) {
    throw new BadRequestError('Please Provide all values')
  }

  // find _id matchs jobId (req.params)
  const job = await Job.findOne({ _id: jobId })

  // if job id not match throw error
  if (!job) {
    throw new NotFoundError(`No job id matches ${jobId}`)
  }

  // check job created by user - code in middleware checkPermissions.js
  checkPermissions(req.user, job.createdBy)

  // findOneAndUpdate method
  const updatedJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
    new: true,
    runValidators: true,
  })

  // update job
  res.status(StatusCodes.OK).json({ updatedJob })
}

// deleteJob
const deleteJob = async (req, res) => {
  // destruture from routes params
  const { id: jobId } = req.params

  // find _id matchs jobId (req.params)
  const job = await Job.findOne({ _id: jobId })

  // if job id not match throw error
  if (!job) {
    throw new NotFoundError(`No job id matches ${jobId}`)
  }

  // check job created by user - code in middleware checkPermissions.js
  checkPermissions(req.user, job.createdBy)

  // remove method
  await job.remove()

  // job removed
  res.status(StatusCodes.OK).json({ msg: 'Success Job Removed' })
}

// showStats
const showStats = async (req, res) => {
  //  stats interview/pending/declined
  let stats = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr
    acc[title] = count
    return acc
  }, {})

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  }

  // monthlyApplications
  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 4 },
  ])

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y')
      return { date, count }
    })
    .reverse()

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications })
}

export { createJob, getAllJobs, updateJob, deleteJob, showStats }
