const { User, Thought } = require('../models');
const { populate } = require('../models/User');

const userController = {
    // Get all users
    getAllUsers(req, res) {
        User.find({})
        .select('-__v')
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
    },

    // Get a single user
    getUserById( { params }, res) {
        User.findOne({ _id: params.id })
        .populate( { path: 'thoughts', select: '-__v' } )
        .populate( { path: 'friends', select: '-__v' } )
        .select('-__v')
        .then((dbUserData) => {
            if (!dbUserData) {
                return res.json({ message: 'No user found with this ID.'})
            }
            return res.json(dbUserData);
        })
        .catch((err) => {
            return res.json(err)
        })
    },

    // Create a user
    createUser({ body }, res) {
        User.create(body)
        .then(dbUserData => res.json(dbUserData))
        .catch(err => res.json(err));
    },

    // Update a user
    updateUser({ params, body}, res) {
        User.findOneAndUpdate(
            {_id: params.id},
            body,
            {new: true, runValidators: true}
        )
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(400).json({ message: 'No user found with this ID.'});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.json(err));
    },

    // Delete a user
    deleteUser({ params}, res) {
        User.findOneAndDelete({ _id: params.id })
        .then(dbUserData => res.json(dbUserData))
        .catch(err => res.json(err));
    },

    // Add a friend
    addFriend({ params }, res) {
        User.findByIdAndUpdate(
            {_id: params.id},
            {$push: {friends: params.friendId }},
            {new: true, runValidators: true}
        )
        .select('-__v')
        .then((dbUserData) => {
            if (!dbUserData) {
                res.status(400).json({ message: 'No user found with this ID.'});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.json(err));
    },

    // Delete a friend
    removeFriend({ params }, res) {
        User.findByIdAndUpdate (
            {_id: params.id},
            {$pull: {friends: params.friendId}},
            {new: true, runValidators: true}
        )
        .select('-__v')
        .then((dbUserData) => {
            if (!dbUserData) {
                res.status(400).json({ message: 'No user found with this ID.'});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.json(err));
    }
};

module.exports = userController;