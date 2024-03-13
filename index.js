const express = require('express');
const cors = require('cors');
const mongodb = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const app = express();

app.use(cors());
app.use(express.json());

async function connect(uri, dbname) {
    const client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    });
    return client.db(dbname);
}

let db;

function generateAccessToken(id, email) {
    return jwt.sign({
        'user_id': id,
        'email': email
    }, process.env.TOKEN_SECRET, {
        'expiresIn': '3d'
    });
}

function authenticateWithJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.TOKEN_SECRET, function (err, payload) {
            if (err) {
                res.status(400);
                return res.json({
                    'error': err
                });
            } else {
                req.payload = payload;
                next();
            }
        });
    } else {
        res.status(400);
        res.json({
            'error': 'Login required to access this route'
        });
    }
}

async function main() {
    const uri = process.env.MONGO_URI;
    db = await connect(uri, "book-collections");

    app.get("/book-collections", async function (req, res) {
        try {
            const criteria = {};

            if (req.query.description) {
                criteria.description = {
                    '$regex': req.query.description,
                    '$options': 'i'
                };
            }

            if (req.query.book) {
                criteria.book = {
                    '$in': [req.query.book]
                };
            }

            const results = await db.collection("collections").find(criteria).toArray();

            res.json({
                'collections': results
            });
        } catch (e) {
            res.status(500);
            res.json({
                'error': e.message
            });
        }
    });

    app.post("/book-collections", async function (req, res) {
        try {
            const { booktitle, description, publishdatetime } = req.body;

            if (!booktitle) {
                res.status(400);
                return res.json({
                    'error': 'A booktitle must be provided'
                });
            }

            if (!description || typeof description !== 'string') {
                res.status(400);
                return res.json({
                    'error': 'Description must be provided and must be a string'
                });
            }

            const result = await db.collection("collections").insertOne({
                'booktitle': booktitle,
                'description': description,
                'publishdatetime': publishdatetime ? new Date(publishdatetime) : new Date()
            });

            res.json({
                'result': result
            });
        } catch (e) {
            res.status(500);
            res.json({
                'error': e.message
            });
        }
    });

    app.put('/book-collections/:id', async function (req, res) {
        try {
            const { booktitle, description, publishdatetime } = req.body;

            if (!booktitle || !description || typeof description !== 'string') {
                res.status(400);
                return res.json({
                    'error': 'Invalid data provided'
                });
            }

            const result = await db.collection("collections").updateOne({
                '_id': new ObjectId(req.params.id)
            }, {
                '$set': {
                    'booktitle': booktitle,
                    'description': description,
                    'publishdatetime': publishdatetime ? new Date(publishdatetime) : new Date(),
                }
            });

            res.json({
                'result': result
            });
        } catch (e) {
            res.status(500);
            res.json({
                'error': e.message
            });
        }
    });

    app.delete('/book-collections/:id', async function (req, res) {
        try {
            await db.collection('collections').deleteOne({
                '_id': new ObjectId(req.params.id)
            });

            res.json({
                'message': "Deleted"
            });
        } catch (e) {
            res.status(500);
            res.json({
                'error': e.message
            });
        }
    });

    app.post('/user', async function (req, res) {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 12);
            const result = await db.collection('users').insertOne({
                'email': req.body.email,
                'password': hashedPassword
            });
            res.json({
                'result': result
            });
        } catch (e) {
            res.status(500);
            res.json({
                'error': e.message
            });
        }
    });

    app.post('/login', async function (req, res) {
        try {
            const user = await db.collection('users').findOne({
                email: req.body.email
            });

            if (user && await bcrypt.compare(req.body.password, user.password)) {
                const token = generateAccessToken(user._id, user.email);
                res.json({
                    'token': token
                });
            } else {
                res.status(400);
                res.json({
                    'error': 'Invalid login credentials'
                });
            }
        } catch (e) {
            res.status(500);
            res.json({
                'error': e.message
            });
        }
    });

    app.get('/profile', authenticateWithJWT, async function (req, res) {
        res.json({
            'message': 'Success in accessing protected route',
            'payload': req.payload
        });
    });

    app.get('/payment', authenticateWithJWT, async function (req, res) {
        res.json({
            'message': "Accessing protected payment route"
        });
    });

    app.listen(3000, function () {
        console.log("Server has started");
    });
}

main();
