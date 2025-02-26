// routes/index.js
const express = require('express');
const path = require('path');
const { connection } = require('../db');
const { isAuth, isLeader, isAdmin } = require('../authMiddleware');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res) => {
  const filePath = path.join(__dirname, '../public/login.html');
  res.sendFile(filePath);
});

router.get('/dashboard', isAuth, (req, res) => {
  const filePath = path.join(__dirname, '../public/dashboard.html');
  res.sendFile(filePath);
});

router.get('/organisation', (req, res) => {
  const filePath = path.join(__dirname, '../public/organisation.html');
  res.sendFile(filePath);
});

router.get('/organisation/homepage/:id', (req, res) => {
  const filePath = path.join(__dirname, '../public/org_homepage.html');
  res.sendFile(filePath);
});

module.exports = router;