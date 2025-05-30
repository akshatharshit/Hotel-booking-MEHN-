const express= require("express");
const router = express.Router({mergeParams: true});

// we are importing a wrap function to handle Error in async function 
const wrapAsync =require("../UtilsError/warpAsync.js");
const ExpressError =require("../UtilsError/ExpressError.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const {validateReview, isLoggedIn,isreviewAuthor}= require("../middleware.js");

// Rewies post route
router.post("/",isLoggedIn,validateReview,wrapAsync(async(req,res)=>{
    let listing=  await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","Review Created");
    res.redirect(`/listings/${listing._id}`);
    })
    );
    
    
    // review delete route
    router.delete("/:reviewId",isLoggedIn,isreviewAuthor,wrapAsync(async(req,res)=>{
           let{id,reviewId}=req.params;
        await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
    }));
    
    router.all("*",(req,res,next)=>{
       next(new ExpressError(404,"Page Not found"));
    });

    module.exports =  router;