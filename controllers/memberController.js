/* object yasalib uni modulening ichidagi exportga tenglashtirilyabdi
 object da methodlari orqali chaqirilyabdi
 controllerlar object orqali quriladi, model class lar orqali quramiz
 */


const Member = require("../models/member");
let memberController = module.exports;

memberController.signup = async (req, res ) => {
    try {
        console.log("POST: cont/signup");
        const data = req.body,
        member = new Member(),  // member service modeldan instance olinyabdi
        new_member = await member.signupData(data);   //ichida request body yuborilyabdi

        res.json({state: 'success', data: new_member});
    }
    catch(err){           // xatoni ushlassh uchun try catch dan foydalanamiz
        console.log(`ERROR, cont/signup, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};

memberController.login = async (req, res ) => {
    try {
        console.log("POST: cont/login");
        const data = req.body,
        member = new Member(),  // member service modeldan instance olinyabdi
        result = await member.loginData(data);   //ichida request body yuborilyabdi

        res.json({state: 'succeed', data: result});
    }
    catch(err){
        console.log(`ERROR, cont/login, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};

memberController.logout = (req, res ) => {
    console.log("GET cont.logout");
    res.send("logout page");
};