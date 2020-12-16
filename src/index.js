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
        { $group: { _id: "total", recovered: { $sum: "$recovered" } } }
     ]).then((ele)=>res.send({data:ele[0]}));
});

app.get('/totalActive',(req,res)=>{
    connection.aggregate([
        { $match: {} },
        {
            $group : {
                _id: "total",active: { $sum: { $subtract: [ "$infected", "$recovered" ] } }
            }
        }
     ]).then((ele)=>res.send({data:ele[0]}));
});

app.get('/totalDeath',(req,res)=>{
    connection.aggregate([
        { $match: {} },
        {
            $group : {
                _id: "total",
               death: { $sum: "$death" }
            }
        }
     ]).then((ele)=>{
         res.send({data:ele[0]});
     }).catch((err)=>res.json({error:err.message}));
});

app.get('/hotspotStates',(req,res)=>{
    connection.update({
         $set:{mortality:{$round : [ {$divide:[{$subtract:["$infected","$recovered"]},"$infected"]}, 5 ]}}
    }).find({mortality:{$gt:0.1}}).then((result)=>{
        res.send(result);
    }).catch(err=>console.log(err.message));
});



app.get('/healthyStates',(req,res)=>{
    connection.update({
        $set:{mortality:{$round : [ {$divide:[{$subtract:["$infected","$recovered"]},"$infected"]}, 5 ]}}
   }).find({mortality:{$gt:0.1}}).then((result)=>{
       res.send(result);
   }).catch(err=>console.log(err.message));
});



app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
