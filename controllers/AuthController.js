const redisClient = require('../utils/redis');
const dbClient = require('../utils/mongo');
const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  /**
   * GET /connect
   * Sign-in the user and generate an authentication token.
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    const hashedPassword = sha1(password);
    const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 86400); // Store user ID in Redis for 24 hours

    return res.status(200).json({ token });
  }

  /**
   * GET /disconnect
   * Sign-out the user by deleting their token from Redis.
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(key); // Delete token from Redis
    return res.status(204).send(); // No content
  }
}

module.exports = AuthController;
