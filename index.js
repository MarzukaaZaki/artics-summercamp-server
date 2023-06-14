const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const cors = require('cors');
// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions));
app.options("", cors(corsOptions))

app.use(express.json());

const verifyJWT = (req, res, next) =>{
  const authorization = req.headers.authorization;

  // If user is being received
  if(!authorization){
    return res.status(401).send({error: true, message:'Unauthorized Access'})
  }

  // Retrieve token by user
  const token = authorization.split(' ')[1];

  // Verify token
  jwt.verify(token, process.env.VITE_ACCESS_TOKEN_SECRET,(err, decoded)=>{
    if(err){
      return res.status(401).send({error: true, message:'Unauthorized Access'})
    }

    req.decoded = decoded;
    next();
  })
}



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
    const usersCollection = database.collection('users');
    const cartCollection = database.collection('cart');

    app.get('/classes', async(req, res)=>{
        const result = await classesCollection.find().toArray();
        res.send(result);
    })

    app.get('/instructors', async(req, res)=>{
        const result = await instructorsCollection.find().toArray();
        res.send(result);
    })
    
    app.get('/users', async(req, res)=>{
        const result = await usersCollection.find().toArray();
        res.send(result);
    })

    // Check if user is an admin
    app.get('/users/admin/:email', async(req, res)=>{
      const email = req.params.email;

      // if(req.decoded.email!== email){
      //   res.send({admin: false})

      // }


      const query = {email: email};
      const user = await usersCollection.findOne(query);
      const result = {admin: user?.role==='admin'}
      console.log(result);
      res.send(result);
    })

    // Check if user is an admin
    app.get('/users/instructor/:email', async(req, res)=>{
      const email = req.params.email;

      // if(req.decoded.email!== email){
      //   res.send({admin: false})

      // }


      const query = {email: email};
      const user = await usersCollection.findOne(query);
      const result = {instructor: user?.role==='instructor'}
      console.log(result);
      res.send(result);
    })

    
    // Make Admin
    app.patch('/users/admin/:id', async(req, res)=>{
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id)};
      const updateDoc = {
        $set:{
          role: 'admin'
        }
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // Make Instructor
    app.patch('/users/instructor/:id', async(req, res)=>{
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id)};
      const updateDoc = {
        $set:{
          role: 'instructor'
        }
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })


    // Approve Class
    app.patch('/classes/approve/:id', async(req, res)=>{
      const id = req.params.id;
      console.log(id);
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set:{
          status: 'approved'
        }
      };
      const result = await classesCollection.updateOne(filter,updateDoc);
      res.send(result)
    })

    // Deny Class
    app.patch('/classes/deny/:id', async(req, res)=>{
      const id = req.params.id;
      console.log(id);
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set:{
          status: 'denied'
        }
      };
      const result = await classesCollection.updateOne(filter,updateDoc);
      res.send(result)
    })


    // Send Feedback
    app.patch('/classes/feedback/:id', async(req, res)=>{

      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const body = req.body;
      const updateDoc = {
        $set:{
          feedback: body.feedback
        }
      };

      const result = await classesCollection.updateDoc(filter, updateDoc);
      res.send(result);


    })

    // Save user email and role in database
    app.put('/users/:email', async (req, res)=>{
      const email = req.params.email;
      const user = req.body;
      // If a user is already saved in database
      const query = { email: email}
      const options = { upsert: true}   // If not, then save the user
      const updateDoc = {
        $set : user
      }
      const result = await usersCollection.updateOne(query,updateDoc, options);
      console.log(result);
      res.send(result);

    })

    // Fetch classes based on user
    app.get('/myclasses/:email', async(req, res)=>{
      
      const result = await classesCollection.find({instructorEmail :req.params.email}).toArray();
      res.send(result);
    })



    // Save a class in database
    app.post('/classes',async(req, res)=>{
      const classItem = req.body;
      console.log(classItem);
      const result = await classesCollection.insertOne(classItem);
      res.send(result); 
    })


    // Make a jwt token
    app.post('/jwt', async(req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.VITE_ACCESS_TOKEN_SECRET, {expiresIn: '1h'})

      res.send({token});
    })


    app.get('/carts', async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });


    app.post('/carts', async(req, res)=>{
      const item = req.body;
      console.log(item);
      const result = await cartCollection.insertOne(item);
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