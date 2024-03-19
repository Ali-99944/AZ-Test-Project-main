const express = require('express')
const productsController = require('../controllers/productsController')
const authController = require('../controllers/authController')
// const reviewController = require('../controllers/reviewController')
const reviewsRouter = require('../routes/reviewsRoutes')

const router = express.Router()


router.use('/:productId/reviews',reviewsRouter)


router
.route('/top-cheap-products')
.get(productsController.aliasTopCheap,authController.protect,
    authController.restrictTo('user'), productsController.getAllProducts)


router
.route('/')
.get(
    // authController.protect,
    // authController.restrictTo('admin'),
    productsController.getAllProducts)
.post(authController.protect,
    authController.restrictTo('admin'),
    productsController.createProduct)

router
.route('/:id')
.get(productsController.getProduct)
.patch(authController.protect,
    authController.restrictTo('admin'),
    productsController.uploadProductImages,
        // productsController.resizeProductImages,
        productsController.uploadProductImageCoverToCloud,
        productsController.uploadProductImagesToCloud,
    productsController.updateProduct)
.delete(authController.protect,
    authController.restrictTo('admin'),
    productsController.deleteProduct)


module.exports = router;