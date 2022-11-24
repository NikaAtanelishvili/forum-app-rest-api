const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  // domains that able to access our server
  res.setHeader("Access-Control-Allow-Origin", "*");
  // origins which methods are allowed
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  // headers client might set on their requests
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// routes
app.use("/feed", feedRoutes);

mongoose
  .connect(
    "mongodb+srv://Nika:QyO4r9vObDXa1nTr@messaging-app.jjmnrd2.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then((res) => app.listen(8080))
  .catch((err) => console.log(err));
