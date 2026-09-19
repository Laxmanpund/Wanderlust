const Listing = require("../models/listing");

// INDEX - Show all listings + Search + Category filter
module.exports.index = async (req, res) => {

    const { search, category } = req.query;

    let filter = {};

    // 🔎 Search by title, location or country
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

    // 🏷️ Category filter
    if (category && category.trim() !== "") {
        filter.category = category.trim();
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", {
        allListings,
        search: search || "",
        category: category || ""
    });
};


// Render new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


// SHOW - Show one listing
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
        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");
    }

    // GeoJSON stores [longitude, latitude]
    // Leaflet needs [latitude, longitude]

    let coordinates = [20.5937, 78.9629];

    if (
        listing.geometry &&
        listing.geometry.coordinates &&
        listing.geometry.coordinates.length === 2
    ) {
        const [lng, lat] = listing.geometry.coordinates;

        coordinates = [lat, lng];
    }

    res.render("listings/show.ejs", {
        listing,
        coordinates
    });
};


// CREATE - Create new listing
module.exports.createListing = async (req, res) => {

    const location =
        `${req.body.listing.location}, ${req.body.listing.country}`;

    // Nominatim Geocoding
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

        req.flash("error", "Location not found!");

        return res.redirect("/listings/new");
    }

    // GeoJSON : [longitude, latitude]
    const coordinates = [
        Number(data[0].lon),
        Number(data[0].lat)
    ];

    const newlisting = new Listing(req.body.listing);

    // Owner
    newlisting.owner = req.user._id;

    // Cloudinary image
    newlisting.image = {
        url: req.file.path,
        filename: req.file.filename
    };

    // GeoJSON geometry
    newlisting.geometry = {
        type: "Point",
        coordinates: coordinates
    };

    await newlisting.save();

    req.flash(
        "success",
        "New listing created!"
    );

    res.redirect("/listings");
};


// Render edit form
module.exports.renderEditForm = async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {

        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", {
        listing
    });
};


// UPDATE - Update listing
module.exports.updateListing = async (req, res) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);

    if (!listing) {

        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");
    }

    Object.assign(
        listing,
        req.body.listing
    );

    // If new image uploaded
    if (req.file) {

        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    // Re-geocode if location/country changed
    if (
        req.body.listing.location ||
        req.body.listing.country
    ) {

        const location =
            `${req.body.listing.location}, ${req.body.listing.country}`;

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

    req.flash(
        "success",
        "Listing updated!"
    );

    res.redirect(`/listings/${id}`);
};


// DELETE - Delete listing
module.exports.destroyListing = async (req, res) => {

    let { id } = req.params;

    const deletelisting =
        await Listing.findByIdAndDelete(id);

    console.log(deletelisting);

    req.flash(
        "success",
        "Listing deleted!"
    );

    return res.redirect("/listings");
};