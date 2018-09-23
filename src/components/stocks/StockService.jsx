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
    return this.service.get("/stock/basic", config);
  }

  daily(symbol, interval) {
    const config = {
      params: {
        symbol,
        interval
      }
    };
    return this.service.get("/stock/daily", config);
  }

  track() {
    return this.service.get("/stock/track");
  }

  addTrack(symbol, interval) {
    const config = {
      params: {
        symbol,
        interval
      }
    };
    console.log(config);
    return this.service.post("/stock/track", null, config);
  }
}

export default StockService;