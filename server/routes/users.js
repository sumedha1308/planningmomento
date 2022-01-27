/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middlewares/auth');
const UserCredential = require('../models/user-credential');
const User = require('../models/user');

// signup user
router.post('/', (req, res) => {
  if (!req.body) {
    res.status(400).send({ error: 'Email and Password not present in request' });
    return;
  }

  const { email, password } = req.body;

  if (!email) {
    res.status(400).send({ error: 'Email not present in request' });
    return;
  }

  if (!password) {
    res.status(400).send({ error: 'Password not present in request' });
    return;
  }

  UserCredential.findOne({ email })
    .then((user) => {
      if (user) {
        res.status(400).send({ error: 'User already signed up' });
        return;
      }
      let hash;
      try {
        hash = bcrypt.hashSync(password);
      } catch (err) {
        // eslint-disable-next-line consistent-return
        return res.status(500).send({ error: 'Some unknown error occured' });
      }

      const userCredential = new UserCredential({ email, password: hash });

      userCredential.save().then(() => {
        const user = new User({ _id: userCredential.id, email });
        user.save().then(() => {
          res.status(201).send({ id: userCredential.id });
        });
      });
    })
    .catch(() => {
      res.status(500).send({ error: 'Internal Server Error' });
    });
});

// login status
router.get('/me', auth.authenticate, (req, res) => {
  User.findOne({ _id: req.session.userId })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch(() => {
      res.status(500).send({ error: 'Internal Server Error' });
    });
});

// get user with userId
router.get('/:userId', (req, res) => {
  User.findOne({ _id: req.params.userId })
    .then((user) => {
      res.status(200).send({ userName: user.firstName });
    })
    .catch(() => {
      res.status(500).send({ error: 'Internal Server Error' });
    });
});

// update firstName and LastName
router.put('/me', auth.authenticate, (req, res) => {
  if (!req.session.userId) {
    res.send(401).send({ error: 'Not logged in' });
  }

  const { firstName, lastName } = req.body;

  const updateQuery = {};
  firstName !== undefined && (updateQuery.firstName = firstName);
  lastName !== undefined && (updateQuery.lastName = lastName);

  User.updateOne({ _id: req.session.userId }, updateQuery)
    .then(() => {
      res.status(204).send();
    })
    .catch(() => {
      res.status(500).send({ error: 'Internal Server Error' });
    });
});

module.exports = router;
