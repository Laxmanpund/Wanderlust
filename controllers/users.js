const user =require("../models/user");

module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async(req,res,next) => {
    try{
        let {username,email,password} = req.body;
    const newUser= new user({email, username});
    const regUser = await user.register(newUser, password);
    console.log(regUser);
    
    req.login(regUser,(err) =>{
        if(err){
            return next(err)
        }
    req.flash('success', 'welcome to wanderlust');
    return res.redirect("/listings");
    })

    }catch(e){
        req.flash('error', e.message);
        res.redirect("/signup");
    }
    
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req,res) =>{
        req.flash('success',"welcome back to wanderlust!");
        let redirectUrl = res.locals.redirectUrl || "/listings"; 
        res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next();
        }
        req.flash('success', "you are logged out!");
        res.redirect("/listings");
    });
};


// Show Wishlist
module.exports.showWishlist = async (req, res) => {

    const currentUser = await user
        .findById(req.user._id)
        .populate("wishlist");

    res.render("users/wishlist.ejs", {
        listings: currentUser.wishlist
    });
};


// Add / Remove Wishlist
module.exports.toggleWishlist = async (req, res) => {

    const listingId = req.params.id;
    const currentUser = await user.findById(req.user._id);
    const alreadyAdded = currentUser.wishlist.some(
        (id) => id.toString() === listingId
    );

    if (alreadyAdded) {
        currentUser.wishlist.pull(listingId);
        req.flash("success","Removed from wishlist!");
    } else {
        currentUser.wishlist.push(listingId);
        req.flash("success","Added to wishlist!");
    }

    await currentUser.save();
    res.redirect(`/listings/${listingId}`);
};