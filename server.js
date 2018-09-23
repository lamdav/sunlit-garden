require("dotenv").config();
const express = require("express");
const expressStatusMonitor = require("express-status-monitor");
const errorhandler = require("errorhandler");
const bodyParser = require("body-parser");
const compression = require("compression");
const expressValidator = require("express-validator");
const axios = require("axios");
const { query, validationResult } = require("express-validator/check");
const { sanitizeQuery } = require("express-validator/filter");
const firebase = require("firebase");
const pThrottle = require("p-throttle");

firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
});
const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});

const app = express();

app.set("host", process.env.HOST || "localhost");
app.set("port", process.env.PORT || 8080);

app.use(expressStatusMonitor());
app.use(expressValidator());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(compression());

app.all("*", (request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Methods", "OPTIONS, PUT, GET, POST");
  response.header("Access-Control-Allow-Headers", "Content-Type");

  request.header("Accept", "application/json");
  request.header("Accept-Language", "en-US");

  console.log(`${request.method} ${request.originalUrl} hit with ${JSON.stringify(request.query)}`);

  next();
});

const stockService = axios.create({
  baseURL: "https://www.alphavantage.co/query"
});
const baseParams = {
  apikey: process.env.ALPHA_VANTAGE_API_KEY
};

const stockServiceThrottle = pThrottle((config) => stockService("", config), 5, 60000);

const symbolValidations = [
  query("symbol")
    .exists()
    .withMessage("Missing Stock Symbol")
    .isString()
    .withMessage("Symbol must be a String")
    .not().isEmpty()
    .withMessage("Symbol cannot be empty"),
  sanitizeQuery("symbol")
    .customSanitizer((symbol) => symbol.toUpperCase())
];
app.get("/stock/basic", symbolValidations, (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(404)
      .json({ errors: errors.array() });
  }

  const symbol = request.query.symbol;
  const queryParams = {
    function: "GLOBAL_QUOTE",
    symbol
  };
  const params = Object.assign(baseParams, queryParams);
  const config = {params};
  
  stockServiceThrottle(config)
    .then((stockResponse) => {
      response.status(stockResponse.status)
        .send(stockResponse.data);
    });
});

const validIntervals = ["1min", "5min", "15min", "30min", "60min"];
const intervalValidations = [
  query("interval")
    .exists()
    .withMessage("Interval was not provided")
    .isString()
    .withMessage("Interval is not a String")
    .not().isEmpty()
    .withMessage("Interval was empty")
    .custom((interval) => validIntervals.includes(interval))
    .withMessage(`Interval must be one of ${validIntervals}`),
];
app.get("/stock/daily", symbolValidations.concat(intervalValidations), (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(404)
      .json({errors: errors.array()});
  }
  
  const symbol = request.query.symbol;
  const interval = request.query.interval;

  const queryParams = {
    function: "TIME_SERIES_INTRADAY",
    symbol,
    interval
  };
  const params = Object.assign(baseParams, queryParams);
  const config = {params};
  stockServiceThrottle(config)
    .then((stockResponse) => {
      response.status(stockResponse.status)
        .send(stockResponse.data);
    });
});

app.get("/stock/track", (request, response) => {
  const stocksRef = db.collection("stocks");
  stocksRef.get()
    .then((snapshot) => {
      response.status(200)
        .send(snapshot.docs.map((doc) => doc.data()));
    })
    .catch((error) => console.log(error));
});

app.post("/stock/track", symbolValidations.concat(intervalValidations), (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(404)
      .json({errors: errors.array()});
  }

  const symbol = request.query.symbol;
  const interval = request.query.interval;

  const stocksRef = db.collection("stocks");

  stocksRef.where("symbol", "==", symbol)
    .get()
    .then((snapshot) => {
      const data = {symbol, interval};
      if (snapshot.empty) {
        stocksRef.add({symbol, interval})
          .then((doc) => response.status(201).send(data))
          .catch((error) => console.log("fail add: " + error.message))
      } else {
        snapshot.forEach((doc) => {
          stockRef.doc(doc.id).update(data)
            .then(() => response.status(200).send(data))
            .then((error) => console.log("fail update: " + error.message));
        });
      }
    });
});

if (process.env.NODE_ENV !== "production") {
  app.use(errorhandler());
}

app.listen(app.get("port"), (error) => {
  if (error) {
    console.log(`Server failed to start: ${error}`);
  } else {
    console.log(`Server listening on ${app.get("host")}:${app.get("port")}`);
  }
});