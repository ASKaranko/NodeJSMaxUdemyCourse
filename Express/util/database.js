const { MongoClient, ServerApiVersion } = require('mongodb');

const url =
    'mongodb+srv://akaranko:8LwpEIdvMJarQsLM@cluster0.zrmnklw.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

async function connect() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        return await client.connect();
        // Send a ping to confirm a successful connection
        //await client.db('admin').command({ ping: 1 });
        // console.log(
        //     'Pinged your deployment. You successfully connected to MongoDB!'
        // );
    } catch (err) {
        console.dir(err);
    }
}

module.exports = connect;
