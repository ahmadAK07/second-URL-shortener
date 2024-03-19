require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const {MongoClient} = require('mongodb');
const dns = require('dns');
const urlparser = require('url');
// Basic Configuration
const port = process.env.PORT || 3000;



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/public', express.static(`${process.cwd()}/public`));

const client = new MongoClient(process.env.DB_URI)

const db = client.db("urlshortener");
const collection = db.collection("urls");

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
   console.log(req.body.url);
  const dnslookup = dns.lookup(urlparser.parse(req.body.url).hostname, 
  async(err, address)=>{
   if(!address){
    res.json({error: "Invalid Url"})
   }else{
    const urlsCount = await collection.countDocuments({})
    const urlDoc = {
      url: req.body.url,
      short_url: urlsCount
    }

    const result = await collection.insertOne(urlDoc);
    console.log(result);
    res.json({original_url: req.body.url, short_url: urlsCount})
   }
  })
 
});

app.get('/api/shorturl/:shortcode', async (req, res)=>{
  const {shortcode} = req.params;
  console.log(shortcode);
    const getUrl = await collection.findOne({
      short_url: +shortcode})
    
    if(!getUrl){
      res.json({error: "Wrong short_url"});
    }
     console.log(getUrl);
    res.redirect(getUrl.url);



}) 

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
