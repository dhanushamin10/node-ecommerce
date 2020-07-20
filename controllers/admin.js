const Product = require("../models/product");
const file = require("../util/fileDelete");

exports.getAddProduct = (req, res, next) => {
  const error = req.flash("error");
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    error: error,
    isAdmin: req.session.isAdmin === "True" ? true : false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  console.log(req.file);
  if (!image) {
    req.flash("error", "Invalid File Type");
    res.redirect("/admin/add-product");
  } else {
    const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: image.path,
      userId: req.user,
    });
    product
      .save()
      .then((result) => {
        // console.log(result);
        console.log("Created Product");
        res.redirect("/admin/products");
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const error = req.flash("error");
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        error: error,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImage = req.file;
  const updatedDesc = req.body.description;
  if (!updatedImage) {
    req.flash("error", "Invalid File Type");
    res.redirect(`/admin/edit-product/${prodId}?edit=true`);
  } else {
    Product.findById(prodId)
      .then((product) => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        if (updatedImage) {
          file.fileDelete(product.imageUrl);
          product.imageUrl = updatedImage.path;
        }
        return product.save();
      })
      .then((result) => {
        console.log("UPDATED PRODUCT!");
        res.redirect("/admin/products");
      })
      .catch((err) => console.log(err));
  }
};

exports.getProducts = (req, res, next) => {
  console.log(req.user._id);
  Product.find({ userId: req.user._id })
    .then((products) => {
      console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((prod) => {
      file.fileDelete(prod.imageUrl);
    })
    .then(() => {
      Product.findByIdAndRemove(prodId).then(() => {
        console.log("DESTROYED PRODUCT");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => console.log(err));
};
const Order = require("../models/order");
exports.getAllOrders = (req, res, next) => {
  console.log(req.session.isAdmin);
  Order.find()
    .then((orders) => {
      res.render("admin/all-orders", {
        pageTitle: "ALl orders",
        path: "/all-order",
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin === "True" ? true : false,
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};
