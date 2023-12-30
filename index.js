var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var shopsRouter = require("./routes/shops");
var defaultPhonesRouter = require("./routes/defaultPhones");
var brandsRouter = require("./routes/brands");
var phonesRouter = require("./routes/phones");
var shopPhonesRouter = require("./routes/shopPhone");
var faqsRouter = require("./routes/faqs");
var bannersRouter = require("./routes/banners");
var config = require("./config");

const app = express();

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "DELETE,GET,HEAD,OPTIONS,POST,PUT"
  );
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Methods",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});

/**
 * Connect to MongoDB.
 */
mongoose
  .connect(config.mongoDBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connected"))
  .catch((err) => {
    // tslint:disable-next-line:no-console
    console.log(err);
    process.exit();
  });

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/v1", shopsRouter);
app.use("/api/v1", faqsRouter);
app.use("/api/v1", defaultPhonesRouter);
app.use("/api/v1", shopPhonesRouter);
app.use("/api/v1", brandsRouter);
app.use("/api/v1", phonesRouter);
app.use("/api/v1", bannersRouter);

module.exports = app;
