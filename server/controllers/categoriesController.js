const Category = require('../models/categoryModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('../controllers/handlerFactory')


exports.getCategoryList = factory.getAll(Category)
// exports.getCategoryList = catchAsync(  async (req,res) => {
//    //// then we execute the query
//    const categoryList = await Category.find()
// //// send response
// res.status(200).json({
//         status:200,
//         message: 'category list fetched successfully',
//         results: categoryList.length,
//         data: {
//            categoryList: categoryList
//         }
//     })
// })
exports.getCategory = factory.getOne(Category)
exports.createCategory = factory.createOne(Category)



exports.updateCategory = factory.updateOne(Category)

exports.deleteCategory = factory.deleteOne(Category)