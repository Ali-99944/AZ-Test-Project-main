const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')

const signToken = id => {
    return  jwt.sign({ id }, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    }) ;
}

const createSendToken = (user,statusCode,req,res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true  ,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    }
res.cookie('jwt',token,cookieOptions);
// Remove the password from the output
user.password = undefined;
res.status(statusCode).json({
    status: "success",
    token,
    data:{
        user: user
    }
})
}

exports.signup = catchAsync(async (req, res, next) => {
const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
})

createSendToken(newUser,201,req,res)
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    /// 1) check if the email and password does exist
if(!email || !password) {
return next(new AppError('Please provide email and password',400));

}

    /// 2) check if the user exists && password is correct 
const user = await User.findOne({email}).select('+password')
const correct = await user.correctPassword(password, user.password);

if(!user || !correct) {
    return next(new AppError('incorrect emailvor password',401))
}

    /// 3) if everything is ok, send the token to the client
    createSendToken(user,200,req,res)
})

exports.protect = catchAsync(async (req,res,next)=> {
    //1) Getting the token and checking if it there
    let token ;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token) {
        return next(new AppError('You are not logged in! Please log in to get access.',401) )
    }
    /// 2) Verefication the token
const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    /// 3) chack if user still exists
    const currentUser = await User.findById(decoded.id)
    if(!currentUser) {
        return next(new AppError('The user belonging to this token no longer exist.',401))
    }
    /// 4) check if the user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('The user recently changed password! Please log in again.',401))
    }
/// Grant access to protected route
    req.user = currentUser;
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //// roles['admin','empolyee']. role='user
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action.',403));
        }
        next()
    }
}


exports.forgotPassword = catchAsync(async  (req, res,next)=> {
// 1) get user based on posted email
const user = await User.findOne({ email: req.body.email})
if(!user){
    return next(new AppError('There is no user with that email address.', 404))
}

// 2) generate the random reset token
    const resetToken = user.createPasswordResetToken()
    /// here in validateBeforeSave we make it false beacuse the method is save() 
    /// so it's like you create a new user so many validation errors will appear like passwordConfirm (for example)
    await user.save({validateBeforeSave: false})
// 3) send it back to user's email
const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
const message = `Forgot your password? Submit a PATCH request with your new password and 
passwordConfirm to: ${resetURL}.\nIf you didn't forgot your password, please ignore this email!`
try{
    await sendEmail({
        email: user.email,
        subject: 'your password reset token (valid for 10 minutes)',
        message
    })
    res.status(200).json({
        status: 'success',
        message: 'token sent to email!'
    })
} catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave: false});

    return next(new AppError('There was an error sending the email, Try again later!') ,500)
}
})

exports.resetPassword =catchAsync(async  (req, res,next)=> {
// 1) get user based on the token
const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

const user = await User.findOne({passwordResetToken: hashedToken,passwordResetExpires:{$gt:Date.now()}})
// 2)if token has not expired , and there is user , set the new password
if(!user){
     return next(new AppError('Token is invalid or has expired',400) )
}
user.password = req.body.password
user.passwordConfirm = req.body.passwordConfirm
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save();

// 3) Update changedPasswordAt property for the user  

// 4) log the user in, send JWT
createSendToken(user,200,req,res)

})

exports.updatePassword = catchAsync(async (req,res,next) => {
    /// 1) Get user from collection 
    const user = await User.findById(req.user.id).select('+password');
    /// 2) Check if POSTed current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError('Your current password is incorrect.',401))
    }
    /// 3) If so, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    /// 4) Log user in, send JWT
    createSendToken(user,200,req,res)
})