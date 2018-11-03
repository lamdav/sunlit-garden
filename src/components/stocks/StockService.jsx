import axios from "axios";

class StockService {
  constructor() {
    this.service = axios.create({
      baseURL: "http://localhost:8080/stock"
    });
  }

  quote(symbol) {
    const config = {
      params: {
        symbol
      }
    };
    return this.service.get("/basic", config);
  }

  daily(symbol, interval) {
    const config = {
      params: {
        symbol,
        interval
      }
    };
    return this.service.get("/daily", config);
  }

  track() {
    return this.service.get("/track");
  }

  addTrack(symbol, interval) {
    const config = {
      params: {
        symbol,
        interval
      }
    };
    console.log(config);
    return this.service.post("/track", null, config);
  }
}

export default StockService;