/* object yasalib uni modulening ichidagi exportga tenglashtirilyabdi
 object da methodlari orqali chaqirilyabdi
 controllerlar object orqali quriladi, model class lar orqali quramiz
 */


const Product = require("../models/Product");
const Member = require("../models/Member");
const member = require("../schema/member.model")
const Restaurant = require("../models/Restaurant")
const Definer = require("../lib/mistake");
const assert = require("assert");

let restaurantController = module.exports;

restaurantController.getRestaurants = async (req, res) => {
    try {
        console.log("GET: cont/getRestaurants");
        // query -- paramsdan kelyabdi hear url dan kelyabdi
        const data = req.query;  // req.query ni data ga tenglashtirib olyabman  // query --pagination order limit
        restaurant = new Restaurant(); // restau_service modeldan instance  olib restaurant objectini yasab olayabdi

        // restaurant objectni ichida getRestaurantData methodni hosil qilyabmiz va uning ichiga req.member va querydan olinga datani path qilyabmiz va result object ga yuklayabman
        result = await restaurant.getRestaurantsData(req.member, data);          // req.member retrieveAuthMember endpoindan kelyabdi, memberni token bor yoqligini tekshiradi
        res.json({state: "success", data: result});  // getRestaurantsData methodidan qaytgan ma'lumotni json formatda ma'lumotni qaytaryabdi
    } catch (err) {
        console.log(`ERROR, cont/home, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
};


restaurantController.getChosenRestaurant = async (req, res) => { // async function shakilda getChosenRestaurants methodini yaratib olyabman
    try {
        console.log("GET: cont/getChosenRestaurant");

        // routerda berilgan id ini,  params objectini ichida id bo'lib kelyabdi men uni id nomi bn qayta nomlab olyabman
        const id = req.params.id;
        restaurant = new Restaurant(); // restau_service modeldan instance  olib restaurant objectini yasab olayabdi

        // restaurant_service modelni ichida getChosenRestaurantData methodni hosil qilyabman va uning ichiga req.member va querydan olinga id ni path qilib  natijani result object ga tenglayabman
        result = await restaurant.getChosenRestaurantData(req.member, id);    // req.member retrieveAuthMember endpoindan kelyabdi, memberni token bor yoqligini tekshiradi
        res.json({state: "success", data: result});  // getChosenRestaurants methodidan qaytgan ma'lumotni json formatda ma'lumotni qaytaryabdi
    } catch (err) {
        console.log(`ERROR, cont/getChosenRestaurant, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
}


/**********************************
 *    Restaurant related methods   *
 **********************************/


restaurantController.home = (req, res) => {
    try {
        console.log("GET: cont/home");
        res.render('home-page');  // home-page.ejs fielga malumotni yuborayopti.
    } catch (err) {
        console.log(`ERROR: cont/home, ${err.message}`);  //error bulsa qaytar degan qism.
        res.json({state: "fail", message: err.message});
    }
};

restaurantController.getMyRestaurantProducts = async (req, res) => {
    try {
        console.log("GET: cont/getMyRestaurantProducts");
        const product = new Product();       // product class dan product objectini hosil qilyabmiz
        const data = await product.getAllProductsDataResto(res.locals.member);
        //restorani product listini oberadi
        // getallProductdataResto methodini hosil qilyabmiz
        // bu yerda to'g'ridan to'g'ri localdan  datani qabul qilyabdi

        res.render("restaurant-menu", {restaurant_data: data}); // restarant menuga tegishli data borsin
    } catch (err) {
        console.log(`ERROR: cont/getMyRestaurantData, ${err.message}`);
        res.redirect("/resto");
    }
}

restaurantController.getSignupMyRestaurant = async (req, res) => {
    try {
        console.log("GET: cont/getSignupMyRestaurant");
        res.render("signup");
    } catch (err) {
        console.log(`ERROR: cont/getSignupMyRestaurant, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
};


restaurantController.signupProcess = async (req, res) => {
    try {
        console.log("POST: cont/signupProcess");
        assert(req.file, Definer.general_err3);

        let new_member = req.body;
        new_member.mb_type = "RESTAURANT";
        new_member.mb_image = req.file.path;   // imageni path ni olib o'zini serveriga save qilyabmiz

        const member = new Member(); // member servica modeldan instance olyabdi
        const result = await member.signupData(new_member); // signupData sini oldik mongo db ga qo'shib berdi
        assert(req.file, Definer.general_err1);

        req.session.member = result;
        req.session.save(function () {    // async save bolgandan ken
            res.redirect('/resto/products/menu');  // callback ishlaydi
        })
    } catch (err) {
        console.log(`ERROR, cont/signupProcess, ${err.message}`);
        res.json({state: 'fail', message: err.message});
    }
};


restaurantController.getLoginMyRestaurant = async (req, res) => {
    try {
        console.log("GET: cont/getLoginMyRestaurant");
        res.render('login-page')
    } catch (err) {
        console.log(`ERROR, cont/getLoginMyRestaurant, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};
restaurantController.loginProcess = async (req, res) => {
    try {
        console.log("POST: cont/loginProcess");
        const data = req.body,
            member = new Member();        //ichida request body yuborilyabdi
        result = await member.loginData(data);  //memberimizni butun ma'lumotlari resultda mavjud

        req.session.member = result;       // session ni ichidan member objectni hosil qilib, qiymatlarni  result ni ichida yuklaymiz
        req.session.save(function () {     //login bolgandan ken qaysi page ga borishi mumkinligini korsatyabmiz
            result.mb_type === "ADMIN"
                ? res.redirect("/resto/all-restaurant")
                : res.redirect("/resto/products/menu");
        });
    } catch (err) {
        console.log(`ERROR, cont/login, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};


restaurantController.logout = (req, res) => {
    try {
        console.log("GET cont/logout");
        req.session.destroy(function () {
            res.redirect("/resto");
        });
    } catch (err) {
        console.log(`ERROR, cont/logout, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
};

restaurantController.validateAuthRestaurant = (req, res, next) => {
    if (req.session?.member?.mb_type === "RESTAURANT") {
        req.member = req.session.member;
        next();
    } else res.json({state: "fail", message: "only authenticated members with restaurant type"})
};


restaurantController.validateAdmin = (req, res, next) => {
    if (req.session?.member?.mb_type === "ADMIN") {
        req.member = req.session.member;
        // sessionni ichidagi memberni, request ni chidagi member elementiga  yuklab bersin, o'tkazsin deyabmiz
        next();
    } else {
        const html = `<script>
                      alert("Admin page: Permission denied!");
                      window.location.replace("/resto");
                      </script>`
        res.end(html);
    }
};


restaurantController.checkSessions = (req, res) => {
    if (req.session?.member) {
        res.json({state: 'success', data: req.session.member});
    } else {
        res.json({state: "fail", message: "You aren't authenticated"});
    }
};
// agar session mavjud bolsa sessiondagi ma'lumotlarni brouserga yuborsin


restaurantController.getAllRestaurants = async (req, res) => {
    try {
        console.log("GET cont/getAllRestaurants");

        const restaurant = new Restaurant();
        const restaurants_data = await restaurant.getAllRestaurantsData();
        res.render("all-restaurants", {restaurants_data: restaurants_data});

    } catch (err) {
        console.log(`ERROR, cont/getAllRestaurants, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
}


restaurantController.updateRestaurantByAdmin = async (req, res) => {
    try {
        console.log("GET cont/updateRestaurantByAdmin");

        const restaurant = new Restaurant();
        const result = await restaurant.updateRestaurantByAdminData(req.body);  // body qismdan datani oladi
        await res.json({state: "success", data: result});  // natija success bolsa res.json ko'rinishda front-ent ga  ma'lumot yuboryabdi
    } catch (err) {
        console.log(`ERROR, cont/updateRestaurantByAdmin, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
}
