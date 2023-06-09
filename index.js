
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');

const app = express();

// middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());
require('dotenv').config();


const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.VITE_DB_USER}:${process.env.VITE_DB_PASS}@cluster0.10dhryt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db('articsDB');
    const classesCollection = database.collection('classes');
    const instructorsCollection = database.collection('instructors');

    app.get('/classes', async(req, res)=>{
        const result = await classesCollection.find().toArray();
        res.send(result);
    })

    app.get('/instructors', async(req, res)=>{
        const result = await instructorsCollection.find().toArray();
        res.send(result);
    })








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Artics Summer Camp Server is running now!')
})

app.listen(port, ()=>{
    console.log(`Artics Summer Camp Server is running on port ${port}`);
})