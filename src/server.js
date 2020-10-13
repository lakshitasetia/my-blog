import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/build')));

// const articleInfo=
//     {
//         'learn-react' : {
//             'upvote': 0,
//             'comment': [],
//         },
//     };

// app.get("/hello", (req, res) => res.send("Hello!"));
// app.get("/hello/:name", (req, res) => res.send(`Hello ${req.params.name}`));

app.get("/api/articles/:name", async (req, res) =>{
    try{
        const articleName = req.params.name;

        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewURLParser: true, useUnifiedTopology: true });
        const db = client.db('my-blog');
        
        const articleInfo = await db.collection("articles").findOne({ name: articleName });
        res.status(200).json(articleInfo);
        client.close();
    }
    catch(error)
    {
        res.status(500).json({ message: "error connecting to db", error});
    }
});

app.post("/api/articles/:name/upvote", async (req, res) => {
    try{
        const articleName= req.params.name;
        console.log(articleName);

        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser : true, useUnifiedTopology: true});
        const db = client.db('my-blog');

        const articleInfo = await db.collection("articles").findOne({ name: articleName });
        await db.collection("articles").updateOne({ name: articleName },
            {
                '$set' : {
                    upvotes: articleInfo.upvotes+1,
                }
            });

        const updatedArticleInfo = await db.collection("articles").findOne({ name: articleName });
        res.status(200).json(updatedArticleInfo);

        client.close();
    } catch(error){
        res.status(500).json({ message: "error connecting to db", error});
    }
});

app.post("/api/articles/:name/add-comment", async (req, res) => {
    try{
        const {username, text} = req.body;
        const articleName = req.params.name;
        console.log(articleName);

        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser : true, useUnifiedTopology: true});
        const db = client.db('my-blog');

        const articleInfo = await db.collection("articles").findOne({ name: articleName });
        await db.collection("articles").updateOne({ name: articleName },
            {
                '$set' : {
                   comment : articleInfo.comment.concat({ username, text })
                }
            });

        const updatedArticleInfo = await db.collection("articles").findOne({ name: articleName });
        res.status(200).json(updatedArticleInfo);

        client.close();
    } catch(error){
        res.status(500).json({ message: "error connecting to db", error});
    }
})

app.get("*", (req, res)=> {
    res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.listen(8000, ()=> console.log("Listening at port 8000"));