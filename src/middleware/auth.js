const jwt = require('jsonwebtoken')
const User = require('../models/user')
const secret = 'usersecret';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace("Bearer ", ""); // replace to remove "Bearer " portion
        const decoded = jwt.verify(token, secret);

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }); // find user with the correct ID who has auth token

        if (!user) {
            throw new Error()
        }

        req.token = token; // to access specific token (one user can have multiple tokens) in route handler (in delete route)
        req.user = user;
        next()
    } catch (e) {
        res.status(401).send({ error: "Please authenticate." })
    }
}

module.exports = authMiddleware