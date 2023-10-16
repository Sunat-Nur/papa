const MemberModel = require("../schema/member.model");
const Definer = require("../lib/mistake");


class Member {
    constructor() {
        this.memberModel = MemberModel;   // service model ichida schema model =dan foydalinyabdi
    }

    async signupData(input) {
        try {
            const new_member =  new this.memberModel(input);  // schema modeldan  class sifatida foydalanib uni ichida datani berib, yangi object hosil qilib
            //mongodb boshqacha formatdagi error beradi
            try {
                const  result = await  new_member.save();    // u objectni ichida save methodan foydalangan holda memberni hosil qilamiz
            } catch (mongo_err) {
                console.log(mongo_err);
                throw new Error(Definer.auth_err1); //o'izmiz xoxlagan errorni hosil qilyabmiz

            }

            result.mb_password = ""; //passwordni stringcleara o'zgarturyabmiz
            return result;
        } catch (err){
             throw err;

        }
    }
}


module.exports = Member;