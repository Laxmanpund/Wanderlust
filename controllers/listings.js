const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate: {
        path: "author",
       },
    })
    .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {

    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    await newlisting.save();
    req.flash("success", "new listing created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res) =>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
       req.flash("error", "Listing you requested for does not exist!");
       return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
};

module.exports.updateListing = async (req,res) =>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success", "listing updated!");
    res.redirect("/listings");
};

module.exports.destroyListing = async (req,res)=>{
    let {id}=req.params;
    let deletelisting = await Listing.findByIdAndDelete(id);
    console.log(deletelisting);
    req.flash("success", "listing deleted");
    return res.redirect("/listings");
};