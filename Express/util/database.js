const mongoose = require('mongoose');

const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}.mongodb.net/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority`;

async function connect() {
    try {
        return await mongoose.connect(url);
    } catch (err) {
        console.dir(err);
    }
}

module.exports = { connect, url };
