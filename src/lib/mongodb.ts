import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

const mongoClient = new MongoClient(uri);

export const mongoClientPromise =
  globalForMongo.mongoClientPromise ?? mongoClient.connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClientPromise = mongoClientPromise;
}

export async function getMongoDb() {
  const client = await mongoClientPromise;
  const dbName = process.env.MONGODB_DB_NAME || "splitscene";
  return client.db(dbName);
}
