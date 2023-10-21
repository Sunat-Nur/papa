/* object yasalib uni modulening ichidagi exportga tenglashtirilyabdi
 object da methodlari orqali chaqirilyabdi
 controllerlar object orqali quriladi, model class lar orqali quramiz
 */


const Member = require("../models/member");
let restaurantController = module.exports;



restaurantController.getMyRestaurantData = async (req, res) => {
    try {
        console.log("GET: cont/getSignupMyRestaurant");
        // TODO get my restaurant products

        res.render("restaurant-menu");
    } catch(err) {
        console.log(`ERROR: cont/getMyRestaurantData, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
}



restaurantController.getSignupMyRestaurant = async (req, res) => {
   try {
       console.log("GET: cont/getSignupMyRestaurant");
       res.render("signup");
   } catch(err) {
       console.log(`ERROR: cont/getSignupMyRestaurant, ${err.message}`);
       res.json({state: "fail", message: err.message});
   }
}


restaurantController.signupProcess = async (req, res ) => {
    try {
        console.log("POST: cont/signup process");
        const data = req.body,
            member = new Member(),  // member service modeldan instance olinyabdi
            new_member = await member.signupData(data);   //ichida request body yuborilyabdi

        req.session.member = new_member;
        req.session.save(function () {     //login bolgandan ken qaysi page ga borishi mumkinligini korsatyabmiz
            res.redirect("/resto/products/menu");
        });

        res.json({state: 'success', data: new_member});
    }
    catch(err){           // xatoni ushlassh uchun try catch dan foydalanamiz
        console.log(`ERROR, cont/signup, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};


restaurantController.getLoginMyRestaurant = async (req, res ) => {
    try {
        console.log("GET: cont/getLoginMyRestaurant");
       res.render('login-page')
    } catch(err){
        console.log(`ERROR, cont/getLoginMyRestaurant, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};
restaurantController.loginProcess = async (req, res ) => {
    try {
        console.log("POST: cont/login process");
        const data = req.body,
            member = new Member();   //ichida request body yuborilyabdi
        req.session.member = await member.loginData(data);
        req.session.save(function () {     //login bolgandan ken qaysi page ga borishi mumkinligini korsatyabmiz
            res.redirect("/resto/products/menu");
        });
    }
    catch(err){
        console.log(`ERROR, cont/login, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};


restaurantController.logout = (req, res ) => {
    console.log("GET cont.logout");
    res.send("logout page");
};


restaurantController.checkSessions = (req, res ) => {
    if(req.session?.member) {
        res.json({state: 'succeed', data: req.session.member });
    } else {
        res.json ({state: "fail", message: "You aren't authonticated"});
    }
};
// agar session mavjud bolsa sessiondagi ma'lumotlarni brouserga yuborsin