const SubCategory = require('../models/subCategoryModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('../controllers/handlerFactory')


exports.getSubCategoryList = factory.getAll(SubCategory)


// exports.getSubCategoryList = catchAsync(  async (req,res) => {

//    //// then we execute the query
//    const subCategoryList = await SubCategory.find()
// //// send response
// res.status(200).json({
//         status:200,
//         message: 'Sub Category list fetched successfully',
//         results: subCategoryList.length,
//         data: {
//             subCategoryList: subCategoryList
//         }
//     })

// })

exports.getSubCategory = factory.getOne(SubCategory,{path:'category'})

exports.createSubCategory = factory.createOne(SubCategory)

exports.updateSubCategory = factory.updateOne(SubCategory)

exports.deleteSubCategory = factory.deleteOne(SubCategory)