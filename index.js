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
        const cardCollection = client.db("courseDB").collection("cards");
        const assinmentsColection = client.db("courseDB").collection("forms")

        app.post('/fromassinmetns',async(req,res)=>{
            const body =req.body;
            const result =await assinmentsColection.insertOne(body)
            res.send(result)

        })

        app.get('/fromassinmetns',async(req,res)=>{
            const result =await assinmentsColection.find().toArray()
            res.send(result)
        })

        app.post('/create',async(req,res)=>{
            const query =req.body
            const resuilt =await courseCollection.insertOne(query) 
            res.send(resuilt)
        })

        app.patch('/create/:id',async(req,res)=>{
            const id =req.params.id
            const filter ={_id : new ObjectId(id)}
            const assinments =req.body
            const Updateassinments ={
                $set :{
                    title:assinments.title,
                     marks:assinments.marks,
                     image:assinments.image,
                     datepiker:assinments.datepiker,
                     difficult:assinments.difficult,
                     description:assinments.description
                }
            }

            const resuilt =await courseCollection.updateOne(filter,Updateassinments)
            res.send(resuilt)

        })



        app.post('/submitted', async (req, res) => {
            const card = req.body;
            const result = await cardCollection.insertOne(card)
            res.send(result)
        })

      

        app.get('/create/:id',async(req,res)=>{
            const id =req.params.id
            const query ={_id : new ObjectId(id)}
            const resuilt =await courseCollection.findOne(query)
            res.send(resuilt)
        })

        app.get('/create',async(req,res)=>{
            const query =req.query;
            const page =query.page

            const pagenumber =parseInt(page)
            const perpage =6;

            const skip =pagenumber * perpage
            const result =await courseCollection.find().skip(skip).limit(perpage).toArray()
            const postCount =await courseCollection.countDocuments()
            console.log(postCount)
            res.send({result,postCount})
            
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