// ================================
// File: lib/mongodb.js
// Description: Centralized utility for connecting to MongoDB.
//              Ensures a single client instance across requests in development.
// ================================
import { MongoClient } from 'mongodb';

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;
const options = {}; // You can add options like useNewUrlParser, useUnifiedTopology here

let client;
let clientPromise;

// Basic validation for the URI
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the client
  // is not recreated on every hot reload. This prevents multiple connections
  // which can lead to connection leaks.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  // The connection is still efficient because Next.js lambda functions
  // persist between invocations.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient object. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;