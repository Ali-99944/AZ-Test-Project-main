const express = require('express')
const usersControllers = require('../controllers/usersController')
const productControllers = require('../controllers/productsController')
const authController = require('../controllers/authController')



const router = express.Router();

 //// here we use post method to signup because we don't need to get or update the of a new user 
router.post('/signup',authController.signup);
router.post('/login',authController.login);

router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);

/// this middleware will work with all the code below not with the code above
router.use(authController.protect)

router.patch('/updateMyPassword',authController.updatePassword)
router.get('/me',usersControllers.getMe,usersControllers.getUser)
router.patch('/updateMe',usersControllers.uploadUserPhoto,usersControllers.resizeUserPhoto,usersControllers.updateMe)
router.delete('/deleteMe',usersControllers.deleteMe)

/// this middleware will work with all the code below not with the code above
router.use(authController.restrictTo('admin manager'))
router
.route('/')
.get(usersControllers.getAllUsers)
.post(usersControllers.createUser)

router
.route('/:id')
.get(usersControllers.getUser)
.patch(usersControllers.updateUser)
.delete(usersControllers.deleteUser)

module.exports = router;