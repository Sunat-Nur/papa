const mongoose = require("mongoose");

const {             //require qilib olayopmiz.qiymatlarni
    product_collection_enums,
    product_status_enums,
    product_size_enums,
    product_volume_enums,
} = require("../lib/config");

const Schema = mongoose.Schema; //Schemadan  instinsini olayopmiz.

const productSchema = new mongoose.Schema({
        product_name: {
            type: String,
            required: true,
        },

        product_collection: {
            type: String,
            required: true,
            enum: {
                values: product_collection_enums,
                message: "{VALUE} is not among permitted enum values",
            },
        },
        product_status: {
            type: String,
            required: false,  // required kiritmasak ham boladi sababi default berganmiznpm
            default: "PAUSED",
            enum: {
                values: product_status_enums,
                message: "{VALUE} is not among permitted enum values",
            },
        },
        product_price: {
            type: Number,
            required: true,
        },
        product_discount: {
            type: Number,
            required: false,
            default: 0,   // required shart bolmagan ma'lumotlarga default beriladi, user kiritmagan ma'lumotlarni dastur o'zi to'ldirib ketadi
        },
        product_left_cnt: {
            type: Number,
            required: true,
        },
        product_size: {
            type: String,
            default: "normal",
            required: function () {
                const sized_list = ["small", "large", "normal", "set"]; //productlar ruyxati.
                return sized_list.includes(this.product_collection);  //(this) => productSchema
            },
            enum: {
                values: product_size_enums,
                message: "{VALUE} is not among permitted enum values",
            },
            product_collection: () => {

            }
        },
        product_volume: {   //ichimliklarni hajmini kursatish un kerakli method:
            type: String,
            default: 1,
            required: function () {
                return this.product_collection === "drink";  //agarda product_volume (true) bulganda, (product_size) false buladi.
            },
            enum: {
                values: product_volume_enums,
                message: "{VALUE} is not among permitted enum values",
            },
        },
        product_description: {
            type: String,
            required: true,
        },
        product_images: {
            type: Array,    // birnechta rasm quyishimiz mumkin bu qiymatni quyib.
            required: false,
            default: [],
        },
        product_likes: {
            type: Number,
            required: false,
            default: 0,
        },
        product_views: {
            type: Number,
            required: false,
            default: 0,
        },
        restaurant_mb_id: {
            type: Schema.Types.ObjectId, // bu Schemani ichida bz hohlayotgan type bor va bu typening ichidan objectId ol deyman.
            ref: "Member", // referens
            required: false,
        },

    },
    {timestamps: true} // createAT=> malumot hosil qilinganda avtomatik vaqtini quyib beradi.
    //updateAT => oxirgi malumot uzgartirilgan vaqtini quyib beradi
);

productSchema.index(
    {
        restaurant_mb_id: 1,
        product_name: 1,
        product_size: 1,
        product_volume: 1,
    },
    {unique: true}     //compound  unique ucun ishlatiladi
); // index  bu: 1ta restaurant un birxil nomdagi tovarni, bir size va volume bulsa,databasega yozmasin deg.


module.exports = mongoose.model("Product", productSchema);