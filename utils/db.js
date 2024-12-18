import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
  constructor() {
    // MongoDB connection details
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // MongoDB connection URI
    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.connected = false;

    // Connect to MongoDB
    this.dbName = database;
    this.client.connect()
      .then(() => {
        console.log('MongoDB client connected successfully');
        this.connected = true;
      })
      .catch((err) => {
        console.error(`Failed to connect to MongoDB: ${err.message}`);
      });
  }

  /**
   * Check if the connection to MongoDB is alive
   * @returns {boolean} True if connected, false otherwise
   */
  isAlive() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  /**
   * Returns the number of users in the collection 'users'
   * @returns {Promise<number>}
   */
  async nbUsers() {
    const db = this.client.db(this.dbName);
    const usersCollection = db.collection('users');
    const count = await usersCollection.countDocuments();
    return count;
  }

  /**
   * Returns the number of files in the collection 'files'
   * @returns {Promise<number>}
   */
  async nbFiles() {
    const db = this.client.db(this.dbName);
    const filesCollection = db.collection('files');
    const count = await filesCollection.countDocuments();
    return count;
  }
}

// Export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
