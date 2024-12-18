const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = createClient();
    this.connected = false;

    this.client.on('error', (err) => {
      console.error(`Redis client error: ${err.message}`);
      this.connected = false;
    });

    this.client.on('ready', () => {
      console.log('Redis client connected to the server');
      this.connected = true;
    });
  }

  // Connect method to ensure connection is complete
  async connect() {
    if (!this.client.isOpen) {
      try {
        await this.client.connect();
        console.log('Redis client successfully connected');
      } catch (err) {
        console.error(`Failed to connect to Redis: ${err.message}`);
      }
    }
  }

  isAlive() {
    return this.client.isOpen && this.connected;
  }

  async get(key) {
    await this.connect(); // Ensure connection
    try {
      const value = await this.client.get(key);
      if (value === null) {
        console.log(`Key "${key}" not found in Redis`);
      }
      return value;
    } catch (error) {
      console.error(`Error getting key "${key}": ${error.message}`);
      return null;
    }
  }

  async set(key, value, duration = 0) {
    await this.connect(); // Ensure connection
    try {
      if (duration > 0) {
        await this.client.setEx(key, duration, String(value));
      } else {
        await this.client.set(key, String(value));
      }
      console.log(`Key "${key}" set successfully`);
    } catch (error) {
      console.error(`Error setting key "${key}": ${error.message}`);
    }
  }

  async del(key) {
    await this.connect(); // Ensure connection
    try {
      await this.client.del(key);
      console.log(`Key "${key}" deleted successfully`);
    } catch (error) {
      console.error(`Error deleting key "${key}": ${error.message}`);
    }
  }

  async disconnect() {
    try {
      await this.client.quit();
      console.log('Redis client disconnected');
    } catch (error) {
      console.error(`Error during Redis disconnection: ${error.message}`);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
