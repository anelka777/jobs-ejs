const express = require("express");
require("express-async-errors");
require("dotenv").config();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const app = express();


app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));


const url = process.env.MONGO_URI;
const store = new MongoDBStore({
    uri: url,
    collection: "mySessions",
});
store.on("error", function (error) {
    console.error("Session store error:", error.message);
    console.error("Stack trace:", error.stack);
});


const sessionParms = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
};


if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionParms.cookie.secure = true;
}

app.use(session(sessionParms));


passportInit();
app.use(passport.initialize());
app.use(passport.session());


app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));

app.get("/", (req, res) => {
    res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));


const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
app.use("/secretWord", auth, secretWordRouter);


app.use((req, res) => {
    res.status(404).send(`Page (${req.url}) not found.`);
});


app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await require("./db/connect")(process.env.MONGO_URI);
        app.listen(port, () => console.log(`Server is running on port ${port}...`));
    } catch (error) {
        console.log(error);
    }
};

start();
