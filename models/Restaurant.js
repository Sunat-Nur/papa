const assert = require("assert");
const {shapeIntoMongooseObjectId, lookup_auth_member_liked} = require("../lib/config");
const Definer = require("../lib/mistake");
const MemberModel = require("../schema/member.model");
const Member = require("./Member")

// oddir userlar ham restaurant userlar ham bitta schema modeldni iwlatyabdi

class Restaurant {
    constructor() {
        this.memberModel = MemberModel; // schema modelni chaqirib ishlatyabmiz
    }
    async getRestaurantsData(member, data) { // member va data parametrlarini qabul qiladi.
        try {
            const auth_mb_id = shapeIntoMongooseObjectId(member?._id);  //kim login bulib, req qilayotgan bulsa,shuni member_id kerak.
            //member?._id mavjud bulsa.
            const match = {mb_type: "RESTAURANT", mb_status: "ACTIVE"}; //match uzgaruvchi objectni hosil qilib olayopman
            // enum mb_type: RESTAURANT bulgan, statusi ACTIVE bulgan restaurantlarni olib ber deyopman. ACTIVE bulmaganlarini qabul qilmaydi.

            //aggregationQuery arrayini hosil qilib,
            //sababi aggregate ichida query ishlatayopmiz shuyerga pass qilish maqsadida yozayopman.
            let aggregationQuery = [];
            data.limit = data["limit"] * 1; //data limiti string kurinishi kelayopti biz songa aylantib olamiz.
            data.page = data["page"] * 1;
            //data.order orqali bitta get rest API bn barcha restarantlar,top rest,zo'r rest olaman , alohida yozib utirmayman.
            switch(data.order) { //datani ichida kelayotgan orderning qiymatiga swich qilayopman.
                case 'top':      // agar top restaurantlar suralganda ordering bulmasligi kerak.
                    match["mb_top"] = "Y"; //matchni ichida mb_topning qiymatida,(enum qiymat) YES bulishi kerak.
                    aggregationQuery.push({ $match: match }); // array bulgani un (match objectimni) mongoDbni match buyrug'iga tenglashtib push qilayopman.
                    aggregationQuery.push ({ $sample: {size: data.limit } }); // arrayga sample syntaxni kiritib,random shaklini tanlaydi bizning limitimizdan kelib chiqqan  holada.
                    // data.limitga bosh sahafadagi 4ta resta berilgan bulsa, 4 ta rest ololadi.agarda 8 ta bulsa,4tasini olib keyingi pagega qolgan qismini utkazib yuboradi.
                    break;
                case "random": // agar random string kelsa, u holda bu operatsiyani amalga oshir.
                    aggregationQuery.push({ $match: match }); //birxil restarantlar chiqishidan qattiy nazar(like,viewlardan qattiy nazar) harbiriga birxil huquq beramiz.
                    aggregationQuery.push ({ $sample: {size: data.limit } });
                    break;
                default:     // agar (default) hollarda,
                    aggregationQuery.push({ $match: match }); //aggregationQueryni ichiga match syntax un match objecti provite qilyopmiz.
                    const sort = {[data.order]: -1};    // sort objectini ichida,(elementlar harxil qiymatni hosil qilib olishi mumkin) shuning un array kurinishidagi syntaxni hosil qilib olayopman,
                    // eng oxirgi qushilgan restaurantlar.
                    aggregationQuery.push({ $sort: sort }); //sort syntaxga sort obejectimizni tenglashtirib olamiz.
                    break;  //biz nima uchun order qiymatiga top bn randomni kiritishimiz kerak?
            }

            aggregationQuery.push({$skip: (data.page - 1) * data.limit});// har 3lasiga tegishli bulgan Quary nimalardan iborat.
            //datani ichidan 1chi page qiymatni qabul qilib, har bitta qilgan req nechta data kelishi kerakligini anglatadi.
            aggregationQuery.push({ $limit: data.limit }); // mongodbni limit buyruqi asosida shakillantirib olayopmiz.
            //qiymati bulsa,Querydan kelayotdan DATA objectining limit elementiga tenglashtirib olayopmiz.


            //TODO: check auth member  likes the chosen target. (harbir restarantga like bosganmizmi yuqmi?) metodini yasaymn.
            aggregationQuery.push(lookup_auth_member_liked(auth_mb_id));

            const result = await this.memberModel.aggregate(aggregationQuery).exec();
            // memberSchema modeldan aggregate qilamiz, va aggregatening qiymatiga aggregationQueryni argument sifatida past qildim.
            assert.ok(result, Definer.general_err1);
            return result;

        } catch (err) {
            throw err;
        }

    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida getChosenRestaurant method yaratib oldim
    async getChosenRestaurantData(member, id) {  //getChosenRestaurantData methodiga 2 parametrni path qilyabman
        try {
            console.log("getChosenRestaurantData:::::");

            id = shapeIntoMongooseObjectId(id); // id ini shape qilyabman, mongoose object o'qiy oladigan shakilda
            // shape qilishdan maqsad member_schema modelni ichida query qilayotganda ishlataman

            if (member) { // agar member login bo'lgan member bolsa
                const member_obj = new Member();  // restaurant_service modelni ichida Member_service modeldan intance olib member_obj hosil qilyabman

                //member_obj objectinig viewChosenItemByMember methodiga 2 ta argumntni (member, id va type ini "member" )path qilyabman
                await member_obj.viewChosenItemByMember(member, id, "member");
            }

            // this member_schema modelni findOne methodini ishlatyabman kelgan natigani resultga tenglayabman
            const result = await this.memberModel.findOne({
                _id: id, // id tenglayabman
                mb_status: "ACTIVE", // mb_status ni active bo'lishi shart deb kirityabman
            })  // bularni hammasi react loyhamizni ichidan query bo'lib ishlatiladigan requestlar bo'lgani uchun statusi active bo'lgan requestlarga javob qaytaradi

                .exec();
            assert.ok(result, Definer.general_err2);
            return result;
        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida getAllRestaurantsData method yaratib oldim
    async getAllRestaurantsData() {   //getAllRestaurantsData method
        try { // member_schema modelni find methodini ishlatyabman
            const result = await this.memberModel
                .find({
                    mb_type: "RESTAURANT",  // mb_type faqat restaurant bolsin deb kiritdim
                })
                .exec();
            assert(result, Definer.general_err1);
            return result;
        } catch (err) {
            throw err;
        }
    }

    // database va schema_model bn ishlayotgani uchun async ko'rishida updateRestaurantByAdminData method yaratib oldim
    async updateRestaurantByAdminData(update_data) {   // updateRestaurantByAdminData method
        try {
            // update_data ni ichida id bolsa  mongodb_object id ko'rinishiga keltiryabmiz
            const id = shapeIntoMongooseObjectId(update_data?.id);
            // shape qilishdan maqsad member_schema modelni ichida query qilayotganda ishlataman
            const result = await this.memberModel.findByIdAndUpdate(  // schema modeldan foydalanib id ni topsin deyabmiz
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