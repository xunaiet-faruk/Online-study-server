const express = require('express');
const app =express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port =process.env.PORT || 5000;
const cors = require('cors');
const cookiParser = require('cookie-parser');
app.use(cors({
    origin: ['http://localhost:5174'],
    credentials:true
}))

app.use(express.json())
app.use(cookiParser())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ot66xwb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

 const verifytoken =(req,res,next) =>{
    const token =req?.cookies?.token;
    console.log('hellow token',token);
    if(!token){
        return res.status(401).send({message : 'unauthorized aceess'})
    }
     jwt.verify(token, process.env.ACCESS_TOKEN,(err,decoded)=>{
        if(err){
            return res.status(401).send({ message: 'unauthosrized acses'})
        }
        req.user=decoded
        next();
     })
 
 }

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

        app.post('/jwt',async(req,res)=>{
            
            const user =req.body;
            console.log("user token here",user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn : '24h'})
            res.cookie('token',token,{
                httpOnly:true,
                secure:true,
                sameSite:'none'
            })
            .send({success : true})

        })

        app.post('/logout',async(req,res)=>{
            const user =req.body;
            console.log("logout here token",user);
            res.clearCookie('token',{maxAge:0}).send({success : true})
        })

        app.get('/fromassinmetns/:id',async(req,res)=>{
            const id =req.params.id
            const query ={_id : new ObjectId(id)}
            const result =await assinmentsColection.findOne(query)
            res.send(result)
        })

        app.get('/fromassinmetns',verifytoken,async(req,res)=>{      
            let query ={};
            if (req.query?.useremail){
                query = { useremail: req.query.useremail }
            }
            console.log(query)
            const result =await assinmentsColection.find(query).toArray()
            res.send(result)
        })

        app.post('/create',async(req,res)=>{
            const query =req.body
            console.log(query);
            const resuilt =await courseCollection.insertOne(query) 
            res.send(resuilt)
        })

        app.patch('/fromassinmetns/:id',async(req,res)=>{
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const pending = req.body
            const updatePanding ={
                $set:{
                    ...pending
                }
            } 
            const result =await assinmentsColection.updateOne(filter,updatePanding)
            res.send(result)
        })

        app.patch('/create/:id',async(req,res)=>{
            const id =req.params.id
            const filter ={_id : new ObjectId(id)}
            const assinments =req.body
            const Updateassinments ={
                $set: assinments
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
            res.send({result,postCount})
            
        })

        app.get('/create/:id',async(req,res)=>{
            const id =req.params.id;
            const query ={_id : new ObjectId(id)}
            const result =await courseCollection.findOne(query)
            res.send(result)
        })

        app.delete('/fromassinmetns/:id',async(req,res)=>{
 
            const id =req.params.id;
            const queryEmail = req.query?.email ;
            const productEmal = req.query?.productEmail;
            const findId = { _id: new ObjectId(id) }

            console.log(queryEmail, productEmal);
          


            if (queryEmail == productEmal){
                const result = await courseCollection.deleteOne(findId)
                res.send(result)
            }



            // const findone = await courseCollection.findOne(findId)
            // const body =req.body
          
            // console.log(findone)
            // const useremail =body?.email
            // if(findemail === useremail){
            //     const result = await courseCollection.deleteOne(findId)
            //     res.send(result)
            
            // }
            // else{
            //     res.send({message : "You cannot deleted this"})
            // }    
         
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