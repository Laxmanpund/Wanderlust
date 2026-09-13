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
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // Geocoding
    const location = `${listing.location}, ${listing.country}`;

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
        {
            headers: {
                "User-Agent": "Wanderlust/1.0"
            }
        }
    );

    const data = await response.json();

    let coordinates = [77.216721, 28.644800]; // fallback

    if (data.length > 0) {
        coordinates = [
            Number(data[0].lon),
            Number(data[0].lat)
        ];
    }

    res.render("listings/show.ejs", {
        listing,
        coordinates
    });
};

module.exports.createListing = async (req, res, next) => {
    let url=req.file.path;
    let filename= req.file.filename;
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image= {url, filename};
    await newlisting.save();
    req.flash("success", "new listing created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
};

module.exports.updateListing = async (req,res) =>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    
    if(typeof req.file !== "undefined"){
        let url= req.file.path;
        let filename= req.file.filename;
        listing.image= {url,filename};
        await listing.save();
    }
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