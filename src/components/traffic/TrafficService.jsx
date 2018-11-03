import axios from "axios";

class TrafficService {
  constructor() {
    this.service = axios.create({
      baseURL: "http://localhost:8080/traffic"
    });
  }

  getViews(perPage) {
    perPage = perPage || 10;
    const config = {
      params: {
        perPage
      }
    };
    return this.service.get("/views", config);
  }
}

export default TrafficService;