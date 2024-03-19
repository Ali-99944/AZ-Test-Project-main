const express = require('express')
const authController = require('../controllers/authController')
const categoriesController = require('../controllers/categoriesController')

const router = express.Router()


router
.route('/')
.get(categoriesController.getCategoryList)
.post(authController.protect,
    authController.restrictTo('admin'),
    categoriesController.createCategory)

router
.route('/:id')
.get(categoriesController.getCategory)
.patch(authController.protect,
    authController.restrictTo('admin'),
       categoriesController.updateCategory)
.delete(authController.protect,
    authController.restrictTo('admin'),
        categoriesController.deleteCategory)




module.exports = router;