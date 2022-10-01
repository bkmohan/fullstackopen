const config = require('./utils/config')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const middleware = require('./utils/middlewares')
const blogRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')


const app = express()

logger.info("connecting to", config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then( () => {
        logger.info('connected to MongoDB')
    })
    .catch( error => {
        logger.error('error connecting to MongoDB', error.message)
    })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/blogs', middleware.userExtractor, blogRouter)
app.use('/api/users', userRouter)
app.use('/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app

