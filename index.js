const express = require('express')
require('./src/db/mongoose.js') //to run file and connect to db
const User = require('./src/models/user')
const Task = require('./src/models/task')

const app = express()
const port = process.env.PORT || 3000

// configure express to automatically parse incoming JSON to Object
app.use(express.json())

app.post('/users', (req, res) => {
    const user = new User(req.body);
    user.save().then((user) => {
        res.status(201).send(user)
    }).catch((e) => {
        res.status(400).send(e)
    })
})

app.get('/users', (req, res) => {
    User.find({}).then(users => {
        res.status(200).send(users);
    }).catch(error => {
        res.status(500).send(error);
    })
})

app.get('/users/:id', (req, res) => {
    const _id = req.params.id;
    User.findById(_id).then(user => {
        if(!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(user);
    }).catch(error => {
        res.status(500).send(error);
    })
})



app.post('/tasks', (req, res) => {
    const task = new Task(req.body);
    task.save().then((task) => {
        res.status(201).send(task);
    }).catch(e => {
        res.status(400).send(e);
    })
})

app.get('/tasks', async (req, res) => {
    Task.find({}).then(tasks => {
        res.status(200).send(tasks);
    }).catch(error => {
        res.status(500).send(error);
    })
})

app.get('/tasks/:id', (req, res) => {
    const _id = req.params.id;
    Task.findById({ _id }).then(task => {
        if(!task) {
            return res.status(404).send('Task not found');
        }
        res.status(200).send(task);
    }).catch(error => {
        res.status(500).send(error);
    })
})

app.listen(port, () => {
    console.log('Server is up')
})