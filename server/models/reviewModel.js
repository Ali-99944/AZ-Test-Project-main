const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
user:{
type:mongoose.Schema.Types.ObjectId,
ref:'User',
required:true
},
product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Product',
    required:true
},
rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },
comment:{
    type:String,
    required:true
},
createdAt:{type:Date, default:Date.now()}
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
//// middleware
// this middleware show just the name of the property that we populate when we find the reviews  in the method .populate('user product') 
// reviewSchema.pre(/^find/, function(next){
// this.populate({
//     path: 'product',
//     select:'name'
// }).populate({
//     path: 'user',
//     select:'name photo'
// })
// next()
// })

reviewSchema.pre(/^find/, function(next){
this.populate({
    path: 'user',
    select:'name photo'
})
next()
})


const Review = mongoose.model('Review',reviewSchema) 

module.exports = Review;