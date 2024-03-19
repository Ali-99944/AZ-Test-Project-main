const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('../controllers/handlerFactory')


exports.getAllReviews = factory.getAll(Review)
// exports.getAllReviews = catchAsync(async (req,res,next) => {
//     let filter = {};
//     if(req.params.productId) filter = {product : req.params.productId }
//     const reviews = await Review.find(filter).populate('user product')
// res.status(200).json({
// status:'success',
// results:reviews.length,
// data:{
//     reviews
// }
// })
// })

exports.getReview = factory.getOne(Review)
// this function is to get the product and user id from the body of req and it will execute before creating a review
exports.setProductUserId = (req,res,next) => {
    // Allow Nested Routes 
    if(!req.body.product) req.body.product = req.params.productId;
    if(!req.body.user) req.body.user = req.user.id;
    next()
}
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)

exports.deleteReview = factory.deleteOne(Review)