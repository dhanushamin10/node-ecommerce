const router = require("express").Router();
const path = require("path");
const rootDir = require("../utils/path");
const products = require("./adminRoutes").products;

router.get("/Products", (req, res) => {
  res.sendFile(path.join(rootDir, "views", "shop.html"));
});
router.get("/", (req, res) => {
  console.log(products);

  res.sendFile(path.join(__dirname, "../views", "shop.html"));
});
module.exports = router;
