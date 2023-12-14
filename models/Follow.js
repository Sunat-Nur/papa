const Definer = require("../lib/mistake");
const assert = require("assert");
const {shapeIntoMongooseObjectId, board_id_enum_list} = require("../lib/config");
const FollowModel = require("../schema/follow.model");
const MemberModel = require("../schema/member.model");

class Follow {
    constructor() {
        this.followModel = FollowModel;
        this.memberModel = MemberModel;
    }

    // database va schema_model bn ishlayotgani uchun async ko'rishida subscribeData method yaratib oldim
    async subscribeData(member, data) {
        try {
            console.log("subscribeData is working");
            assert.ok(member._id !== data.mb_id, Definer.follow_err1); // agar authentiacted bo'lgan user o'ziga follow qilmoqchi bo'lsa error ko'rsat

            const subscriber_id = shapeIntoMongooseObjectId(member._id); // memberni ichidan id ni olib, subscriber_id ini shaping qilyabman
            const follow_id = shapeIntoMongooseObjectId(data.mb_id); // data ni ichidan mb_id ni olib, follow_id ni shape qilib olyabman

            //  yerda follow qilmoqchi bo'lgan member mavjudligini check qilyabman

            const member_data = await this.memberModel  // member_schema modelni findById static methodini ishlatib
                .findById({_id: follow_id}) //  id: folllow_id mavjudligi find qilyabman va natijani member_data ga tenglayabman
                .exec();

            assert.ok(member_data, Definer.general_err1); // member_data ni qiymatini tekshiryabman agar data bolmasa error ko'rsatyabdi

            // await ko'rinishida createSubscriptionData methodini chaqirib 2 qiymatni path qilyabman va natijani result tenglayabman
            const result = await this.createSubscriptionData(follow_id, subscriber_id);

            // modifyFollowCounts methodini ikki marta ishlatamiz
            await this.modifyMemberFollowCounts(follow_id, "subscriber_change", 1); // birinchisiga follow qilmoqchi bo'lgan id ni  kirityabman
            await this.modifyMemberFollowCounts(subscriber_id, "follow_change", 2); // o'zimni id ni kirityabman
            return true; // resultga return true ni qaytaryabman
        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida createSubscriptionData method yaratib oldim
    async createSubscriptionData(follow_id, subscriber_id) { // define qismida follow_id va subscriber_id ni path qilyabman
        try {
            console.log("createSubscriptionData is working");
            // follow_schema modeldan new_follow objectini yaratib olyabman
            const new_follow = new this.followModel({
                follow_id: follow_id,  // follow_id ni follow_id ga
                subscriber_id: subscriber_id, // subscriber_id ni subscriber_id ga tenglashtirib olyabman
            });
            return await new_follow.save();  // await ko'rinishida new_follow objectini save methodini yaratib return qilyabman
        } catch (mongo_err) {
            console.log(mongo_err);
            throw new Error(Definer.follow_err2);
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida modifyMemberFollowCounts method yaratib oldim
    async modifyMemberFollowCounts(mb_id, type, modifier) { // va unga mb_id, type va modifier qiymatlarni path qilyabman
        try {
            console.log("modifyMemberFollowCounts is working");
            if (type === "follow_change") { // agar typi follow_change ga teng bolsa

                await this.memberModel // member_schema modelni findOneAndUpdate static methodini chaqirib
                    .findOneAndUpdate(
                        {_id: mb_id},  // id ni mb_id ga tenglayabman
                        {$inc: {mb_follow_cnt: modifier}} // mb_follow_cnt sonini modifier soniga oshir deyabman
                    )
                    .exec()
            } else if (type === "subscriber_change") { // agar typi subscriber_change ga teng bolsa
                await this.memberModel // member_schema modelni findOneAndUpdate static methodini chaqirib
                    .findOneAndUpdate(
                        {_id: mb_id},  // id ni mb_id ga tenglayabman
                        {$inc: {mb_subscriber_cnt: modifier}} // mb_subscriber_cnt sonini modifier soniga oshir deyabman
                    )
                    .exec();
            }
        } catch (err) {
            throw err;
        }
    };
}

module.exports = Follow;