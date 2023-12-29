const mongoose = require("mongoose");

exports.member_type_enums = ["USER", "ADMIN", "PEDAL", "RESTAURANT"];
exports.member_status_enums = ["ONPAUSE", "ACTIVE", "DELETED"];
exports.ordenary_enums = ["Y", "N"];

exports.product_collection_enums = ["dish", "salad", "dessert", "drink", "etc"];
exports.product_status_enums = ["PAUSED", "PROCESS", "DELETED"];
exports.product_size_enums = ["small", "large", "normal", "set"];
exports.product_volume_enums = [0.5, 1, 1.2, 1.5, 2];

exports.order_status_enums = ["PAUSED", "PROCESS", "FINISHED", "DELETED"];

exports.like_view_group_list = ['product', 'member', 'community'];
exports.board_id_enum_list = ['celebrity', 'evaluation', 'story'];
exports.board_article_status_enum_list = ["active", "deleted"];

/*****************************************
 *   MONGODB RELATED COMMANDS            *
 *****************************************/

exports.shapeIntoMongooseObjectId = (target) => {
    if (typeof target === 'string') {
        return new mongoose.Types.ObjectId(target);
    } else return target;
};

// keladigan ma'lumotni (follow_id ni) mb_id deb path qilyabman
exports.lookup_auth_member_following = (mb_id, origin) => {
    // agar origin follows ga teng bolsa unda follow_id ni $subscriber_id shu nom bilan hosil qil deyabman
    const follow_id = origin === "follows" ? "$subscriber_id" : "$_id"; // agar aksincha bolsa _id shu nom bilan hosil qil
    return {
        $lookup: {
            from: "follows", // agar authenticate bolgan user mavjud bolsa va o'zing follower larini request qilyotgan bolsa
            let: { // bu yerda veriablar kirityabman
                // kiritgan varibla ni subscriber_id ga tenglab olyabman
                lc_follow_id: follow_id,
                lc_subscriber_id: mb_id,  // lc_subscriber_id ni mb_id ga tenglayabman
                nw_my_following: true, // check qilish maqsadida bu varibelni kirityabman
            },
            pipeline: [ // pipeline sintaxsizda foydalanyabman u array ni qabul qiladi
                {
                    $match: {  // match ni ichiga
                        $expr: { // maxsus sintaksiz kirityabman
                            $and: [ // uni ichiga maxsus array kirityabman. // biz hosil qilgan variable follows ni ichdagi id ga equal bo'lishi kerak
                                {$eq: ['$follow_id', '$$lc_follow_id']}, // biz hosil ganga ga 2 ta $ belgisini qo'yabmiz
                                {$eq: ['$subscriber_id', '$$lc_subscriber_id']}, // biz hosil ganga ga 2 ta $ belgisini qo'yabmiz
                            ]
                        },
                    },
                },
                { // natijani projection qilib olyabman
                    $project: {
                        _id: 0,
                        subscriber_id: 1,
                        follow_id: 1,
                        my_following: "$$nw_my_following" // local variable bolgani uchun 2 ta $$ belgini qo'yabman
                    },
                },
            ],
            as: "me_followed",
        },
    };
};

exports.lookup_auth_member_liked = (mb_id) => {
    return {
        $lookup: {
            from: "likes",
            let: {
                lc_liken_item_id: "$_id", // member id
                lc_mb_id: mb_id,
                nw_my_favorite: true,
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {$eq: ["$like_ref_id", "$$lc_liken_item_id"]},
                                {$eq: ["$mb_id", "$$lc_mb_id"]},
                            ],
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        mb_id: 1,
                        like_ref_id: 1,
                        my_favorite: "$$nw_my_favorite",
                    },
                },
            ],
            as: "me_liked",
        },
    };
};


