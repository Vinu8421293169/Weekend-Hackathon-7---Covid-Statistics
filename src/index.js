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

app.get(`/hotspotStates`, (req, res) => {
  connection
    .aggregate([
      {
        $project: {
          _id: 0,
          state: "$state",
          rate: {
            $round: [
              { $subtract: [1, { $divide: ["$recovered", "$infected"] }] },
              5,
            ],
          },
        },
      },
      {
        $match: {
          rate: { $gt: 0.1 },
        },
      },
    ])
    .exec()
    .then((result) => {
      res.send({ data: result });
    })
    .catch((err) => console.log("sm error....", err));
});

app.get(`/healthyStates`, (req, res) => {
  connection
    .aggregate([
      {
        $project: {
          _id: 0,
          state: "$state",
          mortality: { $round: [{ $divide: ["$death", "$infected"] }, 5] },
        },
      },
      {
        $match: {
          mortality: { $lt: 0.005 },
        },
      },
    ])
    .exec()
    .then((result) => {res.send({ data: result });
    })
    .catch((err) => console.log("sm error....", err));
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
