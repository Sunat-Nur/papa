const OrderModel = require("../schema/order.model");
const OrderItemModel = require("../schema/order_item.model")
const mongoose = require("mongoose");
const {shapeIntoMongooseObjectId} = require("../lib/config");
const Definer = require("../lib/mistake");
const assert = require("assert");
const config = require("../lib/config");


class Order {
    constructor() {
        this.orderModel = OrderModel;
        this.OrderItemModel = OrderItemModel;
    }

    // database va schema_model bn ishlayotgani uchun async ko'rishida createOrderDate method yaratib oldim
    async createOrderDate(member, data) {    // viewChosenItemByMember methodiga 2 ta parametrini  member va data ni path qilyabman
        try {   // ikkit o'zgaruvchan qiymatga ega bolgan object yaratib oldim

            let order_total_amount = 0, delivery_cost = 0;
            const mb_id = shapeIntoMongooseObjectId(member._id); // mb ning id si mavjud bolsa uni shape qil deyabman, mongoose o'qiydigan shakilda

            console.log(data);

            // data ma'lumotlarni, har bittasini item bilan qabul qilib loop qilyabman
            data.map(item => {             // asosiy maqsad order_total amount ni hisoblash olish
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

            // database schema_model bilan birga ishlaydigani uchun await method shaklida yaratib oldim va order_id va data ni path qilib oldim
            await this.recordOrderItemsData(order_id, data);   // orderItem ni creat qilish shu yerdan boshlandi


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

    // database va schema_model bn ishlayotgani uchun async ko'rishida recordOrderItemsData method yaratib oldim
    async recordOrderItemsData(order_id, data) {
        try {  // bu method da kirib keladigan data ni har bir elementini maping qilyabman
            // item orqali har birini qiymatini olayabman

            const pro_list = data.map(async (item) => {    // map ni ichida promise larni yasab olib natijasini  pro_list da path qilyabman

                // database bn ishlaydigani uchun await shakilda saveOrderItemsData methodini yaratim va item va order_id ni path qilyabman
                return await this.saveOrderItemsData(item, order_id);
            });

            // data base bn ishladigani uchun await ko'rinishida methodni yaratib parametr pro_list ni path qilyabmiz va natijani resltga tenglayabman
            const results = await Promise.all(pro_list); // Promise.all ma'nosi promise lar tugamaguncha kut degan ma'noni anglatadi
            console.log("results:::", results);

        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida saveOrderItemsData method yaratib oldim
    async saveOrderItemsData(item, order_id) {  // saveOrderItemsData methodiga  2 ta parametrini  item va  order_id ni path qilyabman
        try { // bu yerda saveOrderItemsData method tidan maqsad  itemsData dan keladigan datani databasga save qilish

            order_id = shapeIntoMongooseObjectId(order_id); // keladigan order_id ini shape qilyabman
            item._id = shapeIntoMongooseObjectId(item._id); // item ni ichida keladigan id ini shape qilib qaytib o'ziga yozib olyabman


            // this.orderItem_schema model orqali instance olib order_item object ini yaratib olib uning ichiga
            const order_item = new this.OrderItemModel({ // shape qilingan dan data larni path qilyabman
                item_quantity: item["quantity"],
                item_price: item["price"],
                order_id: order_id,
                product_id: item["_id"],
            });
            // database bn ishlaydigani uchun await shakilda yozyabman
            const result = await order_item.save(); // order_item object ini save methotini ishlatib natijani result ga tenglayabman
            // pastda natijani tekshiryabman
            assert.ok(result, Definer.order_err2); // agar resultda data mavjud bolmasa deyabman
            return "created";  // saveOrderItemsData method ishlaydiganini tekshirish maqsadida

        } catch (err) {
            // mongoose ko'rsatadigan errorlar farq qilganligi sababli ularni custimize qilish maqsadida o'zimiz error larni qayta nomlayabmiz
            console.log(err);
            throw new Error(Definer.order_err2);
        }
    };


    // database va schema_model bn ishlayotgani uchun async ko'rishida getMyOrdersData method yaratib oldim
    async getMyOrdersData(member, query) { // va bu methodga member  va queryni qiymatlarni agument sifatida path qilyabman
        try { // agar mb ning id isi mavjud bolsa mb_id ini qabul qilib shape qilyabman database bn itegratsiya uchun
            const mb_id = shapeIntoMongooseObjectId(member._id);
            let order_status;

            // query object ining ichidan qabul qilib order_statusga tenglab olyabman
            order_status = query.status.toUpperCase();  // to UpperCase maxsus string methodini ishlatyabman maqsad
            // status_enum qiymatlarni kichik harfda query qilib faqat back-end da katta harflarda o'zgartirib olaman
            const matches = {mb_id: mb_id, order_status: order_status}; // aggregation uchun kerak boladigan matches objectga
            // mb_ id va yuqoridagi mb_statuslarni tenglab olyabman

            // schema_model ni ichida aggregate  yaratib oldim
            const result = await this.orderModel
                .aggregate([
                    {$match: matches}, // matche commanda siga metches ni path qilyabmiz matches ini ichida (mb_id va order_status) path qilgadim
                    {$sort: {createdAt: -1}}, // sort commanda ini ishlatishdan maqsad eng oxirgi qo'shilgan orderlardan boshlab olib ber deyabman
                    {
                        $lookup: {   // orders collection dan olingan ma'lumotlar dan foydalanib lookup matig'ini qilyabmn
                            from: "orderitems", // aggregate dan matche commandasi orqali hosil bolgan natijani orderItemsda izla (boshqa bir collection) dan deyabman
                            localField: "_id", // matching orqali hosil bolgan bir lamchi query ni natijasi ya'ni objectni ichidan  id ni olib, foreignField dan izla deyabman
                            foreignField: "order_id", // order_id yuqoridagi _id ga teng bolsin deb qidiryabman
                            as: "order_items", // va natijani order_items nomi bilan save qil deyabman
                        },
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "order_items.product_id",
                            foreignField: "_id",
                            as: "product_data", // va natijani product_data nomi bilan save qil deyabman
                        }
                    }
                ]).exec();
            console.log("result::::", result);
            return result;
        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida getMyOrdersData method yaratib oldim
    async editChosenOrderData(member, data) { // va unda member, data ni path qilyabman ( authen, hamda body qismidagi data kelyabdi)
        try {
            console.log("editChosenOrderData is working");
            let order_id, order_status;
            // memberning_ichida id bolsa uni shape qilib olyabman va mb_id ga tenglayabman
            const mb_id = shapeIntoMongooseObjectId(member._id);

            // datani ichidagi request body ni chidan order_idni olib shape qilib olyabman va order_id ga tenglayabman
            order_id = shapeIntoMongooseObjectId(data.order_id);

            // data ni ichidan order_status ni olib uni upperCase qilib olyabman va order_status ga tenglayabman
            order_status = data.order_status.toUpperCase();

            // order_collection bn maping qiladigan order_schema modelni await ko'rinishida ishga tushurib
            // findOneAndUpdate method ini ishlatyabman (va umumiy qiymatni resultga  tenglayabman)
            const result = await this.orderModel.findOneAndUpdate(  // uning ichida 3 ta object ni kirityabman
                // 1- filtiring
                {mb_id: mb_id, _id: order_id}, // mb_id (user ni idisi)  ni mb_id  ga tenglayabman, id ni order_id ga ten deyabman
                {order_status: order_status}, // order_statusni tenglab olyabman
                {runValidators: true, lean: true, returnDocument: "after"} // returnDoc o'zgargan qiymanlarni yubor deyabman
                // lean database dan document formatda keladigan data ga ma'lumotni qo'shish imkonyatini beradi
            );
            console.log(result);

            assert.ok(result, Definer.order_err2); // agar resultda data mavjud bolmasa deyabman
            return result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Order;
