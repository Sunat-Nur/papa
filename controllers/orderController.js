const Order = require("../models/Order");
const assert = require("assert");
const Definer = require("../lib/mistake");

const orderController = module.exports;


// orderControllerda async shakilda createOrder methodini yaratyabman
orderController.createOrder = async (req, res) => {
    try {
        console.log("POST: cont/createOrder")
        assert.ok(req.member, Definer.auth_err5);

        const order = new Order(); // order_service modelda instance olib order object yartib oldim

        // order_schema modelda createOrderDate methodini yaratib unga 2 ta argument
        const result = await order.createOrderDate(req.member, req.body) // (req.member va data ) ni path qilyabman va qiymatni resultga tenglayabman


        res.json({state: "success", data: result})

    } catch (err) {
        console.log(`ERROR, cont/createOrder, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
}
