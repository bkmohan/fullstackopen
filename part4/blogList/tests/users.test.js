const supertest = require('supertest')
const User = require('../models/user')
const app = require('../app')
const mongoose = require('mongoose')
const helper = require('./helper')
const bcrypt = require('bcrypt')

const api = supertest(app)


beforeEach(async () => {
    await User.deleteMany({})


    for(let i = 0; i < helper.initalUsers.length; i++){
        const user = helper.initalUsers[i]
        const passwordHash = await bcrypt.hash(user.password, 10)
        user.passwordHash = passwordHash
        await new User(user).save()
    }

})


describe('API USER GET', () => {
    test('getting all users', async () => {
        const response = await api.get('/api/users')

        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(helper.initalUsers.length)

    })
})

describe('API USER POST', () => {
    test('user is being added', async () => {
        const initalUsers = await helper.usersInDb()

        const user = {
            'name' : 'naveen',
            'username' : 'naveenls',
            'password' : '123456'
        }

        await api
            .post('/api/users')
            .send(user)
            .expect(201)

        const afterUsers = await helper.usersInDb()

        expect(initalUsers.length + 1).toBe(afterUsers.length)

        const usernames = afterUsers.map(user => user.username)
        expect(usernames).toContain('naveenls')
    })

    test('unique username', async() => {
        const initalUsers = await helper.usersInDb()

        const user = {
            'name' : 'naveen',
            'username' : initalUsers[0].username,
            'password' : '123456'
        }

        await api
            .post('/api/users')
            .send(user)
            .expect(400)
    })

    test('missing username or password', async () => {
        let user = {
            'name' : 'naveen',
            'password' : '123456'
        }

        await api
            .post('/api/users')
            .send(user)
            .expect(400)

        user = {
            'name' : 'naveen',
            'username' :' initalUsers[0].username'
        }

        await api
            .post('/api/users')
            .send(user)
            .expect(400)
    })

    test('password hashing', async () => {
        const user = {
            'name' : 'naveen',
            'username' : 'naveenls',
            'password' : '123456'
        }

        await api
            .post('/api/users')
            .send(user)
            .expect(201)

        const newUser = await User.findOne({ 'username' : 'naveenls' })
        const validPassword = await bcrypt.compare(user.password, newUser.passwordHash)

        expect(validPassword).toBeTruthy()
    })
})


afterAll(async () => {
    await User.deleteMany({})
})