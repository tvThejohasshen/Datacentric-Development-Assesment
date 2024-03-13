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
let db; 
async function main() {
    // connection string is now from the .env file
    const uri = process.env.MONGO_URI;
    // get the database using the `connect` function
    db = await connect(uri, "book-collections");

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

[
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
    
        // try...catch is for exception handling
        // an execption is an unexpected error usually from a third party
        // (in this case, the third party is Mongo Atlas)
        
            
     app.post("/book-collections", async function (req, res) {

        try {
            
            const booktitle= req.body.booktitle;
            const description= req.body.description;
            const publishdatetime= req.body.publishdatetime ? new Date(req.body.publishdatetime): new Date();
            
            if(!booktitle) {
                res.status(400);
                res.json({
                    'error':'A booktitle must be provided'
                });
                return;
            }

            // your description is not an array. it is a string.
            // so it is wrong to put !Array.isArray(description) because it checks for array
            if(!description){
                res.status(400);
                res.json({
                    'error':'description must be provided and must be a string'
                })
            }
           // insert a new document based on what the client has sent
           
           console.log("here")
           console.log("book title", booktitle);
           console.log("description", description);
           console.log("publishdatetime here", publishdatetime)

           const result = await db.collection("collections").insertOne({
            'booktitle': booktitle,
            'description': description,
            'publishdatetime': publishdatetime,
           });
           console.log("here 2")
           res.json({
            'result':result
           })
        } catch (e) {
            // e will contain error message
            res.status(500);
            res.json({
                'error':e
            })
        }
     })
    
     app.put('/book-collections/:id', async function(req,res){
        try {
            const booktitle= req.body.booktitle;
            const description= req.body.description;
            const publishdatetime= req.body.publishdatetime ? new Date(req.body.publishdatetime): new Date();
            
    
            if (!booktitle ||!description || Array.isArray(description)) {
                res.status(400); // bad request -- the client didn't follow the specifications for our endpoint
                res.json({
                    'error': 'Invalid data provided'
                });
                return;
            }

            console.log("code works until here")
            const result = await db.collection("collections").updateOne({
                '_id': new ObjectId(req.params.id)
            },{
                '$set': {
                    'booktitle': booktitle,
                    'description': description,
                    'publishdatetime': publishdatetime,
                }
            })
    
            console.log("meow")
            res.json({
                'result': result
            })
        } catch (e) {
            res.status(500);
            res.json({
                'error':'Internal Server Error'
            })
        }
       
    })

    
    app.delete('/book-collections/:id', async function(req,res){
        await db.collection('collections').deleteOne({
            '_id': new ObjectId(req.params.id)
        });

        res.json({
            'message':"Deleted"
        })
    })

}
main();

app.listen(3000, function () {
    console.log("Server has started");
});