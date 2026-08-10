const express =require ("express");
const app =express();
const mongoose= require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate = require('ejs-mate');
const { nextTick } = require("process");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listingSchema=require("./schema.js");

const MANGO_URL= "mongodb://127.0.0.1:27017/wanderlust";
main().then(()=> {
    console.log("connected to DB");
})
.catch(err => {
    console.log(err);
});
async function main() {
    await mongoose.connect(MANGO_URL);
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/",(req,res) =>{
    res.send("Hi, i'm root");
});

const validatelisting = ((req, res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,"errMsg");
    }
    else{
        next();
    }
});

// index route
app.get("/listings" ,wrapAsync(async (req,res)=> {
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

// show route
app.get("/listings/:id",wrapAsync(async (req,res) =>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));

// create route
app.post("/listings", wrapAsync (async (req,res,next)=> {
        let result =listingSchema.validate(req.body);
        console.log(result);
      const newlisting= new Listing(req.body.listing);
      await newlisting.save();
      res.redirect("/listings");
}));

// edit route
app.get("/listings/:id/edit",wrapAsync(async (req,res) =>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

// update page
app.put("/listings/:id",wrapAsync(async (req,res) =>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

// delete route
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deletelisting = await Listing.findByIdAndDelete(id);
    console.log(deletelisting);
    res.redirect("/listings");
}));

// app.get("/testListing" ,async (req,res) => {
//     let sampleListing = new Listing({
//         title : "my new villa",
//         description : "by the beach",
//         price: 1400,
//         location: "calangute, goa",
//         country: "india"
//     })
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("sucessful testing");
// });

app.all('/{*splat}',(req,res,next)=>{
    next(new ExpressError(404,"page not found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500 , message="something went wrong!"}=err;
    res.render("error.ejs",{message});
    // res.status(statusCode).send(message);
})

app.listen(7984,()=>{
    console.log("server is listening port 7984 ");
});
