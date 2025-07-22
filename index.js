const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const bookingCollection = database.collection("bookings")
    const reviewCollection = database.collection("reviews")
    const paymentCollection = database.collection("payments")

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
      const { image } = req.body;
      const email = req.params.email;
      const filter = { email };
      const updateDoc = {
        $set: {
          image: image,
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
      // console.log(result);
      res.send(result);
    })

    // my-parcels-for-one email
    app.get('/my-parcels/:email', async (req, res) => {
      const email = req.params.email;
      const status = req.query.status;
      const query = { email }
      if (email && status !== "All") {
        query.status = status
      }
      const result = await bookingCollection
        .find(query)
        .toArray();
      // console.log(result);
      res.send(result);
    })

    // my-parcels-for-one id
    app.get('/parcel/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      // console.log(id, query);
      const result = await bookingCollection
        .findOne(query)
        ;
      // console.log(result);
      res.send(result);
    })

    //update my-parcels-for-one id
    app.put('/update-a-parcel/:id', async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedParcelData = req.body;
      const updateDoc = {
        $set: updatedParcelData
      };
      const result = await bookingCollection
        .updateOne(filter, updateDoc, options)
        ;
      // console.log(result);
      res.send(result);
    })

    //status update
    app.patch('/parcel/:id', async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: status
        },
      };

      const result = await bookingCollection.updateOne(filter, updateDoc);
      // console.log(result)
      res.send(result);
    })
    // delivery men:
    app.get('/all-parcels/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }

      const user = await usersCollection.findOne(filter);
      const id = user?._id.toString();
      // console.log(id, typeof (id))
      const query = { delivery_man_ID: id }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);

    })

    app.get('/my-reviews/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }

      const user = await usersCollection.findOne(filter);
      const id = user?._id.toString();
      // console.log(id, typeof (id))
      const query = { delivery_man_ID: id }
      const result = await reviewCollection.find(query).toArray();
      res.send(result);

    })

    //status update
    app.patch('/all-parcels/:id', async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: status
        },
      };

      const result = await bookingCollection.updateOne(filter, updateDoc);

      res.send(result);
    })


    app.post('/review-delivery-man', async (req, res) => {

      const reviewData = req.body;

      const result = await reviewCollection.insertOne(reviewData);
      res.send(result);
    })


    //admin
    //get All parcels & no of delivered parcels
    app.get('/all-parcels', async (req, res) => {
      const delivery_man_ID = (req.query.delivery_man_ID);
      const status = (req.query.status);
      // console.log(typeof delivery_man_ID)

      const query = {};
      if (delivery_man_ID && status) {
        query.delivery_man_ID = delivery_man_ID;
        query.status = status
      }
      const result = await bookingCollection.find(query).toArray();
      const count = result.length;
      // console.log(count);
      res.send({ count, data: result });
    })

    //get All users 
    app.get('/all-users', async (req, res) => {
      // console.log("pagination", req.query);
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      //  console.log("pagination", page, size);

      const result = await usersCollection.find()
        .skip((page - 1) * size)
        .limit(size)
        .toArray();
      res.send({ data: result });
    })


    // get no of parcels booked
    app.get('/bookings/:email', async (req, res) => {

      const email = req.params.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const count = await bookingCollection.countDocuments(query)
      // console.log("no of parcels booked", count)
      res.send({ count });
    })


    app.get('/usersCount', async (req, res) => {
      const count = await usersCollection.estimatedDocumentCount();
      // console.log("count", count)
      res.send({ count });

    })

    //role update
    app.patch('/user/:id', async (req, res) => {
      const id = req.params.id;
      const { role } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: role
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);

      res.send(result);
    })

    //get All delivery-men
    app.get('/delivery-men', async (req, res) => {
      const filter = { role: "Delivery Man" }
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    })

    //get avg review
    app.get('/review/:id', async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection
        .aggregate([
          {
            $match: { delivery_man_ID: id }
          },
          {
            $group: {
              _id: "$ delivery_man_ID",
              averageReview: {
                $avg: "$rating"
              }
            }
          }
        ])
        .toArray();
      const averageRating = result.length > 0 ? result[0].averageReview : 0;
      // console.log(averageRating)
      res.send({ averageRating });
    })



    //update status and assign delivery man
    app.patch('/book-a-parcel/:id', async (req, res) => {
      const id = req.params.id;
      const { status,
        delivery_man_ID,
        expected_delivery_date } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status,
          delivery_man_ID,
          expected_delivery_date
        },
      };

      const result = await bookingCollection.updateOne(filter, updateDoc);

      res.send(result);
    })

    // statistics page : 
    // ❖	A bar chart that shows bookings by date.

    app.get('/bookings-by-date', async (req, res) => {

      const bookingsByDate = await bookingCollection
        .aggregate([
          {
            $group: {
              _id: "$booking_date",
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]).toArray();
      const dates = bookingsByDate.map(item => item._id)
      const count = bookingsByDate.map(item => item.count)
      // console.log(dates, count)
      res.send({ dates, count })
    })

    //PAYMENT INTENT
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      console.log(price)
      const amount = parseInt(price * 100);
      console.log(`${amount} payment intent`)

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ['card'] //extra

        // // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        // automatic_payment_methods: {
        //   enabled: true,
        // },
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    //payments
    app.post('/payments', async (req, res) => {
      const payment = req.body;
      console.log('payment:', payment);
      const result = await paymentCollection.insertOne(payment);
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


