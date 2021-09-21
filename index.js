require('dotenv').config();
const express = require ('express');
const server = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const { 
    client 
} = require('./db');

server.use(morgan('dev'));
server.use(bodyParser.json());

client.connect();

server.get('/', async (req, res, next) =>{
    res.send('hello')
});

server.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<____Body Logger END____>");

    next();
});

const apiRouter = require('./api');
server.use('/api', apiRouter);

const { PORT = 3000 } = process.env;
server.listen(PORT, function () {
    console.log(`http://localhost:${PORT}`)
});