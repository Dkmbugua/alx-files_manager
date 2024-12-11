const { createClient } = require('redis');

class RedisClient {
  constructor() {
    // Create Redis client instance
    this.client = createClient();

    // Handle connection errors
    this.client.on('error', (err) => {
      console.error(`Redis client error: ${err.message}`);
    });

    // Log successful connection
    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    });

    // Connect to Redis
    this.client.connect().catch((err) => {
      console.error(`Failed to connect to Redis: ${err.message}`);
    });
  }

  /**
   * Check if Redis is alive
   * @returns {boolean} - True if Redis is connected, otherwise false
   */
  isAlive() {
    return this.client.isOpen;
  }

  /**
   * Get a value from Redis
   * @param {string} key - The key to fetch
   * @returns {Promise<string|null>} - The value, or null if the key does not exist
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
   * Set a value in Redis with expiration
   * @param {string} key - The key to set
   * @param {string} value - The value to assign
   * @param {number} duration - Time to live (in seconds)
   */
  async set(key, value, duration) {
    try {
      await this.client.setEx(key, duration, value);
    } catch (error) {
      console.error(`Error setting value in Redis: ${error.message}`);
    }
  }

  /**
   * Delete a key from Redis
   * @param {string} key - The key to delete
   */
  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key from Redis: ${error.message}`);
    }
  }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();
module.exports = redisClient;
