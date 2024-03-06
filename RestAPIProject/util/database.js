const mongoose = require('mongoose');

const url = process.env.MONGODB_URL;

async function connect() {
    try {
        return await mongoose.connect(url);
    } catch (err) {
        console.dir(err);
    }
}

module.exports = { connect, url };
