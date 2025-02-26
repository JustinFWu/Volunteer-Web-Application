const express = require('express');
const path = require('path');
const { connection } = require('../db');
const { isAuth, isLeader, isAdmin } = require('../authMiddleware');
const bcrypt = require('bcryptjs');


const router = express.Router();

router.put('/promote/:user_id', isAdmin, (req, res) => {
  const insertQuery = `INSERT INTO admins (user_id) VALUES (?)`;
  const userId = req.params.user_id;

  console.log(userId);

  connection.query(insertQuery, [userId], (err, result) => {
    if (err) {
      return res.status(500).send({ err: err });
    }

    res.status(200).send(result);
  });
});

router.get('/sign_out', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw err;
    }
    res.redirect("/");
  });
});

router.post('/sign_up/', (req, res, next) => {
  const { username, password, display_name, first_name, last_name, email } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return next(err);
    connection.query('INSERT INTO users (username, password, display_name, first_name, last_name, email, account_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, display_name, first_name, last_name, email, 'local'],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username or email already exists.' });
          }
          return next(err);
        }

        connection.query('SELECT * FROM users WHERE id = ?', [result.insertId], (err, users) => {
          if (err) return next(err);
          const user = users[0];
          req.login(user, (err) => {
            if (err) return next(err);
            return res.json({ success: true, redirect: '/dashboard' });
          });
        });
      });
  });
});

router.get('/get_all', isAdmin, (req, res) => {
  const query = `SELECT
                    users.id,users.display_name,users.first_name,users.last_name,users.username,users.email,users.account_type,
                    MAX(CASE
                        WHEN admins.user_id IS NOT NULL THEN 1
                        ELSE 0
                    END) AS isAdmin,
                    MAX(CASE
                        WHEN organisations.user_id IS NOT NULL THEN 1
                        ELSE 0
                    END) AS isLeader
                FROM
                    users
                LEFT JOIN
                    admins
                ON
                    users.id = admins.user_id
                LEFT JOIN
                    organisations
                ON
                    users.id = organisations.user_id
                GROUP BY
                    users.id;`;
  connection.query(query, (err, result) => {
    if (err) {
      return res.status(500).send({ err: err });
    }
    res.json(result);
  });
});

router.get('/remove_user/:user_id', isAdmin, (req, res) => {
  const userId = req.params.user_id;
  const organisationLeaderQuery = 'SELECT * FROM organisations WHERE user_id = ?';

  connection.query(organisationLeaderQuery, [userId], (err, organisationLeaderResult) => {
    if (err) {
      console.log("hi");
      return res.status(500).send({ err: err });
    }

    if (organisationLeaderResult.length !== 0) {
      return res.status(403).send({ error: 'Cannot remove organization leaders.' });
    }

    const adminQuery = 'SELECT * FROM admins WHERE user_id = ?';
    connection.query(adminQuery, [userId], (err, adminResult) => {
      if (err) {
        console.log("hi2");

        return res.status(500).send({ err: err });
      }

      if (adminResult.length !== 0) {
        return res.status(403).send({ error: 'Cannot remove admins.' });
      }

      const deleteQuery = 'DELETE FROM users WHERE id = ?';
      connection.query(deleteQuery, [userId], (err, result) => {
        if (err) {
          return res.status(500).send({ err: err });
        }
        res.status(200).send({ message: 'User deleted successfully.' });
      });
    });
  });
});

router.get('/get_info/:user_id', isAuth, (req, res) => {
  const userId = parseInt(req.params.user_id);

  if (!(userId == req.session.passport.user.id || req.session.passport.user.isAdmin)) {
    return res.status(403).send({ error: 'Unauthorized access.' });
  }

  const query = 'SELECT * FROM users WHERE id = ?';
  connection.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).send({ err: err });
    }
    res.status(200).send(result);
  });
});

router.put('/edit_info/:user_id', isAuth, (req, res) => {
  const userId = parseInt(req.params.user_id);
  const { display_name, first_name, last_name } = req.body;

  if (userId !== req.session.passport.user.id && req.session.passport.user.isAdmin != 1) {
    return res.status(403).send({ error: 'Unauthorized access.' });
  }

  const query = 'UPDATE users SET display_name = ?, first_name = ?, last_name = ? WHERE id = ?';
  const values = [display_name, first_name, last_name, userId];

  connection.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send({ err: err });
    }
    res.status(200).send({ message: 'User information updated successfully.' });
  });
});

module.exports = router;
