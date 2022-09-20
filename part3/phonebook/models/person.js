
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log('conmecting to', url)


mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MonogDb', error.message)
    })


const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, 'must be more than 3 characters'],
        required: [true, 'User name required']
    },
    number: {
        type: String,
        required: [true, 'User phone number required'],
        validate: {
            validator: function(v) {
                return /\d{2,3}-\d{7,}/.test(v)
            },
            message: props => `${props.value} is not a valid phone number!`
        },
    }
})

personSchema.set('toJSON', {
    transform : (document, returnObject) => {
        returnObject.id = returnObject._id.toString()
        delete returnObject._id
        delete returnObject.__v
    }
})


const Person = mongoose.model('Person', personSchema)

module.exports = Person