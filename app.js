console.log("web serverni boshladik");
const express = require("express");
const app = express();
const router = require("./router");


// let user;
// fs.readFile("database/user.json", "utf8",(err, data) => {
//     if(err) {
//         console.log("ERROR:", err);
//     } else {
//         user = JSON.parse(data)
//     }
// })




//1: Kirish code
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// 2: Session code
// 3: Views code

app.set("views",   "views");
app.set("view engine",  "ejs",);


//4: routing code
// routerlar qaysi api addresslarni qayerga borishni hal qiladi

//app.use("/resto", router_bssr);  // ananviy// faqat admin va restarunt userlar uchun ishlatiladi
app.use("/",router);   //request larni routerga yuborishni sorayabmiz. React shaklda single page aplication


//
// app.get('/author', (req, res) => {
//     res.render('author', {user: user})
// })

module.exports = app;