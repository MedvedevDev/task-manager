const express = require('express')
require('dotenv').config({path: __dirname + '/.env'})
require('./src/db/mongoose.js') //to run file and connect to db
const userRouter = require('./src/routers/user')
const taskRouter = require('./src/routers/task')

const app = express()

// Configure port variable
const port = process.env.PORT

// configure express to automatically parse incoming JSON to Object
app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})
