const express = require("express");

const authController = require("../controllers/auth");
const { check, body } = require("express-validator");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

router.post(
  "/signup",
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords must match!");
    }
    return true;
  }),
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getnewPassword);
router.post("/newpassword", authController.postNewPassword);

module.exports = router;
