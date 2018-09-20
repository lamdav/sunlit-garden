import axios from "axios";

class StockService {
  constructor() {
    this.service = axios.create({
      baseURL: "http://localhost:8080"
    });
  }

  quote(symbol) {
    const config = {
      params: {
        symbol
      }
    };
    return this.service("/stock/basic", config);
  }

  daily(symbol, interval) {
    const config = {
      params: {
        symbol,
        interval
      }
    };
    return this.service("/stock/daily", config);
  }
}

export default StockService;