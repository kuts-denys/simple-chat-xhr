const userRouter = require('./user');
const messagesRouter = require('./messages');

module.exports = (app) => {
  app.use('/', userRouter);
  app.use('/', messagesRouter);
};
