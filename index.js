const express = require('express');
const cors = require ('cors');
const mongodb = require ('mongodb');
require('dotenv').config();

// A Mongo client allows Express (or any
// NodeJS application) to send request
// to a Mongo database

const MongoClient =mongodb.MongoClient;

// create the express application
const app = express();

// enable cors
app.use(cors());

// set JSON as the means of
// receiving requests and sending responses
app.use(express.json());

// function to connect to the database
async function connect(uri , dbname) {

     // `connect` allows us to connect to the mongodb
    // useUnifiedTopology means we want use the latest
    // structure for Mongo
    const client = await MongoClient.connect(uri,{
        useUnifiedTopology: true
    });
    let db = client.db(dbname);
    return db;
}

async function main() {
    // connection string is now from the .env file
    // get the database using the `connect` function
    const uri = process.env.MONGO_URI;

    const db = await connect(uri, "book-collections");
    // create the routes after connecting to the database
    app.get("/book-collections", async function (req, res) {
        try {
            // get all the collections
            const results = await db.collection("collections").find({}).toArray();

            res.json({
                'collections': results
            })
        } catch (e) {
            res.status(500);
            res.json({
                'error': e
            })
        }

    });

    // Sample book collections with two authors document"
    // {
    //   _{
       // In the mock up
       // - One folder represents one database
        // - One `json` file represents one collection
        // - Each object in a `json` file represents one document
 //}
}
 
    app.post("/book-collections", async function (req, res) {
        // try...catch is for exception handling
        // an execption is an unexpected error usually from a third party
        // (in this case, the third party is Mongo Atlas)
        try {
            const description = req.body.description;
            const book = req.body.book;
            const datetime = new Date(req.body.datetime) || new Date();
            const result = await db.collection("collections").insertOne({
                'description': description,
                'book': book,
                'datetime': datetime
            });
            res.json({
                'result': result
            })
        } catch (e) {
            // e will contain the error message
            res.status(500); // internal server error
            res.json({
                'error': e
            })
        }

    })


main();

app.listen(3000, function () {
    console.log("Server has started");
});