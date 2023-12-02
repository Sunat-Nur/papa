/* object yasalib uni modulening ichidagi exportga tenglashtirilyabdi
 object da methodlari orqali chaqirilyabdi
 controllerlar object orqali quriladi, model class lar orqali quramiz
 */


// constrollernarni object orqali, modellarni skima orqali quramiz

const Member = require("../models/member");
const Definer = require("../lib/mistake");
const jwt = require("jsonwebtoken");
const assert = require("assert");
let memberController = module.exports;


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

        res.json({state: 'succeed', data: result});
    } catch (err) {
        console.log(`ERROR, cont/login, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};

memberController.logout = (req, res) => {
    console.log("GET cont/logout");
    res.cookie("access_token", null, {maxAge: 0, httpOnly: true});
    res.send({ state: "succeed", data: "logout successfully! "});
};


memberController.createToken = (result) => {  //result object hisoblanadi
    try {
        const upload_data = {
            _id: result._id,
            mb_nick: result.mb_nick,
            mb_type: result.mb_type,
        };

        const token = jwt.sign(upload_data, process.env.SECRET_TOKEN, {  //jwt.sign ga uchta argument yuklayabmiz ( upload_data, SECRET_TOKEN, va  expiresIn) va uni tokenga tenglayabmiz
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

        res.json({state: 'succeed', data: member});
    } catch (err) {
        throw err;
    }
};


memberController.getChosenMember =  async (req, res) => {
    try {
        console.log("GET cont/getChosenMember");
        const id = req.params.id;

        const member = new Member();
        const result = await member.getChosenMemberData(req.member, id);
        res.json({state: 'succeed', data: result});
    } catch (err) {
        console.log(`ERROR, cont/getChosenMember, ${err.message}`);
        res.json({state: "fail", message: err.message})
    }
};




memberController.retrieveAuthMember =   (req, res, next) => {
    try {
        const token = req.cookies["access_token"];
        req.member = toke ? jwt.verify(token, process.env.SECRET_TOKEN) : null;
        next();
    } catch (err) {
        console.log(`ERROR, cont/retrieveAuthMember, ${err.message}`);
        next();
    }
};












