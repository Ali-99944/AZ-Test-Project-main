const express = require('express')
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')


const router = express.Router({mergeParams:true})


router
.route('/')
.get(authController.protect,
    authController.restrictTo('admin manager'),
    reviewController.getAllReviews)
.post(authController.protect,
    authController.restrictTo('user'),
     reviewController.setProductUserId,
     reviewController.createReview)


router.route('/:id')
.get(reviewController.getReview)
.patch(authController.protect,reviewController.updateReview)
.delete(authController.protect,
    authController.restrictTo('user admin manager'),
    reviewController.deleteReview)    

module.exports = router;