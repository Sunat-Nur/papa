

const express = require("express");
const router = express.Router();                   // expressni ichidan router olib chiqilyabdi



//va bu router orqali turli xil routerlar shakilyanyabdi
router.get("/", function (req, res) {
    res.send ("home page");
});


router.get("/menu", function (req, res) {
    res.send ("menu page");
});


router.get("/community", function (req, res) {
    res.send ("community page");
});

module.exports = router;

