
const express = require("express");
const router = express.Router();                   // expressni ichidan router olib chiqilyabdi
const memberController = require("./controllers/memberController");


/**********************************
 *         REST  API             *
 **********************************/
// react uchun //  zamonaviy  usul


//memberlarga dahldor routerlar

//va bu router orqali turli xil routerlar shakilyanyabdi
router.post("/signup", memberController.signup);  // async function ning callback methodan foydalanyabmiz
router.post("/login", memberController.login);
router.get("/logout", memberController.logout);


// boshqa routerlar
router.get("/menu",  (req, res) =>{
    res.send ("menu page");
});


router.get("/community",  (req, res) => {
    res.send ("community page");
});


// export router
module.exports = router;


