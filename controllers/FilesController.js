const redisClient = require('../utils/redis');
const dbClient = require('../utils/mongo');

class FilesController {
  /**
   * GET /files/:id
   * Retrieve a file document by its ID.
   */
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
      const file = await dbClient.db.collection('files').findOne({ _id: dbClient.objectId(id), userId: dbClient.objectId(userId) });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    } catch (err) {
      return res.status(404).json({ error: 'Not found' });
    }
  }

  /**
   * GET /files
   * Retrieve all files for a specific parentId with pagination.
   */
  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page, 10) || 0;

    try {
      const files = await dbClient.db.collection('files')
        .aggregate([
          { $match: { parentId, userId: dbClient.objectId(userId) } },
          { $skip: page * 20 },
          { $limit: 20 },
        ])
        .toArray();

      const formattedFiles = files.map((file) => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      }));

      return res.status(200).json(formattedFiles);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = FilesController;
