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

// GET /tasks?completed=true | Fetch completed/incompleted tasks
// GET /tasks?limit=10&skip=20 | Pagination: limit(amount of documents displayed), skip(number of page)
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', authMiddleware, async (req, res) => {
    try {
        // 1 solution
        // const tasks = await Task.find({ createdBy: req.user._id });
        // res.status(200).send(tasks);
        // 2 solution
        // await req.user.populate('tasks');
        // res.send(req.user.tasks);
        const match = {} // Property for the filter
        const sort = {} // Property for the sorting

        if(req.query.completed) {
            match.completed = req.query.completed === 'true';
        }

        if (req.query.sortBy) {
            // name of the property is provided it dynamically
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1; // 1 asc, -1 desc
        }

        const options = { // Property for the pagination
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        }

        await req.user.populate({
            path: 'tasks',
            match,
            options
        })
        res.send(req.user.tasks)
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
router.get('/tasks/:id', authMiddleware, async (req, res) => {
    const _id = req.params.id;

    try {
        //const task = await Task.findById({ _id, createdBy: req.user._id });
        const task = await Task.findOne({ _id, createdBy: req.user._id }); // find task that matches with authenticated user id
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
router.patch('/tasks/:id', authMiddleware,  async (req, res) => {
    // Mongoose ignoring updates properties that does not exist. Custom code to error response.
    const allowedUpdates = ['description', 'completed'];
    const updates = Object.keys(req.body);

    const isValid = updates.every(update => allowedUpdates.includes(update));
    if (!isValid) {
        return res.status(400).send({ "error": "Invalid updates" });
    }

    try {
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true , runValidators: true });
        //const task = await Task.findById(req.params.id);
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });

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
router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });

        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.send('Task deleted');
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router