const express = require('express')
const authController = require('../controllers/authController')
const cartController = require('../controllers/cartController')
const usersControllers = require('../controllers/usersController')
const router = express.Router()

router
.route('/getUserCart')
.get(authController.protect,
     authController.restrictTo('user'),
    cartController.getUserCart)

router
.route('/addToCart')
.post(authController.protect,
     authController.restrictTo('user'),
    cartController.addToCart)

router
.route('/deleteFromCart')
.delete(authController.protect,
         authController.restrictTo('user'),
        cartController.deleteItemFromCart)

router
.route('/updateItemsQuantity')
.put(authController.protect,
     authController.restrictTo('user'),
    cartController.updateItemsQuantity)



router
.route('/removeCart')
.delete(authController.protect,
         authController.restrictTo('admin'),
        cartController.removeCart)

router
.route('/emptyCart')
.delete(authController.protect,
         authController.restrictTo('user'),
        cartController.emptyCart)

module.exports = router;