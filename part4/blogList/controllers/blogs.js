const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {name: 1, username: 1})
    return response.json(blogs)
})

blogsRouter.get('/:id', async (request, response, next) => {
    try{
        const blog = await Blog.findById(request.params.id)
        if(blog){
            response.json(blog)
        }
        else{
            response.status(404).end()
        }
    }
    catch(error){
        response.status(400).end()
        next(error)
    }
})

blogsRouter.post('/', async (request, response, next) => {
    try{
        const body = request.body

        if(!request.userId){
            return response.status(401).json({error : 'token missing or invalid'})
        }

        if(!'title' in body){
            return response.status(400).json({"error" : 'missing url'})
        }

        if(!'url' in body){
            return response.status(400).json({"error" : 'missing url'})
        }

        const user = await User.findById(request.userId)

        const blog = new Blog({
            title : body.title,
            author : body.author,
            url : body.url,
            likes: body.likes ? body.likes : 0,
            user: user._id
        })
    
    
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        return response.status(201).json(savedBlog)
    }
    catch(error){
         next(error)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body
    const params = Object.keys(body)
    
    const blog = {}

    if(params.includes('title')) blog.title = body.title
    if(params.includes('author')) blog.author = body.author
    if(params.includes('url')) blog.url = body.url
    if(params.includes('likes')) blog.likes = body.likes


    if(!request.userId){
            return response.status(401).json({error : 'token missing or invalid'})
        }

    if(blog){
        try{
            let updatedBlog = await Blog.findOneAndUpdate({_id : request.params.id, user : {_id : request.userId}},
                                                                body, {new:true})
        
            if(!updatedBlog) {
                return response.status(401).json({error : "invalid blog id"})
            }
            
            return response.status(201).json(updatedBlog)
        }
        catch(error){
            response.status(400).end()
            next(error)
        }
    }
    else{
        response.status(201).end()
    }
})

blogsRouter.delete("/:id", async (request, response, next) => {
    try{
        if(!request.userId){
            return response.status(401).json({error : 'token missing or invalid'})
        }

        const blog = await Blog.findOne({_id : request.params.id, user : {_id : request.userId}})
        
        if(!blog) {
            return response.status(401).json({error : "invalid blog id"})
        }
        await blog.remove()
        response.status(204).end()
    }
    catch(error){
        next(error)
    }
})


module.exports = blogsRouter

