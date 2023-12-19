const MemberModel = require("../schema/member.model");
const Definer = require("../lib/mistake");
const assert = require("assert");
const bcrypt = require("bcrypt");
const {shapeIntoMongooseObjectId, lookup_auth_member_following} = require("../lib/config");
const View = require("./View");
const Like = require("./Like");
const memberModel = module.exports;


class Member {
    constructor() {
        this.memberModel = MemberModel;
    }

    async signupData(input) {
        try {
            const salt = await bcrypt.genSalt();
            input.mb_password = await bcrypt.hash(input.mb_password, salt);
            const new_member = new this.memberModel(input);

            // schema modeldan  class sifatida foydalanib uni ichida datani berib, yangi object hosil qilib
            //mongodb boshqacha formatdagi error beradi

            let result;
            try {
                result = await new_member.save();    // u objectni ichida save methodan foydalangan holda memberni hosil qilamiz
            } catch (mongo_err) {
                console.log(mongo_err);
                throw new Error(Definer.mongo_validation_err1); //o'izmiz xoxlagan errorni hosil qilyabmiz

            }
            result.mb_password = ""; //passwordni stringa o'zgarturyabmiz, parolni ko'rmaslik uchun
            return result;
        } catch (err) {
            throw err;
        }
    }

    async loginData(input) {                  //input qismidi mb_name/password qismi keladi
        try {
            const member = await this.memberModel // member schema modeldan
                .findOne(
                    {mb_nick: input.mb_nick},
                    {mb_nick: 1, mb_password: 1})  // 0 va 1 databasedan solishtirish uchun chaqiriladi
                // majburiy ravishda chaqirib olish
                // _id default 0 bolganu uchun qiymat bermasak ham keladi
                .exec();

            assert.ok(member, Definer.auth_err2); // auth_err static method

            const isMatch = await bcrypt.compare(
                input.mb_password,
                member.mb_password     // bu yerda passwordni csolishtirib natijasini eytadi
            );
            assert.ok(isMatch, Definer.auth_err3);

            return await this.memberModel
                .findOne({mb_nick: input.mb_nick})
                .exec() // to'xtat degan ma'nosi

        } catch (err) {
            throw err;

        }
    };

    // getChosenMemberData methodni ni ikkita parametri bor bular member va id
    async getChosenMemberData(member, id) {  // member---- kim requstni qilyabdi ? id--- kimni data sini ko'rmoqchimiz ?
        try {
            console.log("getChosenMemberData is working");
            const auth_mb_id = shapeIntoMongooseObjectId(member?._id); // member mavjud bolsa id ni qabul qilib olaman
            id = shapeIntoMongooseObjectId(id); // id ini mongoose o'qiy oladigan formatda shape qilyabmiz
            console.log("member:::", member);

            let aggregateQuery = [
                // match methoda database dan id ini ushbu id ga teng bo'lganini va mb_status active ekanini tekshir deyabiz
                {$match: {_id: id, mb_status: "ACTIVE"}},
                {$unset: "mb_password"}, // unset password ni olmaslik uchun ishlatyabmiz
            ];

            if (member) { // agar  authenticated  bo'lgan member bolsa ishga tuwur deyabmiz
                //viewChosenItemByMember methodiga (member--kim, id--kimni va group_type member) ni argument sifatida path qilyabmiz
                await this.viewChosenItemByMember(member, id, "member");
                aggregateQuery.push(lookup_auth_member_following(auth_mb_id, "members"));  // members collectiondan request qilyabdi
            }
            //  memberSchema modeldan aggregate qilib
            const result = await this.memberModel.aggregate(aggregateQuery).exec();// yuqorida hosil qilgan aggregationqueryni path qilyabman

            assert.ok(result, Definer.general_err2);  // result data dan qaytadigan ma'lumot ni mavjudligini assert(check) qilyabmiz)
            // result ni ichida 0 indexdagi qiymatni return qiladi
            return result[0]; //agar result da data mavjud bolsa, agregate natijani array qilib olib beradi
        } catch (err) {
            throw err;
        }
    };


