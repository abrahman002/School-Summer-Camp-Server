const express = require('express');
const app=express();
const cors = require('cors');
const port=process.env.PORT || 5000;
require('dotenv').config();
const axios = require('axios').default;
const { MongoClient, ServerApiVersion } = require('mongodb');


// middleware
app.use(cors())
app.use(express.json());


// mongodb


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6kes8os.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const userCollection=client.db('schoolDb').collection('users')
const popularClassCollection=client.db('schoolDb').collection('popularclass')
const instractorClassCollection=client.db('schoolDb').collection('instructor')

// user oparetion
app.get('/users',async(req,res)=>{
  const result=await userCollection.find().toArray();
  res.send(result);
})
app.post('/users',async(req,res)=>{
    const user=req.body;
    const query={email:user.email};
    const exiting=await userCollection.findOne(query);
    if(exiting){
       return res.send({message:'you already extists'})
    }
    const result=await userCollection.insertOne(user);
    res.send(result);
})

// popularClass oparetion
app.get('/popularclass',async(req,res)=>{
  const query={};
  const options={
    sort:{
      "students_enrolled":-1
    }
  }
    const result=await popularClassCollection.find(query,options).toArray();
    res.send(result);
})

// popularInstractor oparetion
app.get('/instructor',async(req,res)=>{
  const query={}
  const options={"students":-1}
  const result=await instractorClassCollection.find(query,options).toArray();
  res.send(result);
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('islamic-school is runnig')
});
app.listen(port,()=>{
    console.log('server is running')
})