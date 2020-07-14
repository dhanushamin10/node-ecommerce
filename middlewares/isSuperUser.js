module.exports = (req, res, next) => {
  if (req.session.user.superUser !== "True") {
    return res.redirect("/");
  }
  next();
};
