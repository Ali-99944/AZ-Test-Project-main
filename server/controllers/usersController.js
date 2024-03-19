const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('../controllers/handlerFactory')

// // diskStorage is a method in multer method that set where to storage the files we want to upload 
// const multerStorage = multer.diskStorage({
//     destination: (req,file,cb) => {
//             cb(null,'data/img');
//     },
// // filename function is to select the format of the name of the file that will be uploaded (user-334234-the date.jpg)
//     filename:(req,file,cb) => {

//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// })
const multerStorage = multer.memoryStorage();

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

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({ quality:90 })
        .toFile(`data/img/${req.file.filename}`);


    next();
})


const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj
}

exports.getAllUsers = factory.getAll(User);

// exports.getAllUsers = catchAsync(  async (req,res,next)=>{
// const users =  await User.find()
//     res.status(500).json({
//         status:'success',
//         results:users.length,
//         data:{
//             users: users
//         }
       
//     })
// } )
exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next()
}
exports.updateMe = catchAsync(async (req, res,next) => {
    // 1) Create Error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError(
            'This route is not for password update. please use /updateMyPassword',400))
    }
    // 2) filtered out the unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body,'name','email',)
    if(req.file) filteredBody.photo = req.file.filename
    // 3) update the document
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{new:true,runValidators:true});

    res.status(200).json({
        status: 'success',
        data:{
            user:updatedUser
        }
        
    })
})

exports.deleteMe = catchAsync(async (req, res,next) => {
await User.findByIdAndUpdate(req.user.id, {active:false})
res.status(204).json({
    status: 'success',
    data:null
})
})

exports.getUser = factory.getOne(User)

exports.createUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message: 'this route does not exist please signUp instead',
       
    })
}
/// Do Not update password with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);