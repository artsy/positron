export const requireLogin = (req, res, next) => {
  if (req.user) {
    next()
  } else {
    res.redirect("/login")
  }
}

export const requireChannel = (req, res, next) => {
  if (req.user && req.user.get("current_channel")) {
    next()
  } else {
    res.redirect("/logout")
  }
}
