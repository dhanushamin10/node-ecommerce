const router = require("express").Router();

const path = require("path");
const rootDir = require("../utils/path");
const bodyParser = require("body-parser");
const products = [];

router.get("/addProduct", (req, res) => {
  res.sendFile(path.join(rootDir, "views", "addProduct.html"));
});

router.post("/addProduct", (req, res) => {
  products.push({ title: req.body.title });
  console.log(req.body);
});

exports.routes = router;
exports.products = products;
