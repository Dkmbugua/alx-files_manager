const redisClient = require('../utils/redis');
const dbClient = require('../utils/mongo');

class UsersController {
  /**
   * POST /users
   * Create a new user.
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = { email, password: hashedPassword };

    const result = await dbClient.db.collection('users').insertOne(newUser);

    return res.status(201).json({
      id: result.insertedId,
      email: newUser.email,
    });
  }

  /**
   * GET /users/me
   * Retrieve the authenticated user based on the token.
   */
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.db.collection('users').findOne({ _id: dbClient.objectId(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({
      id: user._id,
      email: user.email,
    });
  }
}

module.exports = UsersController;
