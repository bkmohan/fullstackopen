const supertest = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./helper')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeAll(async () => {
    await User.deleteMany({})

    for(let i = 0; i < helper.initalUsers.length; i++){
        const user = helper.initalUsers[i]
        const passwordHash = await bcrypt.hash(user.password, 10)
        user.passwordHash = passwordHash
        await new User(user).save()
    }

})

beforeEach( async () => {
    await Blog.deleteMany({})

    const blogs = helper.initialBlogs.map(blog => new Blog(blog))
    const promises = blogs.map(blog => blog.save())
    await Promise.all(promises)
})

describe("API GET: get all blogs api", () =>{
    test("blogs are returned as JSON", async () => {
        await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test("all blogs are returned", async () => {
        const response = await api.get('/api/blogs')

        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test("check if specific blog is returned", async () => {
        const response = await api.get('/api/blogs')

        expect(response.status).toBe(200)

        const contents = response.body.map(blog => blog.title)
        expect(contents).toContain('Go To Statement Considered Harmful')
    })
})


describe("API GET/id: get individual blog api", () => {
    test("blog has id property", async () => {
        const allBlogs = await helper.blogsInDb()
        const blogToView = allBlogs[1]

        expect(blogToView.id).toBeDefined()
    })

    test("blog is returned as JSON", async () => {
        const allBlogs = await helper.blogsInDb()
        const blogToView = allBlogs[1]

        await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    
    test("check correct blog is returned", async () => {
        const allBlogs = await helper.blogsInDb()
        const blogToView = allBlogs[1]

        const response = await api.get(`/api/blogs/${blogToView.id}`)

        expect(response.status).toBe(200)

        const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
        expect(response.body).toEqual(processedBlogToView)
    })

    test("check non existing blog", async () => {
        const id = await helper.nonExistingId()
        const response = await api.get(`/api/blogs/${id}`)

        expect(response.status).toBe(404)
    })

})


describe("API POST: Add blog api", () => {
    let loginSession

    beforeEach( async() => {
        const {name, username, password} = helper.initalUsers[0]
        loginSession = await api
                        .post('/login')
                        .send({username, password})
    })

    test("blogs count increased by one", async () => {
        const newBlog = {
            title: "React patterns +1",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
          }
        
        const beforeInsert = await helper.blogsInDb()
        const response = await api
                            .post('/api/blogs')
                            .set('Authorization', `Bearer ${loginSession.body.token}`)
                            .send(newBlog)
                            .expect(201)
                            .expect('Content-Type', /application\/json/)
        
        const afterInsert = await helper.blogsInDb()
        
        expect(afterInsert.length).toBe(beforeInsert.length + 1)
    })

    test("new blog added in proper format", async () => {
        const newBlog = {
            title: "React patterns +1",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
          }
        
        const response = await api
                            .post('/api/blogs')
                            .set('Authorization', `Bearer ${loginSession.body.token}`)
                            .send(newBlog)
        
        expect(response.body).toMatchObject(newBlog)
    })

    test("missing likes", async () => {
        const newBlog = {
            title: "React patterns +1",
            author: "Michael Chan",
            url: "https://reactpatterns.com/"
          }
        
        const response = await api
                            .post('/api/blogs')
                            .set('Authorization', `Bearer ${loginSession.body.token}`)
                            .send(newBlog)
        
        newBlog.likes = 0
        expect(response.body).toMatchObject(newBlog)
    })

    test("missing title", async () => {
        const newBlog = {
            author: "Michael Chan",
            url: "https://reactpatterns.com/"
          }
        
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${loginSession.body.token}`)
            .send(newBlog)
            .expect(400)
          
    })

    test("missing url", async () => {
        const newBlog = {
            title: "React patterns +1",
            author: "Michael Chan"
          }
        
        const response = await api
                            .post('/api/blogs')
                            .set('Authorization', `Bearer ${loginSession.body.token}`)
                            .send(newBlog)
                            .expect(400)
        
    })

    test("missing autorization token", async () => {
        const newBlog = {
            title: "React patterns +1",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
          }
        
        const response = await api
                            .post('/api/blogs')
                            .send(newBlog)
                            .expect(401)
    })

})


describe("API DELETE: Add blog api", () => {
    let loginSession
    let newAddedBlog

    beforeEach( async() => {
        const {name, username, password} = helper.initalUsers[0]
        loginSession = await api
                        .post('/login')
                        .send({username, password})
        
        const newBlog = {
            title: "React patterns +1",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            }
        
        newAddedBlog = await api
                            .post('/api/blogs')
                            .set('Authorization', `Bearer ${loginSession.body.token}`)
                            .send(newBlog)

    })

    test("delete blog, count test", async () => {
        const beforeDel = await helper.blogsInDb()
        
        const response = await api
                            .delete(`/api/blogs/${newAddedBlog.body.id}`)
                            .set('Authorization', `Bearer ${loginSession.body.token}`)
                            .expect(204)
        
        const afterDel = await helper.blogsInDb()
        
        expect(afterDel.length).toBe(beforeDel  .length - 1)
    })

    test("delete blog, check if proper blog is deleted", async () => {
        const beforeDel = await helper.blogsInDb()
        
        const response = await api
                            .delete(`/api/blogs/${newAddedBlog.body.id}`)
                            .set('Authorization', `Bearer ${loginSession.body.token}`)
                            .expect(204)
        
        const afterDel = await helper.blogsInDb()
        
        const beforeDelIds = beforeDel.map(blog => blog.id)
        const afterDelIds = afterDel.map(blog => blog.id)

        expect(afterDelIds).not.toContain(beforeDelIds)
    })

    test("delete blog, without token", async () => {
        const beforeDel = await helper.blogsInDb()
        
        const response = await api
                            .delete(`/api/blogs/${newAddedBlog.body.id}`)
                            .expect(401)
        
    })

    test("delete blog, by different user", async () => {
        const {name, username, password} = helper.initalUsers[1]
        const loginSession2 = await api
                        .post('/login')
                        .send({username, password})

        
        response = await api
                            .delete(`/api/blogs/${newAddedBlog.body.id}`)
                            .set('Authorization', `Bearer ${loginSession2.body.token}`)
                            .expect(401)
    })

})


describe("API PUT: Updatte blog api", () => {
    let loginSession
    let newAddedBlog

    beforeEach( async() => {
        const {name, username, password} = helper.initalUsers[0]
        loginSession = await api
                        .post('/login')
                        .send({username, password})

        const newBlog = {
            title: "React patterns +1",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            }
        
        newAddedBlog = await api
                            .post('/api/blogs')
                            .set('Authorization', `Bearer ${loginSession.body.token}`)
                            .send(newBlog)
    })
    
    test("Update blog", async () => {
        
        const response = await api
                            .put(`/api/blogs/${newAddedBlog.body.id}`)
                            .set('Authorization', `Bearer ${loginSession.body.token}`)
                            .send({likes : 20, title: 'updated title'})  
                            .expect(201)
                            
        const updatedBlog = newAddedBlog.body
        updatedBlog.likes = 20
        updatedBlog.title = 'updated title'
        expect(response.body).toMatchObject(updatedBlog)
    })

    test("Update blog different user", async () => {
        const initialBlogs = await helper.blogsInDb()

        const {name, username, password} = helper.initalUsers[1]
        const loginSession2 = await api
                        .post('/login')
                        .send({username, password})
        
        const response = await api
                            .put(`/api/blogs/${newAddedBlog.body.id}`)
                            .set('Authorization', `Bearer ${loginSession2.body.token}`)
                            .send({likes : 20, title: 'updated title'})
                            .expect(401)
        
    })

    test("Update blog without login", async () => {
        const initialBlogs = await helper.blogsInDb()
        
        const response = await api
                            .put(`/api/blogs/${newAddedBlog.body.id}`)
                            .send({likes : 20, title: 'updated title'})
                            .expect(401)
        
    })

    
})

afterAll( async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})
})