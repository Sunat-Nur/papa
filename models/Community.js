const BoArticleModel = require("../schema/bo_article.model");
const Definer = require("../lib/mistake");
const assert = require("assert");
const {shapeIntoMongooseObjectId} = require("../lib/config");
const {cat} = require("require/example/shared/dependency");

class Community {
    constructor() {
        this.boArticleModel = BoArticleModel;
    }

    // database va schema_model bn ishlayotgani uchun async ko'rishida createArticleData methodini yaratib oldim
    async createArticleData(member, data) { // va unda member, data ni path qilyabman ( authen, hamda body qismidagi data kelyabdi)
        try {
            console.log(" createArticleData is working")
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
            throw new Error(Definer.auth_err1);
        }
    };


    // database va schema_model bn ishlayotgani uchun async ko'rishida saveArticleData methodini yaratib oldim
    async getMemberArticlesData(member, mb_id, inquery) { // unga 3 parametrni path qilyabman
        try {
            const auth_mb_id = shapeIntoMongooseObjectId(member?._id); // agar member mavjud bolsa uni idisini olib shaping qil deyabman
            mb_id = shapeIntoMongooseObjectId(mb_id); // keladigan mb_id ini mb_id iga tenglashtiryabman
            // inquery ini ichida page mavjud bolsa olaman va ushani ichida songa aylantirib olaman, va inquery ni ichiga page qilib yuboraman
            const page = inquery["page"] ? inquery["page"] * 1 : 1;
            const limit = inquery["limit"] ? inquery["limit"] * 1 : 5;

            // boArticle_schema_Model aggregate ni ishlatyabman va chiqan natijani resultga tenglayabman
            const result = await this.boArticleModel
                .aggregate([{
                    $match: {mb_id: mb_id, art_status: "active"}},
                    {$sort: {createdAt: -1 }},
                    {$skip: (page -1) * limit }, // boshlang'ich page dan yuqorini deyabman
                    {$limit : limit},
                    {
                        $lookup: {
                            from: "members",
                            localField: "mb_id",  // yuqoridagi qiymatdan izla deyabman
                            foreignField: "_id", // members collection ni ichidan qaysi dataset ga tenglash tirishni ko'rsatyabman
                            as: "member_data", // qandey nom bn save qilishni eytyabman
                        }
                    }
                ])
            .exec();
            assert.ok(mb_id, Definer.article_err1);
            return result;
        } catch (err) {
            throw err;
        }
    };

}

module.exports = Community;