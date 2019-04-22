const express = require("express");
const chalk = require("chalk");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");

const keys = require("./config/keys");

const isProdMode = process.env.NODE_ENV === "production";

const app = express();

const whitelist = [keys.CLIENT_BASE_URL, keys.API_BASE_URL];

const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      return callback(null, true);
    } else {
      return callback(
        new Error("Please use the standard way to access our service"),
        false
      );
    }
  }
};

app.use(helmet());
app.use(cors(corsOptions));

if (isProdMode) {
  app.use(morgan("common"));
} else {
  app.use(morgan("dev"));
}

app.set("trust proxy", 1);

mongoose.set("useCreateIndex", true);
mongoose.Promise = global.Promise;
mongoose
  .connect(keys.MONGO_URI, {
    useNewUrlParser: true
  })
  .then(() => {
    console.log(chalk.green("✓-- ") + "MongoDB " + chalk.green("Connected"));
  })
  .catch(err => {
    console.log(
      chalk.red("✗-- ") + "Database Connection Error: " + err.toString()
    );
    process.exit(1);
  });

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

require("./controlers/home")(app);
require("./controlers/admin")(app);
require("./controlers/user")(app);

if (isProdMode) {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(keys.PORT, () =>
  console.log(chalk.green("✓-- ") + `App is running at port: ${keys.PORT}`)
);

module.exports = app;
