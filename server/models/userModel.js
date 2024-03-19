const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum:['user', 'admin','manager'],
        default: 'user'
      },
    name: {
        type: String,
        required: [true, 'User name is required']
    },
    photo: {type:String,
    default: 'default.jpg'
    },
    email: {
        type: String,
        required: [true, 'User email is required'],
        unique: true,
        lowercase: true,
        validate:[validator.isEmail, 'Please enter a valid email']
    },
    
    password: {
        type: String, 
        required:[true,'Please enter your password'],
        minlength: 8,
        select:false
    },
    passwordConfirm: {
        type:String ,
         required:[true,'Please enter your password again'],
         validate:{
            /// this will work only on create and save user not on find user and update
            validator: function(el){
                return el === this.password
            },
            message:"passowrds are not the same"
         }
        },
        passwordChangedAt:Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active:{
            type:Boolean,
            default:true,
            select:false,
        },
        addresses:{
            type:{
                type:[String],
                default:'Point',
                enum:['Point']
            }
        }
})

userSchema.pre('save', async function(next) {
    // only run this function if password was actually modified
    if(!this.isModified('password')) return next();
// hash the password with cost of 12 
    this.password = await bcrypt.hash(this.password, 12);
    /// delete the passwordConfirm field from the DB
    this.passwordConfirm = undefined ;
    next();
})
userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre(/^find/,function(next){
/// this point to the current query
this.find({active: {$ne:false}})
next();
} )



//// userSchema methods that we create
userSchema.methods.correctPassword = async function(candidatePassword,userPassword) {
    return await bcrypt.compare(candidatePassword , userPassword) 
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp;
    }
    /// FALSE means not changed
    return false;
}
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    

   
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000
   
   return resetToken;
}




const User = mongoose.model('User',userSchema) 

module.exports = User;