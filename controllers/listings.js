const Listing = require("../models/listing");

module.exports.index = async (req, res) => {

    const {search,category,minPrice,maxPrice,sort} = req.query;

    let filter = {};

    if (search && search.trim() !== "") {
        const searchText = search.trim();
        filter.$or = [
            {
                title: {
                    $regex: searchText,
                    $options: "i"
                }
            },
            {
                location: {
                    $regex: searchText,
                    $options: "i"
                }
            },
            {
                country: {
                    $regex: searchText,
                    $options: "i"
                }
            }
        ];
    }

    // Category
    if (category && category.trim() !== "") {
        filter.category = category.trim();
    }

    // Price Filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) {
            filter.price.$gte = Number(minPrice);
        }
        if (maxPrice) {
            filter.price.$lte = Number(maxPrice);
        }
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
        case "priceLow":
            sortOption.price = 1;
            break;
        case "priceHigh":
            sortOption.price = -1;
            break;
        case "newest":
            sortOption._id = -1;
            break;
        case "oldest":
            sortOption._id = 1;
            break;
        default:
            sortOption = {};
    }

    const allListings = await Listing
        .find(filter)
        .sort(sortOption);

    res.render("listings/index.ejs", {
        allListings,
        search: search || "",
        category: category || "",
        minPrice: minPrice || "",
        maxPrice: maxPrice || "",
        sort: sort || ""
    });
};


// Render new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


//  Show one listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing
        .findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // Default India coordinates
    let coordinates = [20.5937, 78.9629];

    // Listing coordinates
    if (
        listing.geometry &&
        listing.geometry.coordinates &&
        listing.geometry.coordinates.length === 2
    ) {
        const [lng, lat] = listing.geometry.coordinates;
        coordinates = [lat, lng];
    }

    res.render("listings/show.ejs", {listing,coordinates});
};


// Create new listing
// Multiple Images
module.exports.createListing = async (req, res) => {
    const location =`${req.body.listing.location}, ${req.body.listing.country}`;

    // Get coordinates from OpenStreetMap
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(location)}&limit=1`,
        {
            headers: {
                "User-Agent": "Wanderlust/1.0"
            }
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Nominatim error: ${response.status} - ${text}`
        );
    }

    const data = await response.json();
    if (data.length === 0) {
        req.flash("error","Location not found!");
        return res.redirect("/listings/new");
    }

    const coordinates = [
        Number(data[0].lon),
        Number(data[0].lat)
    ];


    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;

    // Multiple Images
    const uploadedImages = req.files?.images || [];

    if (uploadedImages.length > 0) {
    newlisting.images = uploadedImages.map((file) => ({
        url: file.path,
        filename: file.filename
    }));

    // First image old image field मध्येही save
    newlisting.image = {
        url: uploadedImages[0].path,
        filename: uploadedImages[0].filename
    };
    }

    newlisting.geometry = {type: "Point",coordinates: coordinates};
    await newlisting.save();
    req.flash("success","New listing created!");
    res.redirect("/listings");

};


// Render edit form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", {listing});

};


// Update listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    Object.assign(listing,req.body.listing);

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    // Update coordinates if location changes
    if (
        req.body.listing.location ||
        req.body.listing.country
    ) {

        const location =
            `${listing.location}, ${listing.country}`;

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(location)}&limit=1`,
            {
                headers: {
                    "User-Agent": "Wanderlust/1.0"
                }
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(
                `Nominatim error: ${response.status} - ${text}`
            );
        }

        const data = await response.json();
        if (data.length > 0) {
            listing.geometry = {
                type: "Point",
                coordinates: [
                    Number(data[0].lon),
                    Number(data[0].lat)
                ]
            };
        }
    }

    await listing.save();
    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);
};

//  Delete listing
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    const deletelisting =await Listing.findByIdAndDelete(id);

    console.log(deletelisting);
    req.flash("success","Listing deleted!");
    return res.redirect("/listings");
};