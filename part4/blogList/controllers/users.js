const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1, url:1, likes:1 })
    response.json(users)
})

userRouter.post('/', async (request, response, next) => {
    const { username, name, password }  = request.body

    const existingUsers = await User.findOne({ username })

    if(existingUsers){
        return response.status(400).json({ 'error' : 'username must be unique' })
    }

    if(!username || username.length < 3){
        return response.status(400).json({ 'error' : 'username must have minmum 3 chanracters' })
    }

    if(!password || password.length < 3){
        return response.status(400).json({ 'error' : 'password must have minmum 3 chanracters' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    try{
        const user = new User({
            name, username, passwordHash
        })

        const savedUser = await user.save()

        response.status(201).json(savedUser)
    }
    catch(error){
        next(error)
        response.status(400)
    }
})

module.exports = userRouter