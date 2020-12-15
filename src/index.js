const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const port = 8080;

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector');


app.get('/totalRecovered',(req,res)=>{
    connection.aggregate([
        { $match: {} },
        { $group: { _id: "", total: { $sum: "$recovered" } } }
     ]).then((ele)=>res.send({data: {_id: "total", recovered:ele[0].total}}));
});

app.get('/totalActive',(req,res)=>{
    connection.aggregate([
        { $group: { _id: "", infected:{ $sum: "$infected"},recovered:{$sum: "$recovered"}  }}
     ])
     .then((ele)=>res.send({data: {_id: "total", active:ele[0].infected-ele[0].recovered}}))
     .catch(err=>res.send(err.message));
});

app.get('/hotspotStates',(req,res)=>{
    connection.aggregate([
        { $group: { _id: "", infected:{ $sum: "$infected"},recovered:{$sum: "$recovered"}  }}
     ])
     .then((ele)=>res.send({data: {_id: "total", active:(ele[0].infected-ele[0].recovered)/ele[0].infected}}))
     .catch(err=>res.send(err.message));
});

app.get('/totalDeath',(req,res)=>{
    connection.find({$gte:[{$divide:[{$subtract:[infected,recovered]},infected]},0.1]}).then((ele)=>res.send(ele));
});

// /healthyStates

app.get('/hotspotStates',(req,res)=>{
    connection.aggregate([
        { $match: {} },
        { $group: { _id: "total", death: { $sum: "$death" } } }
     ]).then((ele)=>res.send({"data":ele[0]}));
});

app.get('/healthyStates',(req,res)=>{
    connection.aggregate([
        { $match: {} },
        { $group: { _id: "total", death: { $sum: "$death" } } }
     ]).then((ele)=>res.send({"data":ele[0]}));
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
