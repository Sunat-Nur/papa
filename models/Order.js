const OrderModel = require("../schema/order.model");
// const OrderItemModel = require("../schema/order_item_model");
const mongoose = require("mongoose");
const {shapeIntoMongooseObjectId} = require("../lib/config");
const Definer = require("../lib/mistake");

class Order {
    constructor() {
        this.orderModel = OrderModel;
        // this.OrderItemModel = OrderItemModel;
    }

    // database va schema_model bn ishlayotgani uchun async ko'rishida createOrderDate method yaratib oldim
    async createOrderDate(member, data) {    // viewChosenItemByMember methodiga 2 ta parametrini  member va data ni path qilyabman
        try {
            const order_total_amount = 0;  // ikkit o'zgaruvchan qiymatga ega bolgan object yaratib oldim
            const delivery_cost = 0;
            const mb_id = shapeIntoMongooseObjectId(member._id); // mb ning id si mavjud bolsa uni shape qil deyabman, mongoose o'qiydigan shakilda

            // data ma'lumotlarni, har bittasini item bilan qabul qilib loop qilyabman
            data.map((item) => {             // asosiy maqsad order_total amount ni hisoblash olish
                order_total_amount += item ["quantity"] * item ["price"];
            });

            // bu yerda total cost 100 dan kam bolsa delivery cost ni belgilayabman agar ko'p bolsa delivery free qoyabman
            if (order_total_amount < 100) {
                delivery_cost = 2;
                order_total_amount += delivery_cost;
            }

            // saveOrderData methodini yaratib olyabman
            const order_id = await this.saveOrderData( // 3 xil argument qiymat kiritib unlarni  order_id ga tenglayabman
                order_total_amount,
                delivery_cost,
                mb_id
            );
            console.log("order_id:::::", order_id);

            //todo order items creation
            return order_id;
        } catch (err) {
            throw err;
        }
    };


    // database va schema_model bn ishlayotgani uchun async ko'rishida saveOrderData method yaratib oldim
    async saveOrderData(order_total_amount, delivery_cost, mb_id) { // saveOrderData methodiga  3 ta parametrini  amount, cost va id ni path qilyabman
        try {
            // xop bu yerda this.order_schema modeldan instance olib new_order object ini hosil qilib olyabman.
            const new_order = new this.orderModel({ // this order_schema modelda order amount, cost va id larni tenglashtirib natijaji new_order objectga path qilyabman
                order_total_amount: order_total_amount,
                order_delivery_cost: delivery_cost,
                mb_id: mb_id,
            });

            const result = await new_order.save(); // new_order objectinig save methodi yaratib natinijani resultga tenlayabman
            assert.ok(result, Definer.order_err1);

            return result._id;
        } catch (err) {
            // mongoose ko'rsatadigan errorlar farq qilganligi sababli ularni cutimize qilish maqsadida o'zimiz error larni qayta nomlayabmiz
            console.log(err);
            throw new Error(Definer.order_err1);
        }
    };
}

module.exports = Order;
