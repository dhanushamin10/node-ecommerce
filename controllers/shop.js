const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const pdfDoc = require("pdfkit");
const { count } = require("console");
const { page } = require("pdfkit");
const LIMIT = 4;
require("dotenv").config();

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let count;
  Product.find()
    .countDocuments()
    .then((num) => {
      count = num;
      return Product.find()
        .skip((page - 1) * LIMIT)
        .limit(LIMIT);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
        pageNum: page,
        hasNextPage: page * LIMIT < count,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(count / LIMIT),
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let count;
  console.log(req.session);
  Product.find()
    .countDocuments()
    .then((num) => {
      count = num;
      return Product.find()
        .skip((page - 1) * LIMIT)
        .limit(LIMIT);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.isLoggedIn,
        pageNum: page,
        hasNextPage: page * LIMIT < count,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(count / LIMIT),
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
          name: req.user.name,
          mobileno: req.user.mobileno,
          address: req.user.address,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};
exports.getInvoice = (req, res, next) => {
  console.log(req.params.orderId);

  const orderId = req.params.orderId;
  Order.findById(orderId).then((order) => {
    if (!order || order.user.userId.toString() !== req.user._id.toString()) {
      res.redirect("/");
    } else {
      const InvoiceName = "invoice-" + orderId + ".pdf";
      const filePath = path.join("data", "invoice", InvoiceName);
      const doc = new pdfDoc();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline;filename=${InvoiceName}`);
      doc.pipe(fs.createWriteStream(filePath));
      doc.pipe(res);
      doc.fontSize(24).text("Invoice");
      doc.text("--------------------------------------------------------");
      doc.fontSize(14).text("Order Data");
      let sum = 0;
      order.products.forEach((prod) => {
        sum += prod.quantity * prod.product.price;
        doc.text(prod.product.title + "  Quantity :" + prod.quantity);
      });
      doc.text("Total Price :" + sum + "Rs");
      doc.end();
    }
  });
};
const stripe = require("stripe")(process.env.STRIPE_KEY);
exports.getCheckout = (req, res, next) => {
  let products;
  let sum;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      sum = 0;
      products.forEach((p) => {
        sum += p.quantity * p.productId.price;
      });
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: "inr",
            quantity: p.quantity,
          };
        }),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        isAuthenticated: req.session.isLoggedIn,
        Total: sum,
        sessionId: session.id,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};
