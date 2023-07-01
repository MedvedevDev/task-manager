const express = require('express')
require('./src/db/mongoose.js') //to run file and connect to db
const User = require('./src/models/user')
const Task = require('./src/models/task')
const trace_events = require("trace_events");

const app = express()
const port = process.env.PORT || 3000

// configure express to automatically parse incoming JSON to Object
app.use(express.json())

// Add new user
app.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }

    // user.save().then((user) => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

// Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }

    // User.find({}).then(users => {
    //     res.status(200).send(users);
    // }).catch(error => {
    //     res.status(500).send(error);
    // })
})

// Get user by ID
app.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }

    // User.findById(_id).then(user => {
    //     if(!user) {
    //         return res.status(404).send('User not found');
    //     }
    //     res.status(200).send(user);
    // }).catch(error => {
    //     res.status(500).send(error);
    // })
})

// Update user by ID
app.patch('/users/:id', async (req, res) => {
    // Mongoose ignoring updates properties that does not exist. Custom code to error response.
    const allowedUpdates = ['name', 'age', 'email' , 'password'];
    const updates = Object.keys(req.body);

    // Determine is it every single update can be found in allowedUpdates array
    const isValid = updates.every(update => allowedUpdates.includes(update)); // to check that every individual update is found
    if (!isValid) {
        return res.status(400).send({ "error": "Invalid updates" });
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true , runValidators: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user)
    } catch (error) {
        res.status(400).send(error);
    }
})

// Add new task
app.post('/tasks', async (req, res) => {
    const task = new Task(req.body);

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }

    // task.save().then((task) => {
    //     res.status(201).send(task);
    // }).catch(e => {
    //     res.status(400).send(e);
    // })
})

// Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
    // Task.find({}).then(tasks => {
    //     res.status(200).send(tasks);
    // }).catch(error => {
    //     res.status(500).send(error);
    // })
})

// Get task by ID
app.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findById(_id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
    // Task.findById(_id).then(task => {
    //     if(!task) {
    //         return res.status(404).send('Task not found');
    //     }
    //     res.status(200).send(task);
    // }).catch(error => {
    //     res.status(500).send(error);
    // })
})

app.listen(port, () => {
    console.log('Server is up')
})