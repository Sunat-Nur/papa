const assert = require("assert");
const {shapeIntoMongooseObjectId} = require("../lib/config");   // Product Schemani export qilib oldik.
const Definer = require("../lib/mistake");
const ProductModel = require("../schema/product.model");
const Member = require("./Member");  // mem_service modelni pro_service modelni ichida chaqirib olyabmiz


// MANTIQ:
// ProductServiceModel => ProductControllerga xizmat qiladi. C => M (product service model ) => SchemaModel (DATA BASE model);
// SchemaModellar => Product Model Service un xizmat qiladigam model hisoblanadi.
// Service Modellar => Product Controller un xizmat qiladigan model hisoblandai.

class Product {
    constructor() {
        this.productModel = ProductModel;  // bydefaul ProductModel classni hosil qilib (ProductModel)ga tenglashtirayopti.
    }

    async getAllProductsData(member, data) {
        try {
            const auth_mb_id = shapeIntoMongooseObjectId(member?._id);

            let match = {product_status: "PROCESS"};
            if (data.restaurant_mb_id) {
                match["restaurant_mb_id"] = shapeIntoMongooseObjectId(
                    data.restaurant_mb_id
                );
                match["product_collection"] = data.product_collection;
            }

            const sort =
                data.order === "product_price"
                    ? {[data.order]: 1}
                    : {[data.order]: -1};

            const result = await this.productModel
                .aggregate([
                    {$match: match},
                    {$sort: sort},
                    // {$skip: (data.page * 1 - 1) * data.limit},
                    // {$limit: data.limit * 1},
                ])
                .exec();
            // todo check auth member product click like

            console.log(result);

            assert.ok(result, Definer.general_err1);
            return result;
        } catch (err) {
            throw err;
        }
    };

    // async ishlatgani sababi product.schema model bn ishlagi uchun product.schema esa promise.best object,  mongoose orqali yasalgan va databaseda
    // to'g'ridan to'gri ma'lumot ololmaydi wuning un requst  kutish qilib ma'lumot oladi
    async getChosenProductData(member, id) {  // member - login bo'lgan member ===== id chosen bo'lgan product id isi
        try {
            // kim requst beryotganini va uning auth bolganini tekshiryabdi.
            const auth_mb_id = shapeIntoMongooseObjectId(member?._id);  // va  mavjud bolsa idini ober va shape qilgin mongodb objectga deyabmzi
            // ? belgisi tekshirish ma'noda
            id = shapeIntoMongooseObjectId(id); // id ni ham string shaklda olganimiz uchun shape qilyabmiz
            // va ni database queriyaga ishlata olamiz


            if(member) { // agar loged bo'lgan member mavjud bolsa

                // member_object hosil qil deyabmiz // mem_objectni pro_service model ichida mem_service model ishlatyabmiz, tepada require qilingan
                const member_obj = new Member

                // member.obj ichidagi .viewchosenItemByMember method ini chaqiryabmiz
                member_obj.viewChosenItemByMember(member, id, "product");  // va ichida member, id va type (product) ni provide qilyabmiz
            }

            // bu yerda result ni olib product.schema modeldan foydalanib aggregate qilyabmiz
            const result = await this.productModel
                .aggregate([   //agrigation ga array beriladi
                    { $match: {_id: id, product_status: "PROCESS"}} //faqat statusi process bo'lgan productllarni oldin deyabmiz

                    // TODO: check auth member product likes or not

                ])
                .exec();

            // keladigan datani mavjudligini tekshiryabmiz agar mavjud bo'lmasa error berilyabdi
            assert.ok(result, Definer.general_err1);
            return result;
            // agar mavjud bo'lsa result ni return qil deyabmiz va u getChosenProduct cotrollerga boradi
        } catch (err) {
            throw err;
        }
    };


    async getAllProductsDataResto(member) {
        try {
            member._id = shapeIntoMongooseObjectId(member._id);  // mb_id mongodb objectga teng bolmasa mongodb objectga aylantirib beradi
            const result = await this.productModel.find({
                restaurant_mb_id: member._id // agar res_mb_id tng bolsa member_id shuni resultga olib bersin deyabmiz
            });
            assert.ok(result, Definer.general_err1);
            // console.log("result:", result);
            return result;
        } catch (err) {
            throw err;
        }
    };


    async addNewProductData(data, member) {   // method yasab oldik.
        try {
            data.restaurant_mb_id = shapeIntoMongooseObjectId(member._id); // memberIDni  MONGODB ObjectID aylantirilmoqda member._id ichidan.


            const new_product = new this.productModel(data);  // bu schema model
            const result = await new_product.save();

            assert.ok(result, Definer.product_err1); //data base da restaurant bolmasa error beradi
            return result;
        } catch (err) {
            throw err;
        }
    }


    async updateChosenProductData(id, updated_data, mb_id) {   // method yasab oldik.
        try {
            id = shapeIntoMongooseObjectId(id); // memberIDni  MONGODB ObjectID aylantirilmoqda _id ichidan.
            mb_id = shapeIntoMongooseObjectId(mb_id); // id bu yerda biz olmoqchi bolgan product

            const result = await this.productModel  // product schema modelni findOneAndUpadate ( static ) methodini ishlayabmiz
                .findOneAndUpdate({_id: id, restaurant_mb_id: mb_id}, updated_data, {
                        runValidators: true,
                        lean: true,
                        returnDocument: "after", //yangilangan data ni bizga beradi

                        // runValidators: true,  //uzgargan datani yuborsa.bularni yozishimizdan sabab uzgargan qiymatni kurmoqchiman.
                        // lean: true,
                        // returnDocument: "before",  // eski data ni beradi.
                    }
                ).exec();

            assert.ok(result, Definer.general_err1);  //natijani tekshiramiz. agar malumotimiz uptade bulmagan bulsa, xatolikni chiqarsin.
            return result;                             // hammasi ajoyib bulgan bulsa return qilsin.
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Product;