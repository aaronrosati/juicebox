const express = require('express');
const router = express.Router();

const { JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');

const { getAllUsers, getUserByUsername, createUser } = require('../db');

router.use((req, res, next) => {
    console.log('A request is being made to /users');
    
    next();
});

router.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    });
});

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        next ({
            name: 'MissingCredentialsError',
            message: 'Please supply both a username and password'
        });
    }

    try {
        const user = await getUserByUsername(username);

        if (user && user.password === password) {
            const token = jwt.sign(user, JWT_SECRET)
            res.send({ message: `You're logged in!`, token: `${token}` });
        } else {
            next({
                name: 'IncorrectCredentialError',
                message: 'Username or password is incorrect'
            });
        }
    } catch(error) {
        console.error(error);
        next.error;
    }
});

router.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        };

        const user = await createUser({
            username,
            password,
            name,
            location
        });

        const token = jwt.sign({
            id: user.id,
            username
        }, JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            message: 'Thank you for signing up',
            token
        });

    } catch({ name, message}) {
        next({ name, message })
    }
});

module.exports = router;