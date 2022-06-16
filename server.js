import express from 'express'
const app = express()

// dotenv
import dotenv from 'dotenv'
dotenv.config()

//in Controllers async await no need to use if u use this package
import 'express-async-errors'

// to check error logs
import morgon from 'morgan'

// production build security packages
import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'

// db
import connectDB from './db/connect.js'

// notfound middleware
import notFoundMiddileware from './middleware/not-found.js'
import errorHandlerMiddileware from './middleware/error-handler.js'

// auth js
import authenticateUser from './middleware/auth.js'

// routes
import authRouter from './routes/authRoutes.js'
import jobsRouter from './routes/jobRoutes.js'
import pManagerRoute from './routes/pmanager.js'

// production build
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

// morgon
if (process.env.NODE_ENV !== 'production') {
  app.use(morgon('dev'))
}

// production build
const __dirname = dirname(fileURLToPath(import.meta.url))

// production build
app.use(express.static(path.resolve(__dirname, './client/build')))
// If you not use this req.body will undefined
app.use(express.json())
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())

// ge route
app.get('/', (req, res) => {
  res.send('Hello Backend')
})

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)
app.use('/api/v1/pmanager', authenticateUser, pManagerRoute)

// only when ready to deploy
app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

// notfound middleware
app.use(notFoundMiddileware)
app.use(errorHandlerMiddileware)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
