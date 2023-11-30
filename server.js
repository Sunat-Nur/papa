const dotenv = require("dotenv");   // .env papkasi ucun require qilyabmiz
dotenv.config();


const http = require("http");
const mongoose = require("mongoose").default;
const connectionString = process.env.MONGO_URL;
mongoose.set('strictQuery', false);


mongoose.connect(
    connectionString,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err, goose) => {
        if (err) console.log("ERROR on connection MongoDB ");
        else {
            console.log("Mongodb connection succeed");
            //   console.log(goose);
            const app = require("./app");
            const server = http.createServer(app);
            let PORT = process.env.PORT || 3002;
            server.listen(PORT, function () {
                console.log(
                    `the server is running successfully on port: ${PORT}, http://localhost:${PORT}`);
            });

        }
    }
);