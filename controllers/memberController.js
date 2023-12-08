/* object yasalib uni modulening ichidagi exportga tenglashtirilyabdi
 object da methodlari orqali chaqirilyabdi
 controllerlar object orqali quriladi, model class lar orqali quramiz
 */


// constrollernarni object orqali, modellarni skima orqali quramiz

const Member = require("../models/Member");
const Definer = require("../lib/mistake");
const jwt = require("jsonwebtoken");
const assert = require("assert");
const memberController = module.exports;
const memberModel = module.exports;


memberController.signup = async (req, res) => {
    try {
        console.log("POST: cont/signup");
        const data = req.body,   //req.body ni data ga tenglashtirib olyabmiz. ( param ) body ga keladi
            member = new Member(),  // member service modeldan instance olinyabdi
            new_member = await member.signupData(data);   //ichida request body yuborilyabdi

        const token = memberController.createToken(new_member); //  new-user ni ma'lumotini createToken ga berilyabdi
        res.cookie("access_token", token, {  // response ni  ichiga yozyabmiz, browserni ichidagi cookie ni edit qilyabdi
            maxAge: 6 * 3600 * 1000,
            httpOnly: true,
        });

        res.json({state: 'success', data: new_member});
    } catch (err) {           // xatoni ushlassh uchun try catch dan foydalanamiz
        console.log(`ERROR, cont/signup, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};

memberController.login = async (req, res) => {
    try {
        console.log("POST: cont/login");
        const data = req.body,
            member = new Member(),  // member service modeldan instance olinyabdi
            result = await member.loginData(data);   //ichida request body yuborilyabdi

        const token = memberController.createToken(result);  //  new-user ni ma'lumotini createToken ga berilyabdi
        res.cookie("access_token", token, {
            maxAge: 6 * 3600 * 1000,
            httpOnly: true,  // o'zimiz test qilamiz
        });

        res.json({state: 'success', data: result});
    } catch (err) {
        console.log(`ERROR, cont/login, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};

memberController.logout = (req, res) => {
    console.log("GET cont/logout");

    // cookie data ni ichida access_token nomi bn saqlangan ma'lumotni qiymatini null qilib ber deyabmiz
    res.cookie("access_token", null, {maxAge: 0, httpOnly: true});
    res.send({state: "success", data: "logout successfully! "});
};


memberController.createToken = (result) => {  //result object hisoblanadi
    try {
        const upload_data = {
            _id: result._id,
            mb_nick: result.mb_nick,
            mb_type: result.mb_type,
        };

        //jwt.sign ga uchta argument yuklayabmiz ( upload_data, SECRET_TOKEN, va  expiresIn) va uni tokenga tenglayabmiz
        const token = jwt.sign(upload_data, process.env.SECRET_TOKEN, {
            expiresIn: "6h",
        });

        assert.ok(token, Definer.auth_err4);
        return token;
    } catch (err) {
        throw err;
    }
};


memberController.checkMyAuthentication = (req, res) => {
    try {
        console.log("GET cont/checkMyAuthentication");
        let token = req.cookies["access_token"];
        console.log("token:::", token);

        const member = token ? jwt.verify(token, process.env.SECRET_TOKEN) : null;
        assert.ok(token, Definer.auth_err4);

        res.json({state: 'success', data: member});
    } catch (err) {
        throw err;
    }
};

memberController.getChosenMember = async (req, res) => {
    try {
        console.log("GET cont/getChosenMember");
        const id = req.params.id;     //req.params.id ni o'zgarmas id tenglashtirib  olyabmiz ( qayta nomlayabmiz )
        const member = new Member(); // member_service modeldan instance olib yangi member object yaratyabmiz

        // member_service modelni ichida getChosenMemberData metodini yaratyabmiz va argument sifatida req.member va id ni path  qilib resultga qaytaryabmiz
        const result = await member.getChosenMemberData(req.member, id);    // req.member---- kim requstni qilyabdi ? id--- kimni data sini ko'rmoqchimiz ?

        // console.log("result::::", result);

        // agar resultda data mavjud bolsa  json formatda olyabmiz
        res.json({state: "success", data: result});
    } catch (err) {
        console.log(`ERROR, cont/getChosenMember, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
};


// token orqali hosil qilyabmiz
memberController.retrieveAuthMember = (req, res, next) => {  // next kengi middleware ga o'tkazadi
    try {
        const token = req.cookies["access_token"]; // req.cookies ni ichidan access_token ma'lumotni olib token object ga tenglashtiryabmiz

        // token mavjud bolsa jwt.verify usulidan foydalanib 2 ta argumentni path qilyabmiz
        req.member = token ? jwt.verify(token, process.env.SECRET_TOKEN) : null;
        next();  // request.memberni ichiga ma'lumot kelyabdi agar .env papkani ichidagi tokeni ber agar bo'lmasa null qiymat ber deyabdi
    } catch (err) {
        console.log(`ERROR, cont/retrieveAuthMember, ${err.message}`); // faqat error ni ko'rsatish uchun error ni beryabmiz
        next();
    }
};












