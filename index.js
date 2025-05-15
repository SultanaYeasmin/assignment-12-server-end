const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',

  ],
  credentials: true
}));



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@cluster0.g4p4k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db("parcelDB");
    const usersCollection = database.collection("users")
    const bookingCollection = database.collection("bookingList")

    //saving user data to db
    app.post('/users/:email', async (req, res) => {
      const email = req.params.email;
      const userData = req.body;
      const query = { email };
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        return res.send(isExist)
      }
      const result = await usersCollection.insertOne(userData)
      res.send(result);
    })

//update profile image
    app.patch('/user/profile/:email', async (req, res) => {
      const { image }= req.body;
      const email = req.params.email;
      const filter = { email };
      const updateDoc = {
        $set: {
          image : image,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    //get user role
    app.get('/users/role/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await usersCollection.findOne(query);

      res.send({ role: result?.role })
    })

    //post-book-a-parcel
    app.post('/book-a-parcel', async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
      console.log(result);
      res.send(result);
    })

    // my-parcels-for-one email
    app.get('/my-parcels/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const result = await bookingCollection
        .aggregate([
          {
            $match: {
              'email': email
            }
          },



        ])
        .toArray();
      console.log(result);
      res.send(result);
    })









  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
  res.send("Transito! A Parcel Management System!")
})

app.listen(port, () => {
  console.log("Port is running on port no:", port)
})


