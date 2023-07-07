const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')
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
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

// Instance methods
// Generate auth token
userSchema.methods.getAuthToken = async function () {
    const user = this;

    const token = jwt.sign({ _id: user._id.toString()}, secret);

    // Add token to array and save to database
    user.tokens = user.tokens.concat({ token: token });
    await user.save();

    return token;
}

// Method for returning only public data
// Behind the scenes res.send() uses JSON.stringify() method. We override its behaviour by applying the toJSON() method.
// We use toJSON method to apply this for every route where 'user' is sent back to client (res.send(user))
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}
// userSchema.methods.getUserPublicData = function () {
//     const user = this;
//     const userObject = user.toObject();
//
//     delete userObject.password;
//     delete userObject.tokens;
//
//     return userObject;
// }

// virtual property - it`s relationship between two enteties (user-task)
userSchema.virtual('tasks', {
    ref: 'tasks',
    localField: '_id', // name of the field in CURRENT(USERS) model that created relationship
    foreignField: 'createdBy' // name of the field in the TASKS model that creates relationship
})

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

    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, saltRounds);
    }

    next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({ createdBy: user._id })
    next()
})

const User = mongoose.model('users', userSchema)

module.exports = User