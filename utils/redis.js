const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = createClient();

    this.connected = false; // Track the connection state

    // Handle connection errors
    this.client.on('error', (err) => {
      console.error(`Redis client error: ${err.message}`);
      this.connected = false;
    });

    // Log successful connection
    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    });

    // Fully connected and ready
    this.client.on('ready', () => {
      console.log('Redis client successfully connected');
      this.connected = true;
    });

    // Start the connection
    this.client.connect().catch((err) => {
      console.error(`Failed to connect to Redis: ${err.message}`);
    });
  }

  /**
   * Check if Redis is alive
   * @returns {boolean}
   */
  isAlive() {
    return this.connected; // Use the tracked connection state
  }

  /**
   * Get a value from Redis
   */
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Error getting value from Redis: ${error.message}`);
      return null;
    }
  }

  /**
   * Set a value with optional expiration
   */
  async set(key, value, duration = 0) {
    try {
      if (duration > 0) {
        await this.client.setEx(key, duration, String(value));
      } else {
        await this.client.set(key, String(value));
      }
      console.log(`Key "${key}" set successfully`);
    } catch (error) {
      console.error(`Error setting value in Redis: ${error.message}`);
    }
  }

  /**
   * Delete a key
   */
  async del(key) {
    try {
      await this.client.del(key);
      console.log(`Key "${key}" deleted successfully`);
    } catch (error) {
      console.error(`Error deleting key from Redis: ${error.message}`);
    }
  }
}

module.exports = new RedisClient();
