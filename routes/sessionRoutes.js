const express = require("express");
const passport = require("passport");
const csrf = require("csurf");

const {
    logonShow,
    registerShow,
    registerDo,
    logoff,
} = require("../controllers/sessionController");

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get("/register", csrfProtection, (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    registerShow(req, res, next);
});

router.get("/logon", csrfProtection, (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    logonShow(req, res, next);
});


router.post("/register", csrfProtection, registerDo);

router.post(
    "/logon",
    csrfProtection,
    (req, res, next) => {
        console.log("Logon attempt:", req.body);
        next();
    },
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/sessions/logon",
        failureFlash: true,
    })
);


router.post("/logoff", csrfProtection, logoff);

module.exports = router;
