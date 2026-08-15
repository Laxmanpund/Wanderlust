const joi= require("joi");

module.exports.listingSchema = joi.object({
    Listing:joi.object({
    title:joi.string().required(),
    descreption: joi.string().required(),
    img: joi.string().allow("",null),
    price: joi.number().required(),
    location: joi.string().required(),
    }).required()
});

module.exports.reviewSchema= joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required(),
    }).required(),
});