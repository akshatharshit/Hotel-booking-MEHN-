const Joi = require('joi');
// joi is mainly use dvalidate our schema so that invalid request coulde not be sent 
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required(),
    }).required()
});

module.exports.reviewSchema=  Joi.object({
     review : Joi.object({
     rating : Joi.number().required().min(1).max(5),
     comment:Joi.string().required(),
     }).required()
});