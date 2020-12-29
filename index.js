const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

// app config
const app = express()

// Middle ware
app.use(cors())
app.use(bodyParser.json())
app.use(fileUpload());
app.use(express.static("volunteers"))

// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ipvgi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("patient").collection("appointments");

    app.post('/appointment', (req, res) => {
        const userAppointment = req.body
        console.log(userAppointment);
        collection.insertOne(userAppointment)
        .then(data => {
            res.send(data.insertedCount > 0)
        });
    })

    app.get('/appointmentsByDate', (req, res) => {
        // const date = req.body
        const date =req.query.date;
        // console.log(date.date);
        collection.find({date: date})
        .toArray((err, documents) => {
            res.send(documents)
            console.log(err);
        })
    })
    console.log(err);
})
    


app.get('/', (req, res) => {
    res.send('hello world')
  })
  app.listen(5000)
  console.log('5000 Port successfully run');