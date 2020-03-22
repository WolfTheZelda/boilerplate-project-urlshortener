'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

var dns = require("dns");
var urlSchema = new mongoose.Schema({
  url: {type: String, required: true},
  hash: {type: String, required: true}
});
var urlModel = mongoose.model("Url", urlSchema);
app.post("/api/shorturl/new", function (req, res) {
  var url = req.body.url.replace(/^https?:\/\//i, "");
  dns.lookup(url, (error, addresses, family) => {
    if(error) {
      res.json({error: "invalid URL"});
    } else {
      var hash = Math.random().toString(36).substring(7);
      var model = new urlModel({url, hash});
      model.save((error, data) => {
        if(error) {
          res.json({error: "mongo ERROR"});
        } else {          
          res.json({original_url: url, short_url: hash, data});
        }
      });
    };
  });
});
app.get("/api/shorturl/:hash", (req, res) => {
  urlModel.findOne({hash: req.params.hash }, "url hash", (error, data) => {
    res.redirect(data != undefined ? ("http://" + data.url) : "/");
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});