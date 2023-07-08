const mongoose = require('mongoose')
require('dotenv').config({path: __dirname + '/.env'})

mongoose.connect(process.env.MONGODB_URL)