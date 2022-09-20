require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())


// morgan('tiny')
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/', (request, response) => {
    response.send('Its live')
})

app.get('/info', (request, response) => {
    Person.find({})
        .then(result => {
            let body = `<p>Phonebook has info of ${result.length} people</p> <p>${new Date()}</p>`
            response.send(body)
        })
})


app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(result => response.json(result))
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person){
                response.json(person)
            }
            else{
                response.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then( result => {
            response.status(204).end()
        })
        .catch(error => next(error))

})

app.post('/api/persons/', (request, response, next) => {
    const body = request.body

    const person = new Person({
        name : body.name,
        number : body.number
    })

    console.log(person)
    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => {
            next(error)
            console.log(error.message)
            return error.message
        })

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name : body.name,
        number : body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators:true, context:'query' } )
        .then(updatedPerson => response.json(updatedPerson))
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError'){
        return response.status(400).send({ error:'malformed id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`)
})