const express = require("express");
require("express-async-errors");
require("dotenv").config();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const csrf = require("csurf");
const flash = require("connect-flash");
const app = express();
const jobsRouter = require("./routes/jobs");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");


const auth = require("./middleware/auth");
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, // max 100 
    message: "Too many requests from this IP, please try again later."
});

app.use(helmet());
app.use(xssClean());

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


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

const methodOverride = require('method-override');
app.use(methodOverride('_method'));  // Разрешает использование метода DELETE через POST



passportInit();
app.use(passport.initialize());
app.use(passport.session());


app.use(flash());
app.use(require("./middleware/storeLocals"));


const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);


app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use("/jobs", jobsRouter);



app.get("/", (req, res) => {
    res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

const secretWordRouter = require("./routes/secretWord");

app.use("/secretWord", auth, secretWordRouter);


app.use((req, res) => {
    res.status(404).send(`Page (${req.url}) not found.`);
});


app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).send("CSRF token validation failed");
    }
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

