console.log("web serverni boshladik");
const express = require("express");
const app = express();
const router = require("./router");
const router_bssr = require("./router_bssr");


let session = require("express-session");
const MongoDBStore = require("connect-mongodb-session") (session);  // mongodbni storegeni hosil qib berishda yordam beradi
const store = new MongoDBStore({          // mongodbstore class daan instance olyabmiz
    uri: process.env.MONGO_URL,           // va unga argument berib argumentni ichida uri va collection bor
    collection: "session",                   // session nomli store storeni h,q
});

//1: Kirish code
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// 2: Session code

app.use(                                       // app use  middleware, sessionni app.use ga integratsiya qilyabmiz
    session({                          // va unga parametr yozyabmiz
        secret: process.env.SESSION_SECRET,    //sessionda secret code yozilyabdi decodeing code uchun
        cookie: {
            maxAge: 1000 * 60 * 59, // for 30 minutes
            // qancha vaqt uchun deb beryabmiz
        },
        store: store,  // store qayerda saqlanishini beryabmiz
        resave: true,
        saveUninitialized: true,
    })
);

app.use(function (req, res,next ) {
    res.locals.member = req.session.member;        //har bir keladigan request  ucun ushubi mantiq
    next();                                        // respns local memberni ichida session memberni yukala deyabmiz

})
// 3: Views code

app.set("views",   "views");
app.set("view engine",  "ejs",);


//4: routing code
// routerlar qaysi api addresslarni qayerga borishni hal qiladi

app.use("/resto", router_bssr);       // tradition EJS, BSSR faqat admin va restarunt userlar uchun ishlatiladi
app.use("/",router);                   // modern, REACT SPA request larni routerga yuborishni sorayabmiz.
// React shaklda single page aplication


module.exports = app;