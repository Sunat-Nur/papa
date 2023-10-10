const http = require( "http");
const mongodb = require("mongodb");

let db;
const connectionString =

    "mongodb+srv://sunat_nur:BEnjw9gLBogakNv4@cluster0.zkawn2h.mongodb.net/Reja"

mongodb.connect(
    connectionString,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err, client) => {
        if(err) console.log("ERROR on connection MongoDB ");
        else {
            console.log("Mongo connection succeed");
            module.exports = client;
            const app = require("./app");
            const server = http.createServer(app);
            let PORT = 3000;
            server.listen(PORT, function() {
                console.log(
                    `the server is running successfully on port: ${PORT}, http://localhost:${PORT}`);
            });

        }
    }
);