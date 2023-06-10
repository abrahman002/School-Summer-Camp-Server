const express = require('express');
const app=express();
const cors = require('cors');
const port=process.env.PORT || 5000;
require('dotenv').config();
const axios = require('axios').default;
const jwt=require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors())
app.use(express.json());

// jwt verify

const jwtVerify=(req,res,next)=>{
  const authorization=req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error:true, message:'unathorized access'})
  }
  const token=authorization.split(' ')[1];
   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      res.status(401).send({error:true, message:'unathorized access'})
    }
    req.decoded=decoded;
    next()
   })
}


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
const addClassCollection=client.db('schoolDb').collection('addclass')


// jwt
app.post('/jwt',(req,res)=>{
  const user=req.body;
  const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1hr'})
  res.send({token})
})

// admin verify
const verifyAdmin=async(req,res,next)=>{
  const email=req.decoded.email;
  const query={email:email};
  const user=await userCollection.findOne(query);
  if(user?.role !=='admin'){
         return res.status(403).send({error:true,message:'forbidden message'})
  }
  next()
}

// user oparetion
app.get('/users',jwtVerify, async(req,res)=>{
 
  const result=await userCollection.find().toArray();
  res.send(result);
})
app.get('/users/:id',jwtVerify, async(req,res)=>{
  const email=req.query.email;
  if(!email){
    res.send([])
  }

  const decodedEmail=req.decoded.email;
  if(email!==decodedEmail){
         return res.status(401).send({error:true, message:'unathorized access'})
  }
  
  const query={email:email}
  const result=await userCollection.find(query).toArray();
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


// admin get oparation

app.get('/users/admin/:email',jwtVerify, async(req,res)=>{
   const email=req.params.email;
   const decoded=req.decoded.email;
   if(email !== decoded){
    res.send({admin:false})
   }
   const query={email:email};
   const user=await userCollection.findOne(query);
   res.send({admin:user?.role === 'admin'})
})

app.patch('/users/admin/:id',async(req,res)=>{
  const id=req.params.id;
  const filter={_id: new ObjectId(id)}
  const updateuser={
    $set:{
      role:'admin'
    }
  }
  const result=await userCollection.updateOne(filter,updateuser)
  res.send(result);
})

// instractor get oparetion
app.get('/users/instractor/:email',jwtVerify, async(req,res)=>{
  const email=req.params.email;
  const decoded=req.decoded.email;
  if(email !== decoded){
   res.send({instractor:false})
  }
  const query={email:email};
  const user=await userCollection.findOne(query);
  res.send({instractor:user?.role === 'instractor'})
})

app.patch('/users/instractor/:id',async(req,res)=>{
  const id=req.params.id;
  const filter={_id: new ObjectId(id)}
  const updateuser={
    $set:{
      role:'instractor'
    }
  }
  const result=await userCollection.updateOne(filter,updateuser)
  res.send(result);
})

// addclasss
app.get('/addclass', async(req,res)=>{
  const result=await addClassCollection.find().toArray();
  res.send(result);
})
app.post('/addclass',async(req,res)=>{
  const item=req.body;
  const result=await addClassCollection.insertOne(item);
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