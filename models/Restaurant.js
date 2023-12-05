const assert = require("assert");
const {shapeIntoMongooseObjectId} = require("../lib/config");
const Definer = require("../lib/mistake");
const MemberModel = require("../schema/member.model");

// oddir userlar ham restaurant userlar ham bitta schema modeldni iwlatyabdi

class Restaurant {
    constructor() {
        this.memberModel = MemberModel; // schema modelni chaqirib ishlatyabmiz
    }

    async getRestaurantsData(member, data) { //getRestaurantsData method member va data qiymatarni qabul qilyabdi
        try {
            // kim login bo'lyotgani va member objectning ichida  member?_id bo'lsa mongoseogbejctID ga o'zgartirib ber deyabmiz
            const auth_mb_id = shapeIntoMongooseObjectId(member?._id);

            // pasta serach qilish maqsadida match o'zgaruvchi objectni hosil qilyabmiz
            let match = {mb_type: "RESTAURANT", mb_status: "ACTIVE"}; // va mb_type ga restaurant enum qiymatini va statusini kirityabmiz
            let aggregationQuery = []; // aggregationQuery arrayni hosil qilyabmiz

            //past string ko'rinishda keladigan data ni  songa ko'rinishida olyabmiz va limit page larni kirityabmiz
            data.limit = data["limit"] * 1;
            data.page = data["page"] * 1;

            // pasta data ni ichida keladigan order qiymatlariga switch ishlatyabmiz
            switch (data.order) {
                case "top":   // bu faqat top rest lar uchun
                    match["mb_top"] = "Y"; // enum qiymatlarni ko'rsatyabmiz

                    // match objectni mongodb match buyrug'iga tenglashtirib aggregationQuery array bo'lgani uchun push qilyabmiz
                    aggregationQuery.push({$match: match});
                    aggregationQuery.push({$sample: {size: data.limit}}); // sample sintaxsiz restaurantlarni ixtiyoriy random qilib, ob beradi.
                    // va aggregationQuery ga push qilyabmiz
                    break;
                case "random":
                    // match objectni mongodb match buyrug'iga tenglashtirib aggregationQuery array bo'lgani uchun push qilyabmiz
                    aggregationQuery.push({$match: match});
                    aggregationQuery.push({$sample: {size: data.limit}});  // sample sintaxsiz top bo'lmagan restaurantlarni ixtiyoriy random qilib, ob beradi.
                    // va aggregationQuery ga push qilyabmiz
                    break;
                default:
                    // match objectni mongodb match buyrug'iga tenglashtirib aggregationQuery array bo'lgani uchun push qilyabmiz
                    aggregationQuery.push({$match: match}); //aggregationQuery ichida match sinatax ucun match object ni provide qilamiz
                    const sort = {[data.order]: -1}; // sort object ni ichida array ko'rinishidagi sintaxni hosil qilib uning ichidagi data qiymatni olib va objectning elementiga tenglashtirib beryabdi
                    aggregationQuery.push({$sort: sort});  //aggregationQuery ichida  sort object ni sort sintax ga tenglashtirib push qilyabmiz
                    break;
            }
            // har 3 lasiga tegishli bolgan aggregationQuery
            aggregationQuery.push({$skip: (data.page - 1) * data.limit}) //datani ichidan page qiymatni qabul qilyabdi
            // agar ikkinchi pageda har bir pageda 8 ta query bolsa boshlang'ich 8 ta qiymatni skip qil deyabmiz

            // mongodb ni limit buyrug'i asosida shakilantirib qiymatini queridan keladigan data objectining limit elementiga tenglashtirib olamiz va aggrigationga push qilamiz
            aggregationQuery.push({$limit: data.limit});
            // TODO: check auth member liked the chosen target

            // tepada  biz aggregationQuery array ni hosil qilib oldik, maqsad schema modelimizni aggregation method orqali ishlatyotganda path qilish maqsadida ishlatyabmiz

            // by yerda member.schema modeldan aggrigate qilyabmiz va bu aggrigate qiymatiga aggrigationQueriyni argument sifatida provide qilamiz, va resultga yuklaymiz
            const result = await this.memberModel.aggregate(aggregationQuery)
                .exec();
            assert.ok(result, Definer.general_err1); // agar result objecti qiymati movjud bolsa return qil bomasa error ni ko'rsat deyabmiz
            return result; // agar object qiymati mavjud bola return qil deyabmiz
        } catch (err) {
            throw err;
        }
    }


    async getAllRestaurantsData() {   //getAllRestaurantsData method
        try {
            const result = await this.memberModel
                .find({
                    mb_type: "RESTAURANT",
                })
                .exec();
            assert(result, Definer.general_err1);
            return result;
        } catch (err) {
            throw err;
        }
    }

    async updateRestaurantByAdminData(update_data) {   // updateRestaurantByAdminData method
        try {
            // update_data ni ichida id bolsa  mongodb_object id ko'rinishiga keltiryabmiz
            const id = shapeIntoMongooseObjectId(update_data?.id);
            const result = await this.memberModel.findByIdAndUpdate(  // schema modeldan foydalanib id ni topdin deyabmiz
                {_id: id}, update_data,
                {runValidators: true, lean: true, returnDocument: "after"} // returnDocument update bo'lgandan kengi qiymatni berdeyabmiz
            )
                .exec();
            assert.ok(result, Definer.general_err1);
            return result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Restaurant;