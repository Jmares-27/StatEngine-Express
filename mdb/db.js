//mongo db driver import
const {MongoClient} = require ('mongodb')

let dbConnection

module.exports = {
    //connects to database
    connectToDb: (cb) => {
        MongoClient.connect("mongodb://127.0.0.1:27017/testdb")
        .then((client) => {
            dbConnection = client.db()
            return cb()
        })
        .catch(err => {
            console.log(err)
            return cb(err)
        })
    },
    //retrieves connection database
    getDb: () => dbConnection
}