const express  = require('express')
const app = express()
const mongoose = require ('mongoose');
mongoose.set ('strictQuery', false);
var routes = require ('./route/routes');

// using express to listening to a port
app.listen (9992, function check(err){
    if (err)
    console.log ("Error...!!");
    else 
    console.log ("Started...!");

});





// establishing database connection
mongoose.connect ("mongodb://127.0.0.1:27017/MEANStackDB", {useNewUrlParser: true, useUnifiedTopology: true},
function checkDb(error) {
    if (error) {
        console.log ("Failed to connect to DB", error);
    }
    else {
        console.log ("Successfully connected to DB");
    }

});


app.use(express.json());
app.use(routes);