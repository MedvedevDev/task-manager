const express = require('express')
require('./src/db/mongoose.js') //to run file and connect to db
const userRouter = require('./src/routers/user')
const taskRouter = require('./src/routers/task')
const multer = require("multer");

const app = express()

// Configure port variable
const port = process.env.PORT || 3000

// configure express to automatically parse incoming JSON to Object
app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up')
})
