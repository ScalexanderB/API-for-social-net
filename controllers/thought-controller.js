const { User, Thought } = require('../models');

const thoughtController = {
    // Get all thoughts
    getAllThoughts(req, res) {
        Thought.find({})
        .select('-__v')
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
    },

    // Get one thought
    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.id })
        .populate({ path: 'reactions', select: '-__v' })
        .select('-__v')
        .then((dbThoughtData) => {
            if (!dbThoughtData) {
                return res.json({message: 'No thought found with this ID.'})
            }
            return res.json(dbThoughtData);
        })
        .catch((err) => {
            return res.json(err)
        })
    },

    // Post new thought
    createThought({ body }, res) {
        Thought.create(body)
        .then(dbThoughtData => {
            User.findOneAndUpdate(
                {_id: body.userId},
                {$push: { thoughts: dbThoughtData._id }},
                {new: true}
            )
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(400).json({ message: 'No user found with this ID.' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.json(err));
        })
    },

    // Update a thought
    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate(
            {_id: params.id},
            body,
            {new: true, runValidators: true}
        )
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(400).json({ message: 'No thought found with this ID.'});
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => res.json(err));
    },

    // Delete a thought
    deleteThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.id })
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                return res.status(400).json({ message: 'No thought found with this ID.' });
            }
            return User.findOneAndUpdate(
                {_id: params.username},
                {$pull: {thoughts: params.id}},
                {new: true}
            )
            .then(() => {
                res.json({message: 'Thought has been deleted.'});
            })
            .catch(err => res.status(400).json(err));
        })
        .then(dbUserData => res.json(dbUserData))
        .catch(err => res.json(err));
    },

    // Post a reaction
    createReaction({ params, body }, res) {
        Thought.findOneAndUpdate(
            {_id: params.id},
            {$push: {reactions: body}},
            {new: true, runValidators: true}
        )
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(400).json({ message: 'No user found with this ID.'});
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => res.json(err));
    },

    // Delete a reaction
    deleteReaction({ params }, res) {
        Thought.findOneAndUpdate(
            {_id: params.thoughtId},
            {$pull: {reactions: {reactionId: params.reactionId}}},
            {new: true, runValidators: true}
        )
        .then((dbUserData) => {
            if (!dbUserData) {
                res.status(400).json({ message: 'No user found with this ID.'});
                return;
            }
            res.json({message: 'Reaction has been deleted.'});
        })
        .catch(err => res.json(err));
    }
};

module.exports = thoughtController;