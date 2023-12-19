const LikeModel = require("../schema/like.model");
const MemberModel = require("../schema/member.model");
const ProductModel = require("../schema/product.model");
const BoArticleModel = require("../schema/bo_article.model");


class Like {
    constructor(mb_id) {
        this.likeModel = LikeModel;  // bular schema model hisoblanadi
        this.memberModel = MemberModel; // bular schema model hisoblanadi
        this.productModel = ProductModel; // bular schema model hisoblanadi
        this.boArticleModel = BoArticleModel;  // bular schema model hisoblanadi
        this.mb_id = mb_id;
    }

    // schema_model va database bn ishlagani ucun async korinishida validateTargetItem methodini yaratib olyabman va
    async validateTargetItem(like_ref_id, group_type) { //unga id va group_type qiymatlarini path qilyabman
        try {
            console.log("validateTargetItem is working");

            let result; // result objectini yaratib olyabmna
            switch (group_type) {
                case "member":
                    result = await this.memberModel // member_schema_modelni findOne static object ini chaqirib olyabman
                        .findOne({
                            _id: like_ref_id,
                            mb_status: "ACTIVE"
                        }) // id va mb_statusni find qilib olib natijani result objectiga tenglayabman
                        .exec();
                    break;
                case "product":
                    result = await this.productModel // product_schema_modelni findOne static object ini chaqirib olyabman
                        .findOne({
                            _id: like_ref_id,
                            product_status: "PROCESS"
                        }) // id va product_statusni find qilib olib natijani result objectiga tenglayabman
                        .exec();
                    break;
                case "community":
                    result = await this.boArticleModel // borarticle_sche_modelni findOne static object ini chaqirib olyabman
                        .findOne({
                            _id: like_ref_id,
                            art_status: "active"
                        }) // id va art_statusni find qilib olib natijani result objectiga tenglayabman
                        .exec();
                    break;
            }
            console.log("Result from the database:", result);

            return !!result; // true va falesni qiymatini qaytaradigan syntax, result objectni qiymatini tekshiradi.
        } catch (err) {
            throw err;
        }
    };


    // schema_model va database bn ishlagani ucun async korinishida checkLikeExistence methodini yaratib olyabman va
    async checkLikeExistence(like_ref_id) { // unga like_ref_id ni path qilyabman
        try {    // like_schema modelni findOne static object ini chaqirib olyabman mb_id: ni shu yerga kiritga mb_id ga tenglab olyabman va like_ref_id ni ham
            const like = await this.likeModel.findOne({
                mb_id: this.mb_id,
                like_ref_id: like_ref_id
            })
                .exec();
            return !!like; // true va falesni qiymatini qaytaradigan syntax, result objectni qiymatini tekshiradi.
        } catch (err) {
            throw err;
        }
    };


    async removeMemberLike(like_ref_id, group_type) {
        try {
            const result = await this.likeModel.findOneAndDelete({
                like_ref_id: like_ref_id,
                mb_id: this.mb_id
            })
                .exec();
            await this.modifyItemLikeCounts(like_ref_id, group_type, -1);
            return result;
        } catch (err) {
            throw err;
        }
    };

    async insertMemberLike(like_ref_id, group_type) {
        try {   // like_schema_model dan instance olib new_like objectini hosil qilyabman argument sifatida mb_id, l_ref_id va like_group ni path qilyabman
            const new_like = new this.likeModel({
                mb_id: this.mb_id,
                like_ref_id: like_ref_id,
                like_group: group_type,
            });
            const result = await new_like.save(); // new_like object ini save static object ini chaqirib olyabman va natijani result ga tenglayabman
            await this.modifyItemLikeCounts(like_ref_id, group_type, 1);
            return result;
        } catch (err) {
            throw new Error(Definer.mongo_validation_err1);
        }
    };

    async modifyItemLikeCounts(like_ref_id, group_type, modifier) {
        try {
            switch (group_type) {
                case "member":
                    await this.memberModel // member_schema_modelni findOne static object ini chaqirib olyabman
                        // this.member_schema modelidan findByIdAndUpdate metodi dan foydalanyabmn
                        .findByIdAndUpdate({_id: like_ref_id}, {$inc: {mb_likes: modifier}})// views qiymatini bittaga ko'paytirib boradi
                        .exec();
                    break;
                case "product":
                    await this.productModel // product_schema_modelni findOne static object ini chaqirib olyabman
                        .findByIdAndUpdate({_id: like_ref_id}, {$inc: {product_likes: modifier}})// views qiymatini bittaga ko'paytirib boradi
                        .exec();
                    break;
                case "community":
                default:
                    await this.boArticleModel // borarticle_sche_modelni findOne static object ini chaqirib olyabman
                        .findByIdAndUpdate({_id: like_ref_id}, {$inc: {art_likes: modifier}})// views qiymatini bittaga ko'paytirib boradi
                        .exec();
                    break;
            }
            return true;
        } catch (err) {
            throw err;
        }
    };
};

module.exports = Like;