const express = require('express')
const { ObjectId} = require('mongodb')
const { connectToDb,getDb} = require('./db')
const mongoose = require("mongoose");
const app = express()
app.use(express.json())
const Schema = mongoose.Schema;


const playerModel = new Schema({

    userName: String,
    steamID: String,
    Password: String



});


let db

//db connection
connectToDb((err) => {
    if(!err)
    {
        app.listen(3005, () =>
        {
            console.log("app listening on port 3005")
        })

        db=getDb()
    }
    
})



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