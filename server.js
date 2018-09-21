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
  response.header("Access-Control-Allow-Methods", "GET, POST");

  request.header("Accept", "application/json");
  request.header("Accept-Language", "en-US");

  console.log(`${request.originalUrl} hit with ${JSON.stringify(request.params)}`);

  next();
});

const stockService = axios.create({
  baseURL: "https://www.alphavantage.co/query"
});
const baseParams = {
  apikey: process.env.ALPHA_VANTAGE_API_KEY
};
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
  
  stockService.get("", config)
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
  stockService.get("", config)
    .then((stockResponse) => {
      response.status(stockResponse.status)
        .send(stockResponse.data);
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