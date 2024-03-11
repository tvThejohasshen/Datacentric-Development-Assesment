const express = require('express');
const cors = require('cors');
const mongodb = require('mongodb');
require('dotenv').config();

// A Mongo client allows Express (or any
// NodeJS application) to send request
// to a Mongo database
const MongoClient = mongodb.MongoClient;

// create a shortcut to mongodb.ObjectId
const ObjectId = mongodb.ObjectId;

// create the express application
const app = express();

// enable cors
app.use(cors());

// set JSON as the means of
// receiving requests and sending responses
app.use(express.json());

// function to connect to the database
async function connect(uri, dbname) {

    // `connect` allows us to connect to the mongodb
    // useUnifiedTopology means we want use the latest
    // structure for Mongo
    const client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    });
    let db = client.db(dbname);
    return db;
}

async function main() {
    // connection string is now from the .env file
    const uri = process.env.MONGO_URI;
    // get the database using the `connect` function
    const db = await connect(uri, "book-collections");

    // create the routes after connecting to the database
    app.get("/book-collections", async function (req, res) {
        try {
            // empty criteria object
            // Note: if we do a .find({}) it will return all the documents in the collection
            const criteria = {};

            if (req.query.description) {
                criteria.description = {
                    '$regex': req.query.description,
                    '$options': 'i'
                }
            }

            if (req.query.book) {
                criteria.book = {
                    '$in':[req.query.book]
                }
            }

            // get all the collections
            const results = await db.collection("collections").find(criteria).toArray();

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
}
    // Sample Book Collections document"
    // {
    //   _id: "1001",
    //  description:"Acknowledge of children's feelings.",
    //  book title:[["1", "2"]],
    //  publish_date:2020-31-12,
    //  email:"philippa@gmail.com",
    //  language:"English",
    //  paper back:"272 pages",
    //  ISBN-13:"978-0241251027",
    //  sellers rank":"1 in child and developmental psychology",
    //  Ratings:"6712",
    //  Contact":"+6587889",
    //  
    // }
    app.post("/book-collections", async function (req, res) {
        // try...catch is for exception handling
        // an execption is an unexpected error usually from a third party
        // (in this case, the third party is Mongo Atlas)

        const data = [
            {
                "_id":"1001",
                "description":"The main message is that is that it's best to acknowledge of children's feelings.",
                "book title":"The book you wish your parents had read",
                "publish_date":"2020-12-31",
                "email":"philippa@gmail.com",
                "language":"English",
                "paperback":"272 pages",
                "ISBN":"978-0241251027",
                "contact":"+6587889"
            },
            { 
                 "_id":"1002",
                 "book title": "The psychology of money",
                 "description": "Timeless lessons on wealth, greed, and happiness.",
                 "publish_date":"2020-09-08",
                 "email":"morgan@gmail.com",
                 "language": "English",
                 "paperback": "272 pages",
                 "ISBN":"978-0857197689",
                 "ratings":"1 in professional finance",
                 "contact":"+65989098",
    
            }
        ]

        try {
            
            if (!description) {
                res.status(400);
                res.json({
                    'error':'Acknowledge of childrens feelings'
                });
                return;
            }

            if (!book || !Array.isArray(book)) {
                res.status(400);
                res.json({
                    'error':'book must be provided and must be an array'
                })
            }
            
            // insert a new document based on what the client has sent
            const result = await db.collection("collections").insertMany(data);
            
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

    app.put('/book-collections/:webpage', async function(req,res) {

        const data = {
            "description":"The main message is that is that it's best to acknowledge of children's feelings.",
            "book title":"The book you wish your parents had read",
            "publish_date":"2020-12-31",
            "email":"philippa@gmail.com",
            "language":"English",
            "paperback":"272 pages",
            "ISBN":"978-0241251027",
            "contact":"+6587889"
        }

        try {
            id = req.params.webpage;
           
            if (!data.description || !data["book title"] || !Array.isArray(data["book title"])) {
                res.status(400).json({ 'error': 'Invalid data provided' });
                return;
            }

            // The collection name needs to be inside
            const result = await db.collection("collectionNameToReplaceWithTheRealOne").updateOne(
                { '_id': id }, // Filter criteria to match documents by ID
                { '$set': data }
            );
        
            res.json({
                'result': result
            })

        } catch (e) {
            res.status(500);
            res.json({
                'error':'Internal Server Error'
            });
        }
    })
    
    
    
    
       

    app.delete('/book-collections/:id', async function(req,res){
        await db.collection('collections').deleteMany({
            '_id': new ObjectId(req.params.id)
        });

        res.json({
            'message':"Deleted"
        })
    })


main();

app.listen(3000, function () {
    console.log("Server has started");
});