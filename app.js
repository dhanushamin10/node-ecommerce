const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");

const XStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime().toString() + "-" + file.originalname);
  },
});
const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const mongoDBstore = require("connect-mongodb-session")(session);
const store = new mongoDBstore({
  uri: `mongodb+srv://admin_dhanush:iamadrifter7@amincluster-96sv7.mongodb.net/shop`,
  collection: "sessions",
});

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const { collection, db } = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: XStorageEngine, fileFilter: filefilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "myNameisDhanush",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});
app.use(flash());

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://admin_dhanush:iamadrifter7@amincluster-96sv7.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
