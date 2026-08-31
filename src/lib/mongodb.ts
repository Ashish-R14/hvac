import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

// Cached on globalThis (not a plain module-level variable) so the
// connection survives Next's dev-mode hot-reload re-evaluating this
// module. A failed connection attempt clears the cache immediately, so
// the next call retries instead of re-throwing the same failure forever.
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not set"));
  }
  return new MongoClient(uri).connect().catch((err) => {
    globalThis._mongoClientPromise = undefined;
    throw err;
  });
}

export function getMongoClient(): Promise<MongoClient> {
  globalThis._mongoClientPromise ??= connect();
  return globalThis._mongoClientPromise;
}
