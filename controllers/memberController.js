// object yasalib uni modulening ichidagi exportga tenglashtirilyabdi// object da methodlari orqali chaqirilyabdi
// controllerlar object orqali quriladi
// controller lar object orqali quriladi
// model class lar orqali q


const Member = require("../models/member");
let memberController = module.exports;

memberController.signup = async (req, res ) => {
    try {
        console.log("POST: cont/signup");
        const data = req.body;
        const member = new Member();
        const  new_member = await member.signupData(data);   //ichida request body yuborilyabdi

        res.send("done");
    }
    catch(err){
        console.log(`ERROR, cont/signup, ${err.message}`)
    }
};

memberController.login = (req, res ) => {
    console.log("POST cont.login");
    res.send("login page");
};

memberController.logout = (req, res ) => {
    console.log("GET cont.logout");
    res.send("logout page");
};