const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();
const auth = require("../middlewares/isAuthenticated");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", auth, shopController.getCart);

router.post("/cart", auth, shopController.postCart);

router.post("/cart-delete-item", auth, shopController.postCartDeleteProduct);

router.post("/create-order", auth, shopController.postOrder);

router.get("/orders", auth, shopController.getOrders);

router.get("/orders/:orderId", auth, shopController.getInvoice);
router.get("/checkout", shopController.getCheckout);
router.get("/checkout/success", shopController.postOrder);
router.get("/checkout/cancel", shopController.getCheckout);

module.exports = router;