    // database va schema_model bn ishlayotgani uchun async ko'rishida viewChosenItemByMember method yaratib oldim
    // viewChosenItemByMember methodni ni 3 ta parametri bor bular member va iview_ref_id va  group_type
    async viewChosenItemByMember(member, view_ref_id, group_type) {
        try {
            console.log("viewChosenItemByMember:::::");

            view_ref_id = shapeIntoMongooseObjectId(view_ref_id); // view_ref_id ini mongoose o'qiyoladigan mongooseobjectid ga shape qilyabmiz

            // bu yerda ham member_id ini, memberni ichidagi id dan olib  mongoose o'qiyoladigan mongooseobjectid ga shape qilyabmiz
            const mb_id = shapeIntoMongooseObjectId(member._id);
            // kim ko'raydiganini member_id ga shakilantirib olyabman

            // member_service modelni ichida view_service modelni chaqirib oldik
            const view = new View(mb_id);   // view_service modeldan instance olib view objectni hosil qilib mb_id ni constructrga path qilyabman

            // bu yerda ko'rayotgan target mavjudligini tekshirish maqsadida validate ishlatyabmn
            // isValid object yasab qiymatini validateChosenTarget method ni javobiga tenglayabmn,
            const isValid = await view.validateChosenTarget(view_ref_id, group_type); // view_ref_id, group_type  argument ni path qilyabmn

            console.log("isValid::::::", isValid);

            assert.ok(isValid, Definer.general_err2); // isValid da ma'lumot mavjudligini assert qilyabmn, data  bo'lmasa error ishga tushadi

            // logged user has seen target before\\
            const doesExist = await view.checkViewExistance(view_ref_id);
            console.log("doesExist:", doesExist);


            if (!doesExist) { // agar oldin ko'rimagan bo'lsa mantiq ishlaydi

                //view_schema modelni insertMemberView methodga ref_id va group_type  argument qiymat bering natijani resultga tenglayabman
                const result = await view.insertMemberView(view_ref_id, group_type);
                assert.ok(result, Definer.general_err1);
            }
            return true;
        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida likeChosenItemByMember method yaratib oldim
    // likeChosenItemByMember methodni ni 3 ta parametri bor bular member va like_ref_id va  group_type ularni define qismida path qilyabman
    async likeChosenItemByMember(member, like_ref_id, group_type) {
        try {
            console.log("likeChosenItemByMember is working");
            like_ref_id = shapeIntoMongooseObjectId(like_ref_id);
            const mb_id = shapeIntoMongooseObjectId(member._id); // memberning id isi mavjud bolsa uni shape qilib olyabman

            const like = new Like(mb_id); // like service modeldan instance olib member object ni hosil qilyabman unga mb_id ni path qilyabman
            // like object ini ichida validateTargetItem methodini chaqirib olyabman un ga like_ref_id va group_type ni path qilyabman
            const isValid = await like.validateTargetItem(like_ref_id, group_type);
            console.log("isValid::::::", isValid);
            assert.ok(isValid, Definer.general_err2);   // att: there is no data with that params

            // todo doesExist
            const doesExist = await like.checkLikeExistence(like_ref_id); // like objecttimizni checkLikeExistence methodini chaqirib olyabman unga like_ref_id ni path qilyabman
            console.log("doesExist:::::", doesExist);

            let data = doesExist  // natijani data ga tenlashtirib,
                ? await like.removeMemberLike(like_ref_id, group_type)  //doesExist mavjud bolsa deb like object ini removeMemberLike methodini chaqirib ref_id va g_tyep ni path qilyabman
                : await like.insertMemberLike(like_ref_id, group_type); //doesExist mavjud bolmasa deb like object ini insertMemberLike methodini chaqirib ref_id va g_tyep ni path qilyabman
            assert.ok(data, Definer.general_err1);

            const result = {
                like_group: data.like_group,
                like_ref_id: data.like_ref_id,
                like_status: doesExist ? 0 : 1,
            };
            return result;
        } catch (err) {
            throw err;
        }
    };
}


module.exports = Member;