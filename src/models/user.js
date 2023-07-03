const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const saltRounds = 8;
const secret = 'usersecret';

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
        unique: true, //create index in mongodb database to guarantee uniqueness
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
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

// Instance methods
// Generate auth token
userSchema.methods.getAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString()}, secret);

    // Add token to array and save to database
    this.tokens = this.tokens.concat({ token: token });
    await this.save();

    return token;
}

// Model methods
// method directly on the User model
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to log in')
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        throw new Error('Unable to log in')
    }

    return user;
}

// Hash the plain text password before saving
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