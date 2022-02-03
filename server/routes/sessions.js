const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const UserCredential = require('../models/user-credential');

// login user
router.post('/', (req, res) => {
  if (!req.body) {
    res.status(400).send({ error: 'Email and Password not present in request' });
    return;
  }

  const { userName, email, password } = req.body;

  if (!email) {
    res.status(400).send({ error: 'Email not present in request' });
    return;
  }

  if (!password) {
    res.status(400).send({ error: 'Password not present in request' });
    return;
  }

  if (!userName) {
    res.status(400).send({ error: 'userName not present in request' });
    return;
  }

  UserCredential.findOne({ email })
    .then((user) => {
      if (!user) {
        res.status(400).send({ error: 'User not signed up' });
        return;
      }

      const match = bcrypt.compareSync(password, user.password);

      if (!match) {
        res.status(400).send({ error: 'Incorrect email or password' });
        return;
      }

      req.session.userId = user.id;
      res.status(204).send({ message: 'User logged in' });
    })
    .catch(() => {
      res.status(500).send({ error: 'Internal Server Error' });
    });
});

// logout user
router.delete('/me', (req, res) => {
  delete req.session.userId;
  res.status(204).send();
});

module.exports = router;
