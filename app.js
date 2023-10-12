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

// MongoDB call

const db = require("./server").db();
const mongodb = require("mongodb");

//1: Kirish code
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// 2: Session code
// 3: Views code

app.set("views",   "views");
app.set("view engine",  "ejs",);


//4: routing code
// routerlar qaysi api addresslarni qayerga borishni hal qilamadi

app.use("/",router);   //expresslarni routerga yuborishni sorayabmiz


//
// app.get('/author', (req, res) => {
//     res.render('author', {user: user})
// })

module.exports = app;