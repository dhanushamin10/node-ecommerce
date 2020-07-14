const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");

const router = express.Router();
const isSuperUser = require("../middlewares/isSuperUser");

const auth = require("../middlewares/isAuthenticated");

// /admin/add-product => GET
router.get("/add-product", auth, isSuperUser, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", auth, isSuperUser, adminController.getProducts);

// /admin/add-product => POST
router.post("/add-product", auth, adminController.postAddProduct);

router.get("/edit-product/:productId", auth, adminController.getEditProduct);

router.post("/edit-product", auth, adminController.postEditProduct);

router.post("/delete-product", auth, adminController.postDeleteProduct);
router.get("/all-orders", auth, isSuperUser, adminController.getAllOrders);

module.exports = router;
