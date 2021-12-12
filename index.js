const express = require("express")
const app = express()
const cors = require("cors")
const port = process.env.PORT || 3003
const mongodb = require("mongodb")
const mongoclient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';
//const url = "mongodb+srv://ganesh:chitra@cluster0.2pjhw.mongodb.net/booking?retryWrites=true&w=majority"
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

app.use(cors({
    origin: "*"
}))
app.use(express.json())

//////////////
//////////////LOGIN,REGISTER

function authenthicate(req, res, next) {
    try {
        if (req.headers.authorization) {
            jwt.verify(req.headers.authorization, "d3b4Sc2FUe8JwLbYzQ5q", function(error, decoded) {
                if (error) {
                    console.log("errorw")
                    console.log(error)
                } else {
                    console.log(decoded)
                    req.userid = decoded.id
                    console.log(req.userid)
                    next()
                }
            })
        } else {
            console.log("error1")
        }
    } catch (error) {
        console.log("error2")
    }
}

app.post("/register", async function(req, res) {
    try {
        console.log(req.body)
        let client = await mongoclient.connect(url);
        let db = client.db("blog");
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);
        req.body.password = hash
        console.log(req.body)
        let post = await db.collection("registers").insertOne(req.body);
        await client.close()
    } catch (error) {
        console.log(error)
        console.log("erorrrr")
    }
})
var name, mail, dob, password, insta, twitter;
app.post("/login", async function(req, res) {
        try {
            console.log(req.body)
            let client = await mongoclient.connect(url);
            let db = client.db("blog");
            req.body.userid = req.userid
            let user = await db.collection("registers").findOne({
                mail: req.body.mail
            })
            console.log(user)
            if (user) {
                let match = await bcrypt.compareSync(req.body.password, user.password)
                console.log(match)
                if (match) {
                    let token = jwt.sign({
                        id: user._id
                    }, "d3b4Sc2FUe8JwLbYzQ5q");
                    console.log(token)
                    name = user.name;
                    mail = user.mail;
                    insta = user.insta;
                    twitter = user.twitter
                    dob = user.dob
                    res.json({
                        message: true,
                        token
                    })
                } else {
                    console.log("error3")
                    console.log(error)
                }
            } else {
                console.log("error4")
                console.log(error)
            }
        } catch (error) {
            console.log("incorrect")
            console.log(error)
        }
    })
    //////////////////////////////////////////
    ////////////////////////////////////////
app.post("/feed", [authenthicate], async function(req, res) {
        try {
            let client = await mongoclient.connect(url);
            let db = client.db("blog");
            req.body.name = name
            req.body.mail = mail;
            req.body.insta = insta;
            req.body.twitter = twitter;
            req.body.userid = req.userid;
            // console.log(req.body)
            // let now = new Date();
            // let today = now.toString();
            // req.body.date = today;
            // req.body.like = "unchecked"
            // req.body.ids = []
            console.log(req.body)
            let post = await db.collection("feed").insertOne(req.body);
            await client.close()
            console.log("success feed")
        } catch (error) {
            console.log(error);
            console.log("no feed posted")
        }
    })
    //////////////////////////////////////////
    ////////////////////////////////////////
app.get('/profile', async function(req, res) {
    try {
        console.log(name,
            mail,
            dob,
            insta,
            twitter)
        res.json({
            name,
            mail,
            dob,
            insta,
            twitter
        })
    } catch (error) {}
})

app.get('/news', [authenthicate], async function(req, res) {
    try {
        let client = await mongoclient.connect(url);
        let db = client.db("blog");
        req.body.userid = (req.userid)
        let get = await db.collection("feed").find({
            userid: req.userid
        }).toArray();
        let got = get.reverse();
        res.json(got);
        console.log(got);
        await client.close();
    } catch (error) {}
})

app.get('/allnews', [authenthicate], async function(req, res) {
    try {
        let client = await mongoclient.connect(url);
        let db = client.db("blog");
        let get = await db.collection("feed").find({}).toArray();
        let got = get.reverse();
        res.json(got);
        console.log(got);
        await client.close();
    } catch (error) {}
})

app.post("/id", async function(req, res) {
    try {
        console.log(req.body)
        let client = await mongoclient.connect(url);
        let db = client.db("blog");
        let del = await db.collection("id").deleteMany({});
        let post = await db.collection("id").insertOne(req.body);
        await client.close();
    } catch (error) {}
})
app.get("/getid", async function(req, res) {
    try {
        let client = await mongoclient.connect(url);
        let db = client.db("blog");
        let get = await db.collection("id").find({}).toArray();
        let ids = get[0].did;
        console.log(ids)
        let got = await db.collection("feed").find({
            _id: mongodb.ObjectId(ids)
        }).toArray();
        res.json(got);
        console.log(got);
        await client.close();
    } catch (error) {}
})



///////////////////////////////////////////
app.listen(port, function() {
    console.log(`App is Running in ${port}`);
})