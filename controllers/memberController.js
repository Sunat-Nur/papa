// object yasalib uni modulening ichidagi exportga tenglashtirilyabdi
let memberController = module.exports;

memberController.home = (req, res ) => {
    console.log("GET cont.home");
    res.send("home page");
};


memberController.signup = (req, res ) => {
    console.log("POST cont.signup");
    res.send("signup page");
};

memberController.login = (req, res ) => {
    console.log("POST cont.login");
    res.send("login page");
};

memberController.logout = (req, res ) => {
    console.log("GET cont.logout");
    res.send("logout page");
};