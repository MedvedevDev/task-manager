const express = require('express')
const User = require("../models/user");
const router = express.Router()
const authMiddleware = require('../middleware/auth')

// Log in
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.getAuthToken();
        // res.send({ user: user.getUserPublicData(), token: token});
        res.send({ user , token: token}); //replaced getUserPublicData() with toJSON()
    } catch (error) {
        res.status(400).send(error);
    }
})

// Log out
router.post('/users/logout', authMiddleware,async (req, res) => {
    try {
        // since we are authenticated we already have access to user data
        //token -> object with "token" property and "_id" property
        // return true when the token we are currently looking at the one if used for auth
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token;
        })
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

// Log Out all sessions
router.post('/users/logoutAll', authMiddleware, async (req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
})


// Get all users
router.get('/users/me', authMiddleware, async (req, res) => {
    res.send(req.user);

    // User.find({}).then(users => {
    //     res.status(200).send(users);
    // }).catch(error => {
    //     res.status(500).send(error);
    // })
})

// Add new user
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.getAuthToken();
        res.status(201).send({ user: user, token: token });
    } catch (error) {
        res.status(400).send(error);
    }

    // user.save().then((user) => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})


// Get user by ID
router.get('/users/:id', async (req, res) => {
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
router.patch('/users/:id', async (req, res) => {
    // Mongoose ignoring updates properties that does not exist. Custom code to error response.
    const allowedUpdates = ['name', 'age', 'email' , 'password'];
    const updates = Object.keys(req.body);

    // Determine is it every single update can be found in allowedUpdates array
    const isValid = updates.every(update => allowedUpdates.includes(update)); // to check that every individual update is found
    if (!isValid) {
        return res.status(400).send({ "error": "Invalid updates" });
    }

    try {
        //findByIdAndUpdate - bypass mongoose and mongoose middleware
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true , runValidators: true });

        // To use middleware we refactor 'findByIdAndUpdate' function
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        updates.forEach(update => {
            // dynamically set property on User using bracket notation []
            user[update] = req.body[update];
        })
        await user.save(); // where middleware is actually executed
        res.send(user)

    } catch (error) {
        res.status(400).send(error);
    }
})

// Delete user by ID
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send('User deleted');
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router

