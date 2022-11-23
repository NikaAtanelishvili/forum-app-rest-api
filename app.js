const express = require("express");
const bodyParser = require("body-parser");

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

app.listen(8080);
