
import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI!
const dbName = process.env.MONGODB_DB || 'rls_guard_dog'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function getMongo(): Promise<Db> {
  if (cachedDb) return cachedDb
  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
  }
  cachedDb = cachedClient.db(dbName)
  return cachedDb
}
