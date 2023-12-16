const Definer = require("../lib/mistake");
const assert = require("assert");
const {shapeIntoMongooseObjectId, board_id_enum_list, lookup_auth_member_following} = require("../lib/config");
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
            return true;
        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida unsubscribeData method yaratib oldim
    async unsubscribeData(member, data) { // unga member va data qiymatlarini path qilyabman
        try {
            console.log("unsubscribeData is working");

            const subscriber_id = shapeIntoMongooseObjectId(member._id); // member ni ichida id element i bolsa olib shape qil deyabman
            const follow_id = shapeIntoMongooseObjectId(data.mb_id); // request bodyni ichidan mb_id elementi ni olib follow_id ini shape qilib olyabman

            // follow_schema modelni findOneAndDelete static methodini chaqirib olyabman  va chiqan natijani result ga tegnlayabman
            const result = await this.followModel.findOneAndDelete({
                follow_id: follow_id, // follow_id ni yuqoridagi follow_idga tengla olyabman
                subscriber_id: subscriber_id, //subscriber_id ni yuqoridagi subscriber_id ga tenglab olyabman
            });
            assert.ok(result, Definer.general_err1);

            await this.modifyMemberFollowCounts(follow_id, "subscriber_change", -1); // birinchisiga follow qilmoqchi bo'lgan id ni  kirityabman
            await this.modifyMemberFollowCounts(subscriber_id, "follow_change", -1); // o'zimni id ni kirityabman

            return true;
        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida getMemberFollowingData method yaratib oldim
    async getMemberFollowingData(inquiry) {
        try {
            console.log("getMemberFollowingData is working");
            const subscriber_id = shapeIntoMongooseObjectId(inquiry.mb_id), // inquiry ichida mb_id bolsa uni subscriber_id qilib shape qilib olyabmn
                page = inquiry.page * 1, // page ni inquiryni ichidan qabul qilib olib songa aylantirib olyabman
                limit = inquiry.limit * 1; // limit ni inquiryni ichidan qabul qilib olib songa aylantirib olyabman

            // follow_schema modelni chaqirib aggregation qilyabman
            const result = await this.followModel
                .aggregate([
                    {$match: {subscriber_id: subscriber_id}},
                    {$sort: {createdAt: -1}},
                    {$skip: (page - 1) * limit},
                    {$limit: limit},
                    {
                        $lookup: {
                            from: "members",
                            localField: "follow_id",
                            foreignField: "_id",
                            as: "follow_member_data",
                        },
                    },
                    {$unwind: "$follow_member_data"}, // array ko'rinishidagi data ni object ga o'zgartirib beradi.
                ])
                .exec();
            assert.ok(result, Definer.follow_err3);
            return result;
        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida getMemberFollowersData method yaratib oldim
    async getMemberFollowersData(member, inquiry) {
        try {
            console.log("getMemberFollowersData is working");
            const follow_id = shapeIntoMongooseObjectId(inquiry.mb_id), // request inquiry ichidan mb_id elementi ni olib follow_id ini shape qilib olyabman
                page = inquiry.page * 1, // page ni inquiryni ichidan qabul qilib olib songa aylantirib olyabman
                limit = inquiry.limit * 1; // limit ni inquiryni ichidan qabul qilib olib songa aylantirib olyabman

            let aggregateQuery = [ //
                {$match: {follow_id: follow_id}}, // match objectini ishlatib follow_id ni follow_id ga tenglab olyabman
                {$sort: {createdAt: -1}}, // oxirgidan boshlab
                {$skip: (page - 1) * limit},
                {$limit: limit},
                {
                    $lookup: {
                        from: "members",
                        localField: "subscriber_id",
                        foreignField: "_id",
                        as: "subscriber_member_data",
                    },
                },
                {$unwind: "$subscriber_member_data"}, // array ko'rinishidagi data ni object ga o'zgartirib beradi.
            ];
            // todo: following followed back to subscriber

            // agar authenticate bolgan user mavjud bolsa va request user o'zing follower ro'yxatini request qilyotgan bolsa
            if (member && member._id === inquiry.mb_id) {
                aggregateQuery.push(lookup_auth_member_following(follow_id));
            };

            const result = await this.followModel // follow_schema modelni chaqirib aggregate methodini ishlatyabman
                .aggregate(aggregateQuery)
                .exec();

            assert.ok(result, Definer.follow_err3);
            return result;
        } catch (err) {
            throw err;
        }
    };


}

module.exports = Follow;