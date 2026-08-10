const joi= require("joi");
const Listing = require("./models/listing");
const listingSchema = joi.object({
    Listing:joi.object().required(),
    title:joi.string().required(),
    descreption: joi.string().required(),
    img: joi.string().allow("",null),
    price: joi.number().required(),
    location: joi.string().required(),
});

module.exports= listingSchema;