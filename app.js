console.log("web serverni boshladik");
const http = require("http");
const express = require("express");
const app = express();
const router = require("./router");
const router_bssr = require("./router_bssr");
const cors = require("cors");
const cookieParser = require("cookie-parser");


let session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);  // mongodbni storegeni hosil qib berishda yordam beradi
const store = new MongoDBStore({          // mongodbstore class daan instance olyabmiz
    uri: process.env.MONGO_URL,           // va unga argument berib argumentni ichida uri va collection bor
    collection: "session",                   // session nomli store storeni h,q
});

//1: Kirish code
app.use(express.static("public"));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));  //object ichida bolsa deb
app.use(express.static('js'));
app.use(cors({credentials: true, origin: true,}));
app.use(cookieParser()); //

// 2: Session code

app.use(                                       // app use  middleware, sessionni app.use ga integratsiya qilyabmiz
    session({                          // va unga parametr yozyabmiz
        secret: process.env.SESSION_SECRET,    //sessionda secret code yozilyabdi decodeing code uchun
        cookie: {
            maxAge: 1000 * 60 * 59, // for 30 minutes
            // qancha vaqt uchun deb beryabmiz
        },
        store: store,  // store qayerda saqlanishini beryabmiz
        resave: true,  // cookie ni qayta  save qiladi
        saveUninitialized: true,  // saqlashni boshlashga true beryabmiz
    })
);

app.use(function (req, res, next) {
    res.locals.member = req.session.member;
    next();
})


// 3: Views code

app.set("views", "views");
app.set("view engine", "ejs",);

//4: routing code
app.use("/resto", router_bssr);       // tradition EJS, SSR faqat admin va restarunt userlar uchun ishlatiladi
app.use("/", router);                   // modern, REACT SPA request larni routerga yuborishni sorayabmiz.

const server = http.createServer(app);

// socket.io backend server
const io = require("socket.io")(server, {
    serveClient: false, // client ni serve qilmayabman
    origin: "*:*", // istalgan port ucun ochiq, ixtiyoriy ulanishi mumkin
    transport: ["websocket", "xhr-polling"],  // transport protoclini yozyabman
});


let online_users = 0;
io.on("connection", function (socket) { // ma'nosi ulangan client birinchi shu yerga keladi
    online_users++;
    console.log("New user, total:", online_users);
    socket.emit("greetMsg", {text: "welcome"});
    io.emit("infoMsg", {total: online_users});

    socket.on("disconnect", function () {
        online_users--;
        socket.broadcast.emit("infoMsg", {total: online_users});
        console.log("client disconnected, total", online_users);
    });

    socket.on("createMsg", function (data) {
        console.log("createMsg", data);
        io.emit("newMsg", data);
    });

    // socket.emit(); // ulangan user uchun yoziladigan xabar
    // socket.broadcast.emit(); //  ulangan user dan tashqari qolgan useers uchun yoziladigan xabar
    // io.emit() // for all users
})

module.exports = server;