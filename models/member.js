const MemberModel = require("../schema/member.model");
const Definer = require("../lib/mistake");
const assert = require("assert");
const bcrypt = require("bcrypt");
const {shapeIntoMongooseObjectId} = require("../lib/config");


class Member {
    constructor() {
        this.memberModel = MemberModel;   // service model ichida schema model =dan foydalinyabdi
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
                throw new Error(Definer.auth_err1); //o'izmiz xoxlagan errorni hosil qilyabmiz

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

    async getChosenMemberData(member, id) {
        try {
            id = shapeIntoMongooseObjectId(id);
            console.log("member::::", member);

            const result = await this.memberModel
                .aggregate([
                    {$match: {_id: id, mb_status: "ACTIVE"}},
                    {$unset: "mb_password"},
                ])
                .exec();

            assert.ok(result, Definer.general_err2);
            return result[0];
        } catch (err) {
            throw err;

        }
    };

    // async retrieveAuthMember(id) {
    //     try {
    //
    //
    //         assert.ok(result, Definer.general_err2);
    //         return result[0];
    //     } catch (err) {
    //         throw err;
    //
    //     }
    // };
}


module.exports = Member;