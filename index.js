const express = require('express')
require('./src/db/mongoose.js') //to run file and connect to db
const Task = require('./src/models/task')
const userRouter = require('./src/routers/user')
const taskRouter = require('./src/routers/task')

const app = express()

// Configure port variable
const port = process.env.PORT || 3000

// new request -> middleware -> run route handler
// next() - letting express know that we are done with middleware function and pass to run route handler


// configure express to automatically parse incoming JSON to Object
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up')
})

const v = {
    name: 'Alllllex',
    age: 11
}

v.toJSON = function () {
    return this.age

}
console.log(JSON.stringify(v))