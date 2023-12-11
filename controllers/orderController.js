const Order = require("../models/Order");
const assert = require("assert");
const Definer = require("../lib/mistake");
const jwt = require('jsonwebtoken');
const orderController = module.exports;


// orderControllerda database va mongoose bn aloqada bo'lgani uchun async shakilda createOrder methodini yaratyabman
orderController.createOrder = async (req, res) => {
    try {
        console.log("POST: cont/createOrder")
        assert.ok(req.member, Definer.auth_err5);

        const order = new Order(); // order_service modelda instance olib order object yartib oldim

        // order object ini  createOrderDate methodini chaqirib  unga 2 ta argument path qilyabman va natijani resultga tenglayabman
        const result = await order.createOrderDate(req.member, req.body) // (req.member va data ) ni path qilyabman va qiymatni resultga tenglayabman
        res.json({state: "success", data: result})
    } catch (err) {
        console.log(`ERROR, cont/createOrder, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
};

// database va mongoose bn aloqada bo'lgani uchun async shakilda orderControllerda  getMyOrders methodini yaratyabman
orderController.getMyOrders = async (req, res) => {  // faqat authenticated bolgan userlar uchun     // defination qismi
    try {
        console.log("POST: cont/getMyOrders");
        assert.ok(req.member, Definer.auth_err5);

        const order = new Order(); // order_service model dan instan olib order objectini hosil qilyabman

        // order object ini  getMyorderdatas methodini chaqirib  unga 2 ta argument path qilyabman va natijani resultga tenglayabman
        const result = await order.getMyOrdersData(req.member, req.query);  // req.member -- authenticated member

        res.json({state: "success", data: result})
    } catch (err) {
        console.log(`ERROR, cont/getMyOrders, ${err.message}`);

        res.json({state: "fail", message: err.message});
    }
};

// database va mongoose bn aloqada bo'lgani uchun async shakilda orderControllerda  getMyOrders methodini yaratyabman


orderController.editChosenOrder = async (req, res) => {
    try {
        console.log("POST: cont/editChosenOrder");
        assert.ok(req.member, Definer.auth_err5);

        const order = new Order(); // order_service model dan instan olib order objectini hosil qilyabman

        // order object ini  editChosenOrderData methodini chaqirib  unga 2 ta argument path qilyabman va natijani resultga tenglayabman
        const result = await order.editChosenOrderData(req.member, req.body);
        res.json({state: "success", data: result})
    } catch (err) {
        console.log(`ERROR, cont/editChosenOrder, ${err.message}`);
        res.json({state: "fail", message: err.message});

    }
};


