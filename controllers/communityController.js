const Community = require("../models/Community")
const assert = require("assert");
const Definer = require("../lib/mistake");
const {cat} = require("require/example/shared/dependency");
const communityController = module.exports;


// database va mongoose bn aloqada bo'lgani uchun async shakilda orderControllerda  getMyOrders methodini yaratyabman
communityController.imageInsertion = async (req, res) => {   // define qismida req va res path qilyabman
    try {
        console.log("POST:   cont/imageInsertion");
        assert.ok(req.file, Definer.general_err3);
        // bu yerda keladigan req.file ni ichidagi path  qilingan elementi orqali image_url ni olyabman
        const image_url = req.file.path;
        res.json({state: "success", data: image_url});
    } catch (err) {
        console.log(`ERROR, cont/imageInsertion, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
};


// database va mongoose bn aloqada bo'lgani uchun async shakilda orderControllerda  createArticle methodini yaratyabman
communityController.createArticle = async (req, res) => {   // define qismida req va res path qilyabman
    try {
        console.log("POST:   cont/createArticle");

        // community service model dan instance olib community objectini yaratib oldim
        const community = new Community();

        // yaratgan community objectini createArticleData methodini chaqirib olyabman unga req.member va bodyni path qilib
        const result = await community.createArticleData(req.member, req.body); // natijani resultga tenglayabman

        assert.ok(req.member, Definer.general_err1);
        res.json({state: "success", data: result});
    } catch (err) {
        console.log(`ERROR, cont/createArticle, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
};

// database va mongoose bn aloqada bo'lgani uchun async shakilda orderControllerda  getMemberArticles methodini yaratyabman
communityController.getMemberArticles = async (req, res) => {
    try {
        console.log("GET: cont/getMemberArticles");

        // community service model dan instance olib community objectini yaratib oldim
        const community = new Community();

        // ( API get bolgani uchun url orqali ( birovni id isi)  mb_id isini query ini ichidan retreiv qilib olyabman va mb_id ga tenglayabman )
        // agar queryni ichida member_id none ga teng bolmasa  req.query.mb_id ini ol deyabman,
        const mb_id = req.query.mb_id !== "none" ? req.query.mb_id : req.member._id;  // agar none ga teng bolsa authenticeted bolgan user ni idi sini olyabman
        // va mb_id ga tenglashtiryabman
        assert.ok(mb_id, Definer.article_err1);

        // community object ini ichida getMemberArticlesData methodini chaqirib olyabman
        const result = await community.getMemberArticlesData( // 3 ta qiymatni path qilyabman va natijani result ga tenglayabman
            req.member, // login bolgan member
            mb_id, // kimning ma'lumotlarini request qilyotgani
            req.query // query qismida pagination ga bog'liq ma'lumotlar mn: page,  rasm lar tog'risida
        );

        res.json({state: "success", data: result});
    } catch (err) {
        console.log(`ERROR, cont/getMemberArticles, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
}
