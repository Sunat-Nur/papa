const mongoose = require("mongoose");
const {like_view_group_list, board_id_enum_list} = require("../lib/config"); // enum qiymatlarni chaqiryabmiz config file dan
const Schema = mongoose.Schema; // mongoose dan olinadigan schema ni ishlatyabmiz


const likeSchema = new mongoose.Schema(
    {
        mb_id: {type: Schema.Types.ObjectId, required: true},
        like_ref_id: {type: Schema.Types.ObjectId, required: true},
        like_group: {
            type: String,
            required: true,
            enum: {
                values: like_view_group_list
            },
        },
        bo_id: {  // bo_id faqat community ga tegishli
            type: String, // bo_id typeni kirityabmiz
            required: false,
            enum: {       // enum qiymatlarni kirityabmiz
                values: board_id_enum_list
            }
        },
    },
    {timetamps: {createdAt: true}}
);

module.exports = mongoose.model("like", likeSchema);
// mongoosedan model metodini chaqirib olib uning ichiga likeSchemani argument sifatida path qilybmiz