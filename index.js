const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const staticPath = path.join(__dirname, '/public');
app.use(express.static(staticPath));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = require('./routes/router')(app);

app.listen(1500);

