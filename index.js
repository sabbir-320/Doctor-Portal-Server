const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra')

// app config
const app = express()
require('dotenv').config()

// Middle ware
app.use(cors())
app.use(bodyParser.json())
app.use(fileUpload());
app.use(express.static("doctors"))

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

    app.post('/addDoctor', (req, res) => {
        const file = req.files.file
        const name = req.body.name
        const email = req.body.email
        console.log(name, email, file);
        const filePath = `${__dirname}/doctors/${file.name}`
        file.mv(filePath, err => {
            if (err) {
                console.log(err);
                return res.status(500).send({ msg: 'file upload failed' })
            }
            const newImg = fs.readFileSync(filePath)
            const encImg = newImg.toString('base64')
            const image = {
                contentType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer(encImg, 'base64')
            }

            collection.insertOne({ name, email, image })
                .then(result => {
                    fs.remove(filePath, error => {
                        if (error) {
                            console.log(error);
                            res.status(500).send({ msg: 'file upload failed' })
                        }
                        res.send(result.insertedCount > 0)
                    })
                })
        })
    })

    app.get('/appointmentsByDate', (req, res) => {
        const date = req.body.date
        console.log(date);
        collection.find({ date: date })
            .toArray((err, documents) => {
                res.send(documents)
                console.log(err);
            })
    })

    app.get('/doctors', (req, res) => {
        collection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


})



app.get('/', (req, res) => {
    res.send('hello world')
})
app.listen(5000, function () { console.log('run successfully') })
