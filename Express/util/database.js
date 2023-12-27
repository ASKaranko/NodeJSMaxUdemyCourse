const { MongoClient, ServerApiVersion } = require('mongodb');

const url =
    'mongodb+srv://akaranko:8LwpEIdvMJarQsLM@cluster0.zrmnklw.mongodb.net/shop?retryWrites=true&w=majority';

let _db;

const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

async function connect() {
    try {
        await client.connect();
        _db = await client.db();
        return _db;
    } catch (err) {
        console.dir(err);
    }
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database connection found!';
};

module.exports = { connect, getDb };
