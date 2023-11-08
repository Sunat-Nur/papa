const assert = require("assert");
const {shapeIntoMongooseObjectId} = require("../lib/config");
const Definer = require("../lib/mistake");
const MemberModel = require("../schema/member.model");

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
            return result;
        } catch (err) {
            throw err;
        }
    }

    async updateRestaurantByAdminData(update_data) {
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