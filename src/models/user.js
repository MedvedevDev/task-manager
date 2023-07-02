const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const saltRounds = 8;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        min: [0, 'N must be positive']
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('invalid email')
            }
        }
    }
})

// 'pre' it is document middleware function - do something before user saved resource
userSchema.pre('save', async function (next) { // not arrow function because we need to bind 'this' here
    // this - refers to the document being saved/updated
    // isModified - it is mongoose method, checking if specified property modified
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    next()
})

const User = mongoose.model('users', userSchema)

module.exports = User