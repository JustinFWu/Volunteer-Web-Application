const express = require('express');
const path = require('path');
const { connection } = require('../db');
const { isAuth, isLeader, isAdmin } = require('../authMiddleware');

const router = express.Router();

const fs = require('fs');

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/upload/:organisation_id', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const imagePath = req.file.filename;
  const organisationId = req.params.organisation_id;

  const selectSql = 'SELECT image_path FROM organisations WHERE id = ?';

  connection.query(selectSql, [organisationId], (selectErr, selectResult) => {
    if (selectErr) {
      return res.status(500).send('Internal server error');
    }

    if (selectResult.length === 0) {
      return res.status(404).send('Organisation not found');
    }

    const previousImagePath = selectResult[0].image_path;

    if (previousImagePath) {
      fs.unlink(path.join('public/images/uploads', previousImagePath), (unlinkErr) => {


        updateImagePath(imagePath, organisationId, res);
      });
    } else {
      updateImagePath(imagePath, organisationId, res);
    }
  });

  function updateImagePath(imagePath, organisationId, res) {
    const sql = 'UPDATE organisations SET image_path = ? WHERE id = ?';

    connection.query(sql, [imagePath, organisationId], (err, result) => {
      if (err) {
        return res.status(500).send('Internal server error');
      }

      res.send('Image uploaded successfully');
    });
  }


});


module.exports = router;