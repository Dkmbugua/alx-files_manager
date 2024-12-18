const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.error(`Redis client error: ${err.message}`);
    });

    this.client.on('ready', () => {
      console.log('Redis client connected to the server');
    });

    this.client.connect().catch((err) => {
      console.error(`Failed to connect to Redis: ${err.message}`);
    });
  }

  isAlive() {
    return this.client.isReady;
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Error getting value from Redis: ${error.message}`);
      return null;
    }
  }

  async set(key, value, duration = 0) {
    try {
      if (duration > 0) {
        await this.client.setEx(key, duration, String(value));
      } else {
        await this.client.set(key, String(value));
      }
    } catch (error) {
      console.error(`Error setting value in Redis: ${error.message}`);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key from Redis: ${error.message}`);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
