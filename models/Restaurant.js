const assert = require("assert");
const Definer = require("../lib/mistake");
const MemberModel = require("../schema/member.model");
const {shapeIntoMongooseObjectId} = require("../lib/config");

// oddir userlar ham restaurant userlar ham bitta schema modeldni iwlatyabdi

class Restaurant {

    constructor() {
        this.memberModel = MemberModel; // schema modelni chaqirib ishlatyabmiz
    }

    async getAllRestaurantsData() {
        try {
            const result = await this.memberModel
                .find({
                    mb_type: "RESTAURANT",
                })
                .exec();
            assert(result, Definer.general_err1);
        } catch (err) {
            throw err;
        }
    }

    async updateRestaurantByAdminData(update_data) {
        try {
            // update_data ni ichida id bolsa  mongodb_object id ko'rinishiga keltiryabmiz
            const id = shapeIntoMongooseObjectId(update_data?.id);

        } catch (err) {
            throw err;
        }
    }
}

module.exports = Restaurant;