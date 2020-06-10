const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
//Import Routes
const adminData = require("./routes/adminRoutes");
const shopRouter = require("./routes/shopRoutes");
//Middlewares
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(adminData.routes);
app.use(shopRouter);

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});
