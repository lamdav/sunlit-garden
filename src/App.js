import React, { Component } from "react";
import StockTracker from "./components/stocks/StockTracker";

class App extends Component {
  render() {
    const gridPaddingStyle = {
      padding: "50px"
    };

    return (
      <div style={gridPaddingStyle}>
        <StockTracker/>
      </div>
    );
  }
}

export default App;
