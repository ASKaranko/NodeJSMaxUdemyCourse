const { Schema, model } = require('mongoose');

const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        creator: {
            type: Object,
            required: true
        }
    },
    {
        timestamps: true // it will add createdAt, updatedAt fields by default
    }
);

module.exports = model('Post', postSchema);
