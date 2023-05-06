const express = require('express')
const { ObjectId} = require('mongodb')
const { connectToDb,getDb} = require('./db')
const mongoose = require("mongoose");
const app = express()
app.use(express.json())
const Schema = mongoose.Schema;
const cors = require ('cors');


app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));


let db

//db connection
connectToDb((err) => {
    if(!err)
    {
        app.listen(3026, () =>
        {
            console.log("app listening on port 3026")
        })

        db=getDb()
    }
    
})

//creates a user
app.post('/api/createuser',(req,res)=>{
    data = req.body;
    console.log("Username: ",data.username);
    console.log("Password: ",data.password);
    console.log("Email:",data.email);
    //password encryption goes here
    database = db.collection("users");
    database.insertOne(req.body);
    res.send("success!");
})




app.get('/api/searchuser/:username',(req,res)=>{

    const username = req.params.username;

    db.collection('users').findOne({ username: username })
      .then((user) => {
        if (!user) {
        //   return res.status(400).json('User not found')
          return res.json();
        //   return res.json({ message: 'User not found' });
        }
        return res.status(200).json(user);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: err.message });
      });


        
})


//calls loginsearch and returns an object that it has found if it found something
app.put('/api/login', async (req,res)=>{
    // console.log("REQUEST:",req);
    search_result = await loginSearch(req.body);
    if (search_result===undefined) return await res.send(["Not found"]).status(404);
    else return await res.send(search_result).status(200);
})

//searches the database for entries with the same username/password combination
async function loginSearch(data){
    searchdb = db.collection("users");
    query = {
        username:data.username,
        password:data.password
    }
    console.log(data)
    search_result = await searchdb.find(query).toArray();
    console.log(search_result[0]);

    return search_result[0];
}


/*

const playerModel = new Schema({

    userName: String,
    steamID: String,
    Password: String



});
module.exports = mongoose.model('signUpData', playerModel)




//routes



app.get('/users', (req,res) => {

    let users1 = []

    db.collection('users')
        .find()
        .sort({userName:1})
        .forEach(user => users1.push(user))
        .then(() => {
            return res.status(200).json(users1)
        })
        .catch(()=> {
            return res.status(500).json({error: "could not find user"})
        })

})



app.get ('/search', (req,res)=> {
    res.send(req.query)

    
})

app.get ('/users/:userName', (req,res)=> {

        db.collection('users')
            .findOne({userName: (req.params.userName)})
            .then(doc => {
                return res.status(200).json(doc)
            })
            .catch(()=> {
                return res.status(500).json({error: "could not find user"})
            })

    


})
//allow cross origin request

app.get ('/users/:id', (req,res)=> {
    //req.params.id

    if(ObjectId.isValid(req.params.id)){
        db.collection('users')
            .findOne({_id: new ObjectId(req.params.id)})
            .then(doc => {
                res.status(200).json(doc)
            })
            .catch(err => {
                res.status(500).json({error:"could not find user"})
            })

    }
    else{
        res.status(500).json({error: "not a valid user object id"})
    }


    

})

app.put('/users', (req,res)=>{
    //user object
    const user = req.body

    db.collection('users')
        .insertOne(user)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json({err: "Could not add user"})
        })


})

app.post('/users', (req,res)=>{
    //user object
    const user = req.body

    db.collection('users')
        .insertOne(user)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json({err: "Could not add user"})
        })


})

app.post('/register', (req,res)=>{
    //user object
    const user = req.body

    db.collection('signUpData')
        .insertOne(user)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json({err: "Could not add user"})
        })


})

/*
app.delete('/users/:id',  (req,res)=>{

    if(ObjectId.isValid(req.params.id)){
        db.collection('users')
            .deleteOne({_id: new ObjectId(req.params.id)})
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({error:"could not delete user"})
            })

    }
    else{
        res.status(500).json({error: "not a valid user object id"})
    }

})
*/

app.delete('/search', (req,res)=> {
    
    db.collection('users')
        .deleteOne({userName: req.query.userName})
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json({err: "Could not delete user"})
        })
   
    console.log(req.query)

})


app.patch('/users/:id',  (req,res)=>{
    const updates = req.body
    

    if(ObjectId.isValid(req.params.id)){
        db.collection('users')
            .updateOne({_id: new ObjectId(req.params.id)}, {$set: {updates}})
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({error:"could not update user"})
            })

    }
    else{
        res.status(500).json({error: "not a valid user object id"})
    }

})