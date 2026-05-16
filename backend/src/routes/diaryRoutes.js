const express = require('express');
const multer = require('multer');
const diaryController = require('../controllers/diaryController');

const upload = multer({ dest: 'uploads/' });
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

// All diary routes are protected
router.use(authenticateJWT);

router.post('/', diaryController.createEntry);
router.post('/transcribe', upload.single('file'), diaryController.transcribeAudio);
router.get('/', diaryController.getEntries);
router.get('/search', diaryController.searchEntries);
router.get('/:id', diaryController.getEntryById);
router.patch('/:id', diaryController.updateEntry);
router.delete('/:id', diaryController.deleteEntry);

module.exports = router;
