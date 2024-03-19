const mongoose = require('mongoose');
const slugify = require('slugify');
const productSchema = new mongoose.Schema({

    name: { 
        en:{
            type:String,
            required: [true, 'product name required'] ,
            unique:true,
            trim:true,
            maxlenght:[40,'prooduct name max length is 40 characters'],
            minlenght:[3,'product name min length is 3 characters']},
            ar:{
                type:String,
            required: [false, 'ادخل اسم المنتج'] ,
            unique:true,
            trim:true,
            maxlenght:[40,'اسم المنتج يجب ان يحتوي علي  40 حرف او اقل '],
            minlenght:[3,'اسم المنتج يجب ان يحتوي علي حرفين فما فوق']
            }
},    
    price: {
        type:Number,
        required: [true, 'product price required'],   
    },
    description: {
        en:{
                type:String,
                required: [true, 'product description required'],
                trim:true
        },
        ar:{
                type:String,
                required: [true, 'ادخل وصف المنتج'],
                trim:true
            }
        
        },
        quantity:{
            type:Number,
            required: [true,'product quantity required']
        },
     imageCover:{
        type:String,
        // required: [true, 'product imageCover required']
     },

     images:[String],

     createdAt:{
        type:Date,
        default: Date.now,
        select:false,
    },
     color:{
        en:{
            type:String
     },
     ar:{
        type:String
     }
    },
    /// example Earbuds, mobileCase, backbag, mobile , Tablet etc
     model:{
        en:{
            type:String
        },
        ar:{
            type:String
        }
    },
    // iphone 14promax case, S20 earbuds, S22Ultra etc
     subModel:{
        en:{
            type:String
        },
        ar:{
            type:String
        }
    },
    ////// like sonata 2014/ toyota 2015
    modelYear :{
        type:String
    },
    /// CaseMe , Senlan, Samsung
     brand:{
            type:String
     },
    rating: {
        type:Number,
         default:4.5,
         min:[1,'rating must be above 1.0'],
         max:[5,'rating must be below 5.0'],
    },
         secretProduct:{
            type:Boolean,
            default:false
         },
         category:{type:mongoose.Schema.Types.ObjectId,
            ref:'Category',
        required:true},
            subCategory:{type:mongoose.Schema.Types.ObjectId,
                ref:'SubCategory',
            required:true},
         
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
 })
/// (Virtual properties) this method will change the price to dollars(fo example) 
//// and it virtual so it not saved in the database so it get the price from database and change it
productSchema.virtual('priceToDollar').get(function() {
return this.price / 5
})
/// this virtual property will  bring the reviews of a specific product with out save it in the database with the product
productSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'product',
    localField:'_id'
})
///// MONGOOSE MIDDLEWARES 

//// Document middleware  : runs before .save() and .create()
productSchema.pre('save', function(next){
    this.slug = slugify(this.name.en,{lowercase:true});
    next();
})

// productSchema.pre('save', function(next){
//     console.log('Will save product...')
//     next();
// })

// productSchema.post('save', function(doc,next){
//     console.log(doc)
//     next();
// })


/// QUERY MIDDLEWARE
// productSchema.pre('find', function(next){
productSchema.pre(/^find/, function(next){
this.find({secretProduct:{$ne:true}})

this.start = Date.now();
    next()
})

// productSchema.post(/^find/, function(docs,next){

// console.log(`Query took ${Date.now() - this.start} milliseconds`)

//     next()
// })

const Product = mongoose.model('Product',productSchema) 

module.exports = Product;
