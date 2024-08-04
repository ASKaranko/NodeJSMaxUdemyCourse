import { MongoClient, Database } from 'https://deno.land/x/mongo@v0.33.0/mod.ts';
import 'jsr:@std/dotenv/load';

const client = new MongoClient();
const username = Deno.env.get('MONGO_USER');
const password = Deno.env.get('MONGO_PASSWORD');
const clusterUrl = Deno.env.get('MONGO_CLUSTER_URL');
const dbName = Deno.env.get('MONGO_DATABASE_NAME');

let db: Database;

async function connect() {
    await client.connect(
        `mongodb+srv://${username}:${password}@${clusterUrl}/${dbName}?authMechanism=SCRAM-SHA-1`
    );
    db = client.database(dbName);
}

function getDb() {
    return db;   
}

export { connect, getDb };
