const express =require ("express");
const app =express();
const mongoose= require("mongoose");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

app.use("/listings", listings);
app.use("listings/:id/reviews", reviews);


// error route
app.all('/{*splat}',(req,res,next)=>{
    next(new ExpressError(404,"page not found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500 , message="something went wrong!"}=err;
    res.render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(7984, () => {
    console.log("server is listening port 7984");
});
