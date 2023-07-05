const express = require('express')
const Task = require("../models/task");
const router = express.Router()
const authMiddleware = require('../middleware/auth')

// Add new task
router.post('/tasks', authMiddleware, async (req, res) => {
    const task = new Task({
        ...req.body, // copy all the properties form the body to the object
        createdBy: req.user._id
    })

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
router.get('/tasks', async (req, res) => {
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
router.get('/tasks/:id', async (req, res) => {
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

// Update task by ID
router.patch('/tasks/:id', async (req, res) => {
    // Mongoose ignoring updates properties that does not exist. Custom code to error response.
    const allowedUpdates = ['description', 'completed'];
    const updates = Object.keys(req.body);

    const isValid = updates.every(update => allowedUpdates.includes(update));
    if (!isValid) {
        return res.status(400).send({ "error": "Invalid updates" });
    }

    try {
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true , runValidators: true });
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).send('Task not found')
        }

        updates.forEach(update => {
            // dynamically set property on User using bracket notation []
            task[update] = req.body[update];
        })
        await task.save();
        res.send(task);

    } catch (error) {
        res.status(400).send(error);
    }
})

// Delete task by ID
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.send('Task deleted');
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router