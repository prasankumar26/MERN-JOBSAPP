import express from 'express'
const router = express.Router()

import {
  createPassword,
  getAllPassword,
  updatePassword,
  deletePassword,
} from '../controllers/pmController.js'

router.route('/').post(createPassword).get(getAllPassword)
router.route('/:id').delete(deletePassword).patch(updatePassword)

export default router
