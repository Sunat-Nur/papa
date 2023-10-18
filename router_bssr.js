
const express = require("express");
const router_bssr = express.Router();                   // expressni ichidan router olib chiqilyabdi
const restaurantController = require("./controllers/restaurantController");


/**********************************
 *         BSSR  EJS             *
 **********************************/
// ejs uchun,  anaaviy usul



router_bssr.get("/signup", restaurantController.getSignupMyRestaurant);  // async function ning callback methodan foydalanyabmiz
router_bssr.post("/signup", restaurantController.signupProcess);  // async function ning callback methodan foydalanyabmiz

router_bssr.get("/login", restaurantController.getLoginMyRestaurant);
router_bssr.post("/login", restaurantController.loginProcess);

router_bssr.get("/logout", restaurantController.logout);



// export router
module.exports = router_bssr;


