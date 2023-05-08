const express = require('express')
const { ObjectId} = require('mongodb')
const { connectToDb,getDb} = require('./db')
const mongoose = require("mongoose");
const app = express()
app.use(express.json())
const Schema = mongoose.Schema;
const cors = require ('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { decode } = require('punycode');
app.use(cookieParser())
// import * as jwt from jsonwebtoken;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
    // data = req.body;
    const {username, password, email} = req.body
    console.log("Username: ",username);
    console.log("Password: ",password);
    console.log("Email:",email);
    database = db.collection("users");


        // const userExist = database.findOne({ $or: [{ username }, { email }] });
        // console.log (userExist)
        // res.json(userExist)




        db.collection('users').findOne({ $or: [{ username }, { email }] })
        .then((user) => {
          if (!user) {
              //if no user exist in the database, return nothing back to the frontend
              database.insertOne(req.body);  
              return res.json("Sign Up Success!")
  
          }else if (user.username) {
              //if user exist, return the user data back to the front end
              return res.json("Username or email already exist!")
          }

        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ message: err.message });
        });
        

})

//Resets password of user: TODO create email functionality
app.post('/api/resetpassword',(req,res)=>{
    data = req.body;
    console.log("Username: ", data.username);
    console.log("Password: ",data.password);
    //TODO encrypt password
    db.collection("users").updateOne({username: data.username}, {"$set": {password: data.password}});
    console.log("User :" + data.username + " has had their password updated");
    res.send("Password successfully modified");
})

const RSA_PRIVATE_KEY = fs.readFileSync('./private.key');
const RSA_PUBLIC_KEY = fs.readFileSync('./public.key');

function checkIfAuthenticated(token){
    try{
        const decodeToken = jwt.verify(token, RSA_PUBLIC_KEY, {algorithms:['RS256']});
        const expiration = decodeToken.exp;
        console.log(decodeToken);
        return true
    } catch (err){
        if (err.name=="TokenExpiredError"){
            console.error("token expired")
            return false
        } else {
            console.error("Error verifying token: ",err)
            return false
        }
    }
    
}

// api to call when trying to authenticate user.
app.get('/api/authenticate', (req,res)=>{
    authHeader = req.headers.authorization;
    token = authHeader && authHeader.split(' ')[1];
    console.log(token);
    if (checkIfAuthenticated(token)){
        console.log("Authentication success!")
        res.send({value: true}).status(200);
    } else {
        console.log("Authentication failed!")
        res.send({value: false}).status(500);
    }
})

app.get('/api/searchuser/:username',(req,res)=>{

    const username = req.params.username;

    db.collection('users').findOne({ username: username })
      .then((user) => {
        if (!user) {
            //if no user exist in the database, return nothing back to the frontend
            return res.json("No user exist!");

        }else {
            //if user exist, return the user data back to the front end
            return res.status(200).json(user);
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: err.message });
      });


        
})


//calls loginsearch and returns an object that it has found if it found something
app.post('/api/login', async (req,res)=>{
    // console.log("REQUEST:",req);
    search_result = await loginSearch(req.body);
    if (search_result===undefined) { //if an account is not found with matching credentials
        return await res.send(["Not found"]).status(404);
    } else { //an account is found with matching credentials
        console.log("ACCOUNT FOUND!")
        const jwtBearerToken = await jwt.sign({}, RSA_PRIVATE_KEY, {
            algorithm:'RS256',
            expiresIn: '2h', 
            subject: search_result._id.toString()
        })
        return await res.send({token: jwtBearerToken});

    }
    // return await res.send(["Not found"]).status(404);
    // else return await res.send(search_result).status(200);
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

*/

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

/*

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

app.delete('/api/deleteAccount/:username', (req,res)=> {
    
    const username = req.params.username;

    db.collection('users').findOne({ username: username })
      .then((user) => {
        if (!user) {
             
          //if there is no such user exist in the database return nothing back to the frontend
          return res.json();
        }
        else{
          //if found the user exist in the database, delete that user and send message back to frontend
            db.collection('users').deleteOne({ username: username })
            return res.status(200).json({message: "Delete Successfully!"});
        }
        
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: err.message });
      });

})

app.patch('/api/updatePassword/:username/:password', (req,res)=> {

    const un = req.params.username;
    const newPass = req.params.password;

    db.collection('users').findOne({ username: un })
      .then((user) => {
        if (!user) {
             
          //if there is no such user exist in the database return nothing back to the frontend
          return res.json();
        }
        else{
          //if found the user exist in the database, delete that user and send message back to frontend
            db.collection('users').updateOne({username: un}, {"$set": {password: newPass}});
            return res.status(200).json({message: "Updated password Successfully!"});
            
        }
        
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: err.message });
      });



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