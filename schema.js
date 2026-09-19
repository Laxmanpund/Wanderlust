const joi = require("joi");

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),

        description: joi.string().required(),

        image: joi.object({
            filename: joi.string().allow("", null),
            url: joi.string().allow("", null)
        }).allow(null),

        price: joi.number().required(),

        country: joi.string().required(),

        location: joi.string().required(),

        category: joi.string()
            .valid(
                "Trending",
                "Rooms",
                "Iconic cities",
                "Mountains",
                "Castles",
                "Amazing Pools",
                "Camping",
                "Farms",
                "Arctic",
                "Domes",
                "Boats"
            )
            .required()
    }).required()
});


module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required()
    }).required()
});