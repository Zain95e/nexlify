const { pool } = require('../config/db');
const PointsService = require('../services/pointsService');
const { createError } = require('../middleware/errorHandler');

const diaryController = {
  // 6.1.1 POST /api/diary
  async createEntry(req, res, next) {
    try {
      const { content, mood, tags } = req.body;
      const userId = req.user.id;

      if (!content || content.trim() === '') {
        return next(createError(400, 'Content is required'));
      }
      
      const validMoods = ['happy', 'neutral', 'stressed', 'tired', 'excited'];
      if (!validMoods.includes(mood)) {
        return next(createError(400, 'Invalid mood'));
      }

      const query = `
        INSERT INTO diary_entries (user_id, content, mood, tags, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *;
      `;
      
      const result = await pool.query(query, [userId, content, mood, tags || []]);
      const entry = result.rows[0];

      // Award +5 pts
      const updatedUser = await PointsService.addPoints(userId, 5);

      res.status(201).json({
        status: 'success',
        data: {
          entry,
          userStats: updatedUser
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 6.1.2 GET /api/diary (Paginated)
  async getEntries(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const query = `
        SELECT id, mood, tags, LEFT(content, 200) as preview, created_at
        FROM diary_entries
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3;
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);

      res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  },

  // 6.1.3 GET /api/diary/search?q=keyword
  async searchEntries(req, res, next) {
    try {
      const userId = req.user.id;
      const { q } = req.query;

      if (!q) {
        return res.status(200).json({ status: 'success', results: 0, data: [] });
      }

      const query = `
        SELECT id, mood, tags, LEFT(content, 200) as preview, created_at
        FROM diary_entries
        WHERE user_id = $1 AND content ILIKE '%' || $2 || '%'
        ORDER BY created_at DESC;
      `;
      
      const result = await pool.query(query, [userId, q]);

      res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  },

  // 6.1.4 PATCH /api/diary/:id
  async updateEntry(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { content, mood, tags } = req.body;

      if (!content && !mood && !tags) {
        return next(createError(400, 'No fields provided for update'));
      }

      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (content) {
        updates.push(`content = $${paramIndex++}`);
        values.push(content);
      }
      if (mood) {
        const validMoods = ['happy', 'neutral', 'stressed', 'tired', 'excited'];
        if (!validMoods.includes(mood)) return next(createError(400, 'Invalid mood'));
        updates.push(`mood = $${paramIndex++}`);
        values.push(mood);
      }
      if (tags) {
        updates.push(`tags = $${paramIndex++}`);
        values.push(tags);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id, userId);

      const query = `
        UPDATE diary_entries
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex - 2} AND user_id = $${paramIndex - 1}
        RETURNING *;
      `;
      
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'fail', message: 'Diary entry not found' });
      }

      res.status(200).json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // 6.1.5 DELETE /api/diary/:id
  async deleteEntry(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const query = `
        DELETE FROM diary_entries
        WHERE id = $1 AND user_id = $2
        RETURNING id;
      `;
      
      const result = await pool.query(query, [id, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'fail', message: 'Diary entry not found' });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // 6.2.1 POST /api/diary/transcribe
  async transcribeAudio(req, res, next) {
    try {
      if (!req.file) {
        return next(createError(400, 'Audio file is required'));
      }

      const FormData = require('form-data');
      const axios = require('axios');
      const fs = require('fs');

      const formData = new FormData();
      formData.append('file', fs.createReadStream(req.file.path), {
        filename: req.file.originalname || 'audio.wav',
        contentType: req.file.mimetype || 'audio/wav',
      });

      const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiSecret = process.env.AI_SERVICE_SECRET;

      const response = await axios.post(`${aiUrl}/ai/transcribe`, formData, {
        headers: {
          ...formData.getHeaders(),
          'x-internal-secret': aiSecret,
        },
      });

      fs.unlinkSync(req.file.path);

      res.status(200).json({
        status: 'success',
        data: {
          text: response.data.text
        }
      });
    } catch (error) {
      if (req.file && require('fs').existsSync(req.file.path)) {
        require('fs').unlinkSync(req.file.path);
      }
      console.error('Transcription error:', error.response?.data || error.message);
      next(createError(500, "Couldn't transcribe audio. Please type instead."));
    }
  }
};

module.exports = diaryController;
