const express = require('express')
const { connectToDb, getDb} = require('./db')

const app = express()

//db connection
connectToDb((err) => {
    if(!err)
    {
        app.listen(3000, () =>
        {
            console.log("app listening on port 300")
        })

        db.getDb()
    }
})

app.listen(3000, () => {
    console.log("on port 3000")
})


//routes

app.get('/users', (req,res) => {

    let users = []

    db.collection('users')
        .find()
        .forEach(user => users.push(user))
        .then(() => {
            res.status(200).json(users)
        })
        .catch(()=> {
            res.status(500).json({error: "could not find user"})
        })

    res.json({ mssg: "ey we did it"})
})