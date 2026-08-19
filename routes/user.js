const express = require ("express");
const router = express.Router();
const user =require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router.get("/signup", (req,res) => {
    res.render("users/signup.ejs");
})

router.post("/signup",wrapAsync( async(req,res) => {
    try{
        let {username,email,password} = req.body;
    const newUser= new user({email, username});
    const regUser = await user.register(newUser, password);
    console.log(regUser);

    req.flash('success', 'user was registered');
    return res.redirect("/listings");
    }catch(e){
        req.flash('error', e.message);
        res.redirect("/signup");
    }
    
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login",
    passport.authenticate('local',{failureRedirect: '/login', failureFlash : true}),
     async(req,res) =>{
        req.flash('success',"welcome back to wanderlust!");
        res.redirect("/listings");
});

module.exports = router;