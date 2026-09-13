const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: String,
    url: String,
  },
  price: Number,
  location: String,
  country: String,

  // GeoJSON location
   geometry: {
      type: {
          type: String,
          enum: ["Point"],
          required: true,
      },
      coordinates: {
          type: [Number],
          required: true,
        },
    },

  reviews: [
    {
        type: Schema.Types.ObjectId,
        ref: "Review"
    }
],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
});

listingSchema.post("findOneAndDelete", async(listing) => {
  if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}});
  }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports= Listing;