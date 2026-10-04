const express = require ("express");
const router = express.Router();
const user =require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl,isLoggedIn} = require("../middleware.js");

const userController = require("../controllers/users");

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get( userController.renderLoginForm)
.post(
    saveRedirectUrl,
    passport.authenticate('local',{failureRedirect: '/login', failureFlash : true}),
    userController.login
);

// logout router
router.get("/logout",userController.logout);

// wishlist
router.get(
    "/wishlist",
    isLoggedIn,
    userController.showWishlist
);

router.post(
    "/wishlist/:id",
    isLoggedIn,
    userController.toggleWishlist
);

module.exports = router;