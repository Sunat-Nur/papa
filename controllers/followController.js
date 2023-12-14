const Definer = require("../lib/mistake");
const jwt = require("jsonwebtoken");
const Follow = require("../models/Follow");
const assert = require("assert");
const followController = module.exports;


// database va mongoose bn aloqada bo'lgani uchun async shakilda followController  subscribe methodini yaratyabman
followController.subscribe = async (req, res) => {
    try {
        console.log("GET cont/subscribe");
        assert.ok(req.member, Definer.auth_err5);

        const follow = new Follow(); // follow_service modeldan instance olib follow objectini hosil qilib oldik

        // follow objectini subscribeData methodini chaqirib olyabman unga req.member va req.body ni qiymatlarini path qilyabman
        const result = await follow.subscribeData(req.member, req.body);  // req.body qismida subscriber ni ma'lumotlarini path qilyabman (kimga subscribe bo'lgani)
        res.json({state: "success", data: result});

    } catch (err) {
        console.log(`ERROR, cont/subscribe, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
};


// database va mongoose bn aloqada bo'lgani uchun async shakilda followController  unsubscribe methodini yaratyabman
followController.unsubscribe = async (req, res) => {
    try {
        console.log("GET cont/unsubscribe");
        assert.ok(req.member, Definer.auth_err5);

        const follow = new Follow(); // follow_service modeldan instance olib follow objectini hosil qilib oldik

        // follow objectini unsubscribeData methodini chaqirib olyabman unga req.member va req.body ni qiymatlarini path qilyabman va natijani resultga tenglayman
        const result = await follow.unsubscribeData(req.member, req.body);  // req.body qismida subscriber ni ma'lumotlarini path qilyabman (kimga subscribe bo'lgani)
        res.json({state: "success", data: result});

    } catch (err) {
        console.log(`ERROR, cont/subscribe, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
};

followController.getMemberFollowings = async (req, res) => {
    try {
        console.log("GET cont/getMemberFollowings");
        const follow = new Follow(); // follow_service modeldan instance olib follow objectini hosil qilib oldik

        // yaratgan follow object ini getMemberFollowingData methodini chaqirib olyabman va unga query ni path qilib natijani resultga tenglayabman
        const result = await follow.getMemberFollowingData(req.query);

        res.json({state: "success", data: result});
    } catch (err) {
        console.log(`ERROR, cont/getMemberFollowings, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
}