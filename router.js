
const express = require("express");
const router = express.Router();                   // expressni ichidan router olib chiqilyabdi
const memberController = require("./controllers/memberController");
const productController = require("./controllers/productController");
const {getChosenMember} = require("./controllers/memberController");

/**********************************
 *         REST  API             *
 **********************************/
// react uchun //  zamonaviy  usul


//  Member related routers
router.post("/signup", memberController.signup);  // async function ning callback methodan foydalanyabmiz
router.post("/login", memberController.login);
router.get("/logout", memberController.logout);
router.get("/check-me", memberController.checkMyAuthentication);
router.get(
    "/member/:id",
    memberController.retrieveAuthMember,
    memberController.getChosenMember
);


// Product related routers

router.post(
    "/products",
    memberController.retrieveAuthMember,
    productController.getAllProducts);


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


