const express = require("express");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


// this line below is used to route the data to app.js
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
// we are importing a wrap function to handle Error in async function 
const wrapAsync = require("../UtilsError/warpAsync.js");
// requing middleware for authentication
const { isLoggedIn, validateListing } = require("../middleware.js");
const { isOwner } = require("../middleware.js");
// used for validating error in listing
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//index page main page
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//new form route // new route 
router.get("/new", isLoggedIn, async (req, res) => {
  res.render("listings/new.ejs");
});


// read opration show route 
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({
    path: "reviews", populate: {
      path: "author",
    },
  })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
}));



// create route
router.post("/", isLoggedIn, upload.single("listing[image]"),
  wrapAsync(async (req, res, next) => {

    // Forward geocode to get coordinates
    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    }).send();

    // Validate geocoding response
    if (!response.body.features.length) {
      req.flash("error", "Location not found");
      return res.redirect("back");
    }

    // Validate image upload
    if (!req.file) {
      req.flash("error", "Image upload failed");
      return res.redirect("back");
    }

    // Assign listing details
    const { path: url, filename } = req.file;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    // Save listing and redirect
    let savedListing = await newListing.save();
    console.log(savedListing);
    
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
  })
);



// edit route
router.get("/:id/edit", isOwner, isLoggedIn, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
}));

// update route
router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image]"), wrapAsync(async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "UPDATED");
  res.redirect(`/listings/${id}`);
}));


// delete route
router.delete("/:id", isOwner, isLoggedIn, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let del = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
}));


// exporting it to app.js from where we can use it
module.exports = router;