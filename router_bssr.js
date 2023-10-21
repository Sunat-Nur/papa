
const express = require("express");
const router_bssr = express.Router();                   // expressni ichidan router olib chiqilyabdi
const restaurantController = require("./controllers/restaurantController");


/**********************************
 *         BSSR  EJS             *
 **********************************/
// ejs uchun,  anaaviy usul


// traditionda front-end da view ishlamaydi o'rniga json formatda ma'lumot boradi


router_bssr
    .get("/signup", restaurantController.getSignupMyRestaurant)  // async function ning callback methodan foydalanyabmiz
    .post("/signup", restaurantController.signupProcess);  // async function ning callback methodan foydalanyabmiz

// biri pageni obberadi biri run qiladi

router_bssr
    .get("/login", restaurantController.getLoginMyRestaurant)
    .post("/login", restaurantController.loginProcess);

router_bssr.get("/logout", restaurantController.logout);
router_bssr.get("/check-me", restaurantController.checkSessions);

router_bssr.get("/products/menu", restaurantController.getMyRestaurantData);




// export router
module.exports = router_bssr;


