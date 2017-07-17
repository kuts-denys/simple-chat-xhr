const router = require('express').Router();
const messagesSelectors = require('../services/messagesSelectors');

const events = require('events');

const dispatcher = new events.EventEmitter();

router.get('/messagesChanges', (req, res) => {
  dispatcher.once('newMessage', message => {
    const mes = {
      authorName: message.name,
      authorNickname: message.nickname,
      createdAt: message.createdAt,
      body: message.body,
    };
    res.status(200).json({ type: 'messages', messages: mes });
  });
});

router.post('/messages', (req, res) => {
  const { name, nickname, body, createdAt } = req.body;
  messagesSelectors.createNewMessage(name, nickname, createdAt, body);
  res.status(201).end();
  dispatcher.emit('newMessage', req.body);
});

router.get('/messages', (req, res) => {
  const messages = messagesSelectors.findAllMessages();
  res.status(200).send({ messages });
});

module.exports = router;