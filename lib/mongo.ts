import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "rls_guard_dog";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getMongo(): Promise<Db> {
  if (cachedDb) return cachedDb;

  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (!cachedClient) {
    try {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error(" MongoDB connection failed:", err);
      throw err;
    }
  }

  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}
