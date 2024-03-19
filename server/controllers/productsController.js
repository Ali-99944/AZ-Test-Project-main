const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const Product = require('../models/productModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')
const factory = require('../controllers/handlerFactory')
const cloudinary = require('../utils/cloudinary')

// const multerStorage = multer.memoryStorage();
const multerStorage = multer.diskStorage({
    filename: function (req,file,cb) {
        cb(null, file.originalname)
      }
});

// this function will make multer upload only images (because multer upload many types of files)
const multerFilter = (req, file, cb) => {
 if(file.mimetype.startsWith('image')){
    cb(null,true)
 } else{
cb(new AppError('Not an image! please upload only images.',400),false)
 }
}

const upload = multer({
    storage: multerStorage ,
    fileFilter: multerFilter
})

// upload.single('imageCover')
exports.uploadProductImages = upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:4}
])

exports.resizeProductImages = catchAsync( async (req, res,next) => {

if(!req.files.imageCover || !req.files.images) return next()
//1) cover image
req.body.imageCover = `product-${req.params.id}-${Date.now()}-cover.jpeg`
await sharp(req.files.imageCover[0].buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({ quality:90 })
        .toFile(`data/img/products/${req.body.imageCover}`);

// 2) images
req.body.images = [];
await Promise.all( 
    req.files.images.map(async (file,i) => {
    const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

    await sharp(file.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({ quality:90 })
        .toFile(`data/img/products/${filename}`);

        req.body.images.push(filename)
})
 );
next()
})
///////////////////////////
exports.uploadProductImageCoverToCloud = async (req, res, next) => {
    const imageCoverPath = req.files['imageCover'][0].path;
  
   await cloudinary.uploader.upload(imageCoverPath, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error uploading imageCover"
        });
      }
  
      Product.findByIdAndUpdate(req.params.id, { imageCover: result.url }, (err, product) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Error updating product"
          });
        }
        
        // res.status(200).json({
        //   message: "ImageCover uploaded",
        //   imageCover: result
        // });
      });
    });
    next()
  };
// exports.uploadProductImageCoverToCloud = (req,res,next) => {
// const imageCoverPath = req.files['imageCover'][0].path
// cloudinary.uploader.upload(imageCoverPath,  (err, result)=>{
//     if(err) {
//       console.log(err);
//       return res.status(500).json({
//         success: false,
//         message: "Error uploading imageCover"
//       })
//     }
//  Product.findOneAndUpdate(req.params.id,{ imageCover:result.url })

//     res.status(200).json({
//       message:"ImageCoverUploaded",
//       imageCover: result
      
//     })
//   }
//   )
// //   next()
// }
//// this middleware is responsible of uploading Only images of the product to the cloudinary
exports.uploadProductImagesToCloud = async function (req, res, next) {
    const imagesPath = req.files['images'].map(image => image.path);
  
    const imagesUploadPromises = imagesPath.map((imagePath) => {
      return cloudinary.uploader.upload(imagePath).catch(error => {
        // If any error occurs during the upload, reject the promise with the error.
        return Promise.reject(error);
      });
    });
  
    await Promise.all(imagesUploadPromises)
      .then(results => {
        // Extract the URLs of the uploaded images
        const imageUrls = results.map(result => result.url);
  
        // Update the product's images field with the image URLs
        Product.findByIdAndUpdate(req.params.id, { images: imageUrls }, (err, product) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              success: false,
              message: "Error updating product"
            });
          }
  
        //   res.status(200).json({
        //     message: "Images Uploaded",
        //     images: imageUrls
        //   });
        });
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: "Error uploading images" });
      })
      next()
    //   .finally(() => {
    //     // Call next() after the asynchronous operations are finished.
    //     next();
    //   });
  };
  


// exports.uploadProductImagesToCloud = function (req, res, next) {
    
//     const imagesPath = req.files['images'].map(image => image.path)
    
    
// const imagesUploadPromises = imagesPath.map((imagePath) =>{
//     return cloudinary.uploader.upload(imagePath)
// })
// Promise.all(imagesUploadPromises,).then(result =>{
//     res.status(200).json({
//         message:"ImagesUploaded",
//         images: result,
        
//     })
// }).catch(err =>{
//     res.status(500).json({message:"Error uploading"})
// })

//     next()
//   }
/////// 




/// this function will make the query to get to cheapest products dependeing on the req.query.limit 
exports.aliasTopCheap =  (req,res,next) => {
    req.query.limit = '3'
    req.query.sort = 'price'  /// <== if we put 'price' like this it will sort from low  to high and '-price' will sort form high to low
    req.query.fields = 'price,name,description,rating'
next()
}

/// products routes handlers

exports.getAllProducts = factory.getAll(Product)

exports.getProduct = factory.getOne(Product, {path:'reviews'} )

exports.createProduct = factory.createOne(Product)

exports.updateProduct = factory.updateOne(Product)

exports.deleteProduct = factory.deleteOne(Product);



exports.getProductStats = catchAsync(async (req,res,next) => {

        const stats = await Product.aggregate([
            { $match : { rating : { $gte:4.5 }},
                $group: {
                    _id: null,
                    count: {$sum: 1}
                }
            }
        ])
        res.status(200).json({
            status:200,
            message: 'products fetched successfully',
            results: "success",
            data: {
                stats:stats
            }
        })

})