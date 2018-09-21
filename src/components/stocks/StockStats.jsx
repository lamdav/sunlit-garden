import React, { Component } from "react";
import { Header, Segment, Statistic } from "semantic-ui-react";

class StockStats extends Component {
  render() {
    if (!this.props.data) {
      return null;
    }

    const basicData = this.props.data;
    const symbol = basicData["01. symbol"];
    const open = basicData["02. open"];
    const high = basicData["03. high"];
    const low = basicData["04. low"];
    return (
      <Segment>
        <Header content={symbol}
                size="huge"/>
        <Statistic.Group horizontal
                          size="huge">
          <Statistic horizontal
                      label="open"
                      value={`$${open.substring(0, open.length - 2)}`}/>
          <Statistic horizontal
                      label="high"
                      value={`$${high.substring(0, high.length - 2)}`}/>
          <Statistic horizontal
                      label="low"
                      value={`$${low.substring(0, low.length - 2)}`}/>
        </Statistic.Group>
      </Segment>
    )
  }
}

export default StockStats;