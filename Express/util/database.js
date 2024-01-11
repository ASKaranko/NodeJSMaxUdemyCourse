const mongoose = require('mongoose');

const url =
    'mongodb+srv://akaranko:8LwpEIdvMJarQsLM@cluster0.zrmnklw.mongodb.net/shop?retryWrites=true&w=majority';

async function connect() {
    try {
        return await mongoose.connect(url);
    } catch (err) {
        console.dir(err);
    }
}

module.exports = { connect };
