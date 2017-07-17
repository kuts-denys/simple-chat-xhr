const messages = require('./messagesList');

function findAllMessages() {
  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

function createNewMessage(name, nickname, date, message) {
  messages.push({
    authorName: name,
    authorNickname: nickname,
    createdAt: date,
    body: message,
  });
}

function getMessagesLength() {
  return messages.length;
}

module.exports = {
  findAllMessages,
  createNewMessage,
  getMessagesLength,
};
