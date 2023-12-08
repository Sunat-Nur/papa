const express = require("express");
const router = express.Router();                   // expressni ichidan router olib chiqilyabdi
const memberController = require("./controllers/memberController");
const productController = require("./controllers/productController");
const restaurantController = require("./controllers/restaurantController");
const orderController = require("./controllers/orderController");
const {getChosenMember} = require("./controllers/memberController");

/**********************************
 *         REST  API             *
 **********************************/
// react uchun //  zamonaviy  usul


//  Member related routers
router.post("/signup", memberController.signup);  // async function ning callback methodan foydalanyabmn
router.post("/login", memberController.login);
router.get("/logout", memberController.logout);
router.get("/check-me", memberController.checkMyAuthentication);
router.get(
    "/member/:id", // biz xoxlagan member_id ni param  url orqali obkelyabmn
    memberController.retrieveAuthMember, //  oldin view qilganmi va  kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    memberController.getChosenMember  // memberController da getChosenMember metodini yasayabmn
);


// Product related routers

router.post(
    "/products",  // menga kerak boladigan querydatani requestni body qismida yuboryabman
    memberController.retrieveAuthMember, // oldin view qilganmi va  kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    productController.getAllProducts);  // memberController da getAllProducts metodini yasayabmn

router.get(
    "/products/:id",
    memberController.retrieveAuthMember,  // oldin view qilganmi va  kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    productController.getChosenProduct   // memberController da getChosenProduct metodini yasayabmn
);


// restaurant related routers

router.get("/restaurants",
    memberController.retrieveAuthMember,  // oldin view qilganmi va kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    restaurantController.getRestaurants  // memberController da getRestaurants metodini yasayabmn
);

router.get(
    "/restaurants/:id", // biz xoxlagan restaurant_id ni param,  url orqali obkelyabmn,
    memberController.retrieveAuthMember,  // oldin view qilganmi va kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    restaurantController.getChosenRestaurant // restaurantController da getChosenRestaurant methodini yaratib olyabman
);


// Order related routers

router.post(
    "/orders/create",
    memberController.retrieveAuthMember,  // oldin view qilganmi va kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    orderController.createOrder   // orderController da createOrder methodini yaratib olyabman
)

router.get(
    "/orders",
    memberController.retrieveAuthMember, // oldin view qilganmi va kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    orderController.getMyOrders,  // orderController da getMyOrders methodini yaratib olyabman
);


module.exports = router;


// boshqa routerlar
// router.get("/menu",  (req, res) =>{
//     res.send ("menu page");
// });
//
//
// router.get("/community",  (req, res) => {
//     res.send ("community page");
// });


// export router


