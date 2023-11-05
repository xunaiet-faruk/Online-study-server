const express = require('express');
const app =express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port =process.env.PORT || 5000;
const cors = require('cors');

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials:true
}))

app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ot66xwb.mongodb.net/?retryWrites=true&w=majority`;

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
        const courseCollection = client.db("courseDB").collection("course");


        app.post('/create',async(req,res)=>{
            const query =req.body
            const resuilt =await courseCollection.insertOne(query) 
            res.send(resuilt)
        })

        app.get('/create',async(req,res)=>{
            const result =await courseCollection.find().toArray()
            res.send(result)
        })

        app.get('/create/:id',async(req,res)=>{
            const id =req.params.id;
            const query ={_id : new ObjectId(id)}
            const result =await courseCollection.findOne(query)
            res.send(result)
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


app.get('/',(req,res)=>{
    res.send("online coures backend server is running")
})

app.listen(port,()=>{
    console.log(`The Server is runnig port ${port}`)

})