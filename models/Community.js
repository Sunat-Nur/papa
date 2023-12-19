const BoArticleModel = require("../schema/bo_article.model");
const Definer = require("../lib/mistake");
const assert = require("assert");
const {shapeIntoMongooseObjectId, board_id_enum_list, lookup_auth_member_liked} = require("../lib/config");
const Member = require("./Member");

class Community {
    constructor() {
        this.boArticleModel = BoArticleModel;
    }

    // database va schema_model bn ishlayotgani uchun async ko'rishida createArticleData methodini yaratib oldim
    async createArticleData(member, data) { // va unda member, data ni path qilyabman ( authen, hamda body qismidagi data kelyabdi)
        try {
            // data ni ichida mb_id kelmaganligi ucun ( data = request.body) data ni ichida mb_id yaratib olyabman
            data.mb_id = shapeIntoMongooseObjectId(member._id); // (login bolgan) memberni id isini olib shaping qilyabman

            // saveArticleData methodiga data ni path qilyabman va natijani new_article objectiga tenglayabman
            const new_article = await this.saveArticleData(data);
            console.log("new_article::::::", new_article);
            return new_article; // new_article object ni return qilyabman

        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida saveArticleData methodini yaratib oldim
    async saveArticleData(data) { // faqat data ni path bilyabman
        try {
            console.log(" saveArticleData is working")
            // boArticle_schema_Model ga data ni path qilib save qilyabman va natijani article object ga tenglayabman
            const article = new this.boArticleModel(data);

            return await article.save(); // yaratgan article object ni save qilib return qilyabman
        } catch (err) {
            console.log(err);
            throw new Error(Definer.mongo_validation_err1);
        }
    };


    // database va schema_model bn ishlayotgani uchun async ko'rishida saveArticleData methodini yaratib oldim
    async getMemberArticlesData(member, mb_id, inquiry) { // unga 3 parametrni path qilyabman
        try {
            const auth_mb_id = shapeIntoMongooseObjectId(member?._id); // agar member mavjud bolsa uni idisini olib shaping qil deyabman
            mb_id = shapeIntoMongooseObjectId(mb_id); // keladigan mb_id ini mb_id iga tenglashtiryabman
            // inquiry ini ichida page mavjud bolsa olaman va ushani ichida songa aylantirib olaman, va inquiry ni ichiga page qilib yuboraman
            const page = inquiry["page"] ? inquiry["page"] * 1 : 1;
            const limit = inquiry["limit"] ? inquiry["limit"] * 1 : 5;

            // boArticle_schema_Model aggregate ni ishlatyabman va chiqan natijani resultga tenglayabman
            const result = await this.boArticleModel
                .aggregate([{
                    $match: {mb_id: mb_id, art_status: "active"}
                },
                    {$sort: {createdAt: -1}},
                    {$skip: (page - 1) * limit}, // boshlang'ich page dan yuqorini deyabman
                    {$limit: limit},
                    {
                        $lookup: {
                            from: "members",  // members collection ni ichidan qaysi dataset ga tenglash tirishni ko'rsatyabman
                            localField: "mb_id",  // yuqoridagi qiymatdan izla deyabman
                            foreignField: "_id",
                            as: "member_data", // qandey nom bn save qilishni eytyabman
                        },
                    },
                    {$unwind: "$member_data"}, //olingan array ko'rinishidagi datani object ko'rinishiga o'zgartirib beradi
                    lookup_auth_member_liked(auth_mb_id),
                ])
                .exec();
            assert.ok(mb_id, Definer.article_err1);
            return result;
        } catch (err) {
            throw err;
        }
    };


    // database va schema_model bn ishlayotgani uchun async ko'rishida saveArticleData methodini yaratib oldim
    async getArticlesData(member, inquiry) { // unga parametrni path qilyabman. ( inquiry dan bo_id, page va limit kelishi kerak)
        try {
            // member ninng ichidagi id dan shaping qilib olyabman
            const auth_mb_id = shapeIntoMongooseObjectId(member?._id); // agar member mavjud bolsa uni idisini olib shaping qil deyabman

            // matches object ini yaratib olyabman, inquerini ichidagi bo_id qiymatini check qilib olyabman
            let matches = inquiry.bo_id === "all"  // agar inquiry ni ichidagi bo_id all ga teng bolsa

                // bo_id enum dagi array qiymatlari dan biriga teng bolsin va art_status faqat active bolganlarnini retriew qib bersin
                ? {bo_id: {$in: board_id_enum_list}, art_status: "active"}

                // agar bo_id all ga teng bolmasa, inquiry ni bo_id isiga teng bolsin albatda art_status faqat active bolganlarnini retriew qib bersin
                : {bo_id: inquiry.bo_id, art_status: "active"};

            inqury.limit *= 1; // kirib kelyotgan inquiry.limit ni songa aylantirib olyabman
            inquiry.page *= 1;// kirib kelyotgan inquiry.page ni ham songa aylantirib olyabman

            // sort object ini yaratib oldim
            const sort = inquiry.order  // inquiry ni ichida order mavjud bolsa
                ? {[`${inquiry.order}`]: -1} // super string bn inquiry.order ni element sifatida olsin
                : {createdAt: -1}; // agar mavjud bolmasa eng oxirgi hosil qilganlardan boshlab olib bersin deyabman

            // bo_article schema model dan aggregation qilyabman va chiqan natijani resultga tenglayabman
            const result = await this.boArticleModel
                .aggregate([ // va aggregation ni ichida arrayni ishlatyabman
                    {$match: matches},  // birinchi aggregation ni match ini ishlatib match object ini path qilyabman
                    {$sort: sort}, // sort ga ham hosil qilingan sort object ini path qilyabman
                    {$skip: (inquiry.page - 1) * inquiry.limit},  //son qilib olingan inquiry ni ichidagi pageni -1 qilib limitaion ga ko'paytirib olyaban
                    {$limit: inquiry.limit}, // limitni inquiryni ichidagi limit objectiga path qilyabman
                    {
                        $lookup: {
                            from: "members",  // members collection ni ichidan qaysi dataset ga tenglash tirishni ko'rsatyabman
                            localField: "mb_id",  // yuqoridagi qiymatdan izla deyabman
                            foreignField: "_id",
                            as: "member_data", // qandey nom bn save qilishni eytyabman
                        },
                    },
                    {$unwind: "$member_data"}, //olingan array ko'rinishidagi datani object ko'rinishiga o'zgartirib beradi
                    lookup_auth_member_liked(auth_mb_id),
                ])
                .exec();

            console.log("result::::", result);
            assert.ok(auth_mb_id, Definer.article_err3);

            return result;
        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida saveArticleData methodini yaratib oldim
    async getChosenArticleData(member, art_id) { // unga 2 parametrni path qilyabman.
        try {
            art_id = shapeIntoMongooseObjectId(art_id);

            // todo: increase art_views when usen has not seen before
            if(member) { // agar member mavjud bolsa ya'ni oldin ko'rilga bolsa // agar member login bo'lgan member bolsa
                const member_obj = new Member(); // member_service modeldan inctanse olib member_obj objectini hosil qilib olyabman
                // member_obj objectini  viewChosenItemByMember methodini chaqirib olyabman va 3 ta qiymatni path qilib umumiy natijani resultga tenglayabman
                const result = await member_obj.viewChosenItemByMember(member, art_id, "community");
            }

            // boArticle_schema modelini findById static methodi orqali
            const result = await this.boArticleModel.findById({
                _id: art_id // id ini art_id qiymatga teng bolgan id ni izla deyabman
            })
                .exec();
            assert.ok(result, Definer.article_err3);
            return result;

        } catch (err) {
            throw err;
        }
    };

}

module.exports = Community;