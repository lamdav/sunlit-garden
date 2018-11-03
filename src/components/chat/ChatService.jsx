import axios from "axios";

class ChatService {
  constructor() {
    this.service = axios.create({
      baseURL: "http://localhost:8080/chat"
    });
  }

  getMessagesBefore(timestamp) {
    const config = {
      params: {
        timestamp
      }
    }

    return this.service.get("/messages", config);
  }
}

export default ChatService;
