const express = require('express')
const authController = require('../controllers/authController')
const subCategoriesController = require('../controllers/subCategoriesController')

const router = express.Router()


router
.route('/')
.get(subCategoriesController.getSubCategoryList)
.post(authController.protect,
    authController.restrictTo('admin'),
    subCategoriesController.createSubCategory)

    router
    .route('/:id')
    .get(subCategoriesController.getSubCategory)
    .patch(authController.protect,
        authController.restrictTo('admin'),
        subCategoriesController.updateSubCategory)
    .delete(authController.protect,
        authController.restrictTo('admin'),
        subCategoriesController.deleteSubCategory)




module.exports = router;