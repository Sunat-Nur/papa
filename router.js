const express = require("express");
const router = express.Router();                   // expressni ichidan router olib chiqilyabdi
const memberController = require("./controllers/memberController");
const productController = require("./controllers/productController");
const restaurantController = require("./controllers/restaurantController");
const orderController = require("./controllers/orderController");
const communityController = require("./controllers/communityController");
const {getChosenMember} = require("./controllers/memberController");
const uploader_community = require ("./utils/upload-multer")("community");
const uploader_member = require ("./utils/upload-multer")("members"); // addres ni provide qilyabman
const followController = require("./controllers/followController");

/**********************************
 *         REST  API             *
 **********************************/
// react uchun //  zamonaviy  usul


/**********************************
 * Member related routers        *
 **********************************/


router.post("/signup", memberController.signup);  // async function ning callback methodan foydalanyabmn
router.post("/login", memberController.login);
router.get("/logout", memberController.logout);
router.get("/check-me", memberController.checkMyAuthentication);
router.get(
    "/member/:id", // biz xoxlagan member_id ni param  url orqali obkelyabmn
    memberController.retrieveAuthMember, //  oldin view qilganmi va  kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    memberController.getChosenMember  // memberController da getChosenMember metodini yasayabmn
);
/**********************************
 * Product related routers        *
 **********************************/

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


/**********************************
 * order related routers        *
 **********************************/

router.post(
    "/orders/create",
    memberController.retrieveAuthMember,  // oldin view qilganmi va kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    orderController.createOrder   // orderController da createOrder methodini yaratib olyabman
)

router.get(
    "/orders", // end_point
    memberController.retrieveAuthMember, // oldin view qilganmi va kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    orderController.getMyOrders,  // orderController da getMyOrders methodini yaratib olyabman
);

router.post(
    "/orders/edit",
    memberController.retrieveAuthMember,  // oldin view qilganmi va kim request qiladiganini bilish un retrieveAuthMember ishlatyabman
    orderController.editChosenOrder  // orderController da editChosenOrder methodini yaratib olyabman
);



/**********************************
 * Community related routers        *
 **********************************/

router.post(
    "/community/imgae",
    uploader_community.single("community_image"), // upload qiladigan rasmni single deb qoydim
    communityController.imageInsertion
);

// article yasaydigan router yaratyabman
router.post(
    "/community/create",
    memberController.retrieveAuthMember,
    communityController.createArticle
);

router.get(
    "/community/articles",
    memberController.retrieveAuthMember,
    communityController.getMemberArticles
);

router.get(
    "/community/target",
    memberController.retrieveAuthMember,
    communityController.getArticles
);

router.get(
    "/community/single-article/:art_id", // biz xoxlagan article_id ni param,  url orqali obkelyabmn,
    memberController.retrieveAuthMember,
    communityController.getChosenArticle
);


/**********************************
 * Following related routers        *
 **********************************/


router.post(
    "/follow/subscribe",
    memberController.retrieveAuthMember,
    followController.subscribe
);


router.post(
    "/follow/unsubscribe",
    memberController.retrieveAuthMember,
    followController.unsubscribe
);


router.get(
    "/follow/followings",
    followController.getMemberFollowings
);

router.get(
    "/follow/followers",
    memberController.retrieveAuthMember,
    followController.getMemberFollowers
);






module.exports = router;

// request lar 3 xil

// rest API, TRadition va graphl request


