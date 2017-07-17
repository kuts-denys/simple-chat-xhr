const router = require('express').Router();
const userSelectors = require('../services/usersSelectors');

const events = require('events');

const dispatcher = new events.EventEmitter();

router.get('/userChanges', (req, res) => {
  res.set('Cache-Control', 'no-cache, must-revalidate');
  dispatcher.once('newUser', user => {
    res.status(200).json({ type: 'users', users: user });
  });
});

router.post('/users', (req, res) => {
  const { name, nickname } = req.body;
  const id = userSelectors.createUser({ name, nickname });
  if (!id) {
    res.status(400).send('user already exists');
  } else {
    res.status(201).end();
  }
  const user = userSelectors.findUserById(id);
  dispatcher.emit('newUser', user);
});

router.get('/users', (req, res) => {
  const users = userSelectors.findAllUsers();
  res.status(200).json({ users });
});

module.exports = router;