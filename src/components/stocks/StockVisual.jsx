import React, { Component } from "react";
import { Button, Segment } from "semantic-ui-react";

import StockStats from "./StockStats";
import StockPlot from "./StockPlot";

class StockVisual extends Component {
  render() {
    if (this.props.data && this.props.plotData) {
      return (
        <Segment.Group horizontal>
          {this.props.showAdd  
            ? (
              <Segment size="tiny">
                <Button circular 
                        positive
                        fluid 
                        icon="plus" 
                        onClick={this.props.onAddClick}/>
              </Segment>
            )
            : null}
          <StockStats data={this.props.data}/>
          <StockPlot plotData={this.props.plotData}/>
        </Segment.Group>
      );
    }
    return null;
  }
}

export default StockVisual;