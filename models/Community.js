const BoArticleModel = require("../schema/bo_article.model");
const Definer = require("../lib/mistake");
const assert = require("assert");
const {shapeIntoMongooseObjectId} = require("../lib/config");

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

            return await  article.save(); // yaratgan article object ni save qilib return qilyabman
        } catch (err) {
            console.log(err);
            throw new Error(Definer.auth_err1);
        }
    }
}

module.exports = Community;