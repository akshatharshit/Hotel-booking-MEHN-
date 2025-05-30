if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express=require("express");
const app=express();
const mongoose = require("mongoose");
const port=8080;
const path = require("path");


// it is use to make  some layout same in all of the pages of ejs ejsmate
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
// importing  for listing route
const listingRouter = require("./routes/listing.js");
// important route for review
const reviewRouter = require("./routes/review.js");
// for user route
const userRouter = require("./routes/user.js");
const methodOverride = require('method-override');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash= require("connect-flash");
const passport = require("passport");
const LocalStrategy= require("passport-local");
const User = require("./models/user.js")

app.use(methodOverride('_method'));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));

const dburl=process.env.ATLASDB_URL;
const store = MongoStore.create({
  mongoUrl: dburl,
  touchAfter: 24 * 3600,
  crypto:{
    secret:process.env.SECRET,
  }
});
store.on("error",()=>{
  console.log("Mongo session store error",err);
})
// this is for session if we want to store tempory data like what is user doing
// on site and we want to remember it so thst when he login again server can remember it
const sessionOptions={
  store,
  secret : process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie :{
    expires : Date.now() + 1000*60*60*24*7, // 7 days
    maxAge : 1000*60*60*24*7,  // 7 days
    httpOnly : true,
  },
};
main()
.then(()=>{console.log("connected")})
.catch(err => console.log(err));
async function main() {
  await mongoose.connect(dburl);
}
// rootpage
app.get("/",(req,res)=>{
  res.send("you are looking for / listinds page ");
});



// middleware for using session
app.use(session(sessionOptions));
// flash some message for doing somthing we use flash npm they must be used before routes
app.use(flash());
// middleware for colling flash

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// to gennrate a password for user 
// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email: "Akshatsingh@123",
//         username : "student",
//     });
//   let registeredUser=  await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// });

// all rote are being exported in listings and are called using 
//app.use middleware 
//one is for lissting route and other one is for 
//review routw
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);



// Middleware for handeling errors
app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong"} =err;
  res.status(statusCode).render("listings/error.ejs",{err,statusCode});
    // res.status(statusCode).send(message);
});


app.listen(port,()=>{
   console.log(`server is listeing throung ${port} `);
});