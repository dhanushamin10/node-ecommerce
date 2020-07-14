const User = require("../models/user");
const bcrypt = require("bcryptjs");
const mailer = require("nodemailer");
const nodeTransporter = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");
const Transporter = mailer.createTransport(
  nodeTransporter({
    auth: {
      api_key:
        "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",
    },
  })
);
const crypto = require("crypto");
const e = require("express");
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
    error: req.flash("error"),
    isAdmin: req.session.isAdmin === "True" ? true : false,
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    error: req.flash("error"),
    isAdmin: req.session.isAdmin,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      bcrypt.compare(password, user.password).then((booleanRes) => {
        if (booleanRes) {
          //Password Match
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.isAdmin = user.superUser;
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        }

        req.flash("error", "Invalid Credentials");
        res.redirect("/login");
      });
    })
    .catch(() => {
      console.log("Invalid Email");
      req.flash("error", "Invalid Credentials");
      res.redirect("/login");
    });
};

exports.postSignup = (req, res, next) => {
  email = req.body.email;
  password = req.body.password;
  const error = validationResult(req);
  console.log(error.array());

  if (!error.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isAuthenticated: false,
      error: error.array()[0].msg,
    });
  }
  User.findOne({ email: email }).then((userFetch) => {
    if (userFetch) {
      req.flash("error", "User Already Exists!");
      return res.redirect("/signup");
    }
    return bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] },
          superUser: "False",
          address: req.body.address,
          mobileno: req.body.mobileno,
          name: req.body.name,
        });
        return user.save();
      })
      .then((result) => {
        res.redirect("/login");
        return Transporter.sendMail({
          to: email,
          from: "dzvenom10@gmail.com",
          subject: "Registration Success",
          html:
            "<h1>You have been successfully registered we are happy to have you </h1>",
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Forgot Password",
    isAuthenticated: req.session.isLoggedIn,
    error: req.flash("error"),
  });
};
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);

      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Email is not associated with any Account");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000;
        return user.save();
      })
      .then(() => {
        res.redirect("/");
        Transporter.sendMail({
          to: req.body.email,
          from: "dzvenom10@gmail.com",
          subject: "Password reset",
          html: `<h1>Request for Password Reset Link Valid for 1 Hour </h1>
          <a href="http://localhost:3000/reset/${token}">Click Here </a>`,
        });
      })
      .catch((err) => console.log(err));
  });
};
exports.getnewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } })
    .then((user) => {
      res.render("auth/newPassword", {
        path: "/newpassword",
        pageTitle: "Password reset",
        isAuthenticated: req.session.isLoggedIn,
        error: req.flash("error"),
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      res.redirect("/");
    });
};
exports.postNewPassword = (req, res, next) => {
  password = req.body.password;
  userId = req.body.userid;
  User.findOne({ _id: userId })
    .then((user) => {
      console.log(user);

      bcrypt.hash(password, 12).then((pass) => {
        user.password = pass;
        user.resetToken = null;
        return user.save();
      });
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};
