const express = require ("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");

const validatelisting = ((req, res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
});

// index route
router.get("/" ,wrapAsync(async (req,res)=> {
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// new route
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
})

// show route
router.get("/:id",wrapAsync(async (req,res) =>{
    let {id}=req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

// create route
router.post("/", wrapAsync (async (req,res,next)=> {
        let result =listingSchema.validate(req.body);
        console.log(result);
      const newlisting= new Listing(req.body.listing);
      await newlisting.save();
      res.redirect("/listings");
}));

// edit route
router.get("/:id/edit",wrapAsync(async (req,res) =>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

// update page
router.put("/:id",wrapAsync(async (req,res) =>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

// delete route
router.delete("/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deletelisting = await Listing.findByIdAndDelete(id);
    console.log(deletelisting);
    res.redirect("/listings");
}));


module.exports = router;
