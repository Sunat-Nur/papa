const Community = require("../models/Community")
const assert = require("assert");
const Definer = require("../lib/mistake");
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
