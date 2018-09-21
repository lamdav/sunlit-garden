import React, { Component } from "react";
import { Header, Segment } from "semantic-ui-react";
import { Crosshair, FlexibleXYPlot, LineMarkSeries, XAxis, YAxis } from "react-vis";

import "../../../node_modules/react-vis/dist/style.css";

class StockPlot extends Component {
  constructor(props) {
    super(props);

    this.state = {
      crossHairDatum: []
    };

    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onNearestXY = this.onNearestXY.bind(this);
  }

  onMouseLeave() {
    this.setState({crossHairDatum: []});
  }

  onNearestXY(value, {index}) {
    this.setState({crossHairDatum: [this.props.plotData[index]]});
  }

  render() {
    if (!this.props.plotData) {
      return null;
    }
    
    let tooltip = null;
    if (this.state.crossHairDatum.length > 0) {
      const datum = this.state.crossHairDatum[0];
      const date = `time: ${datum.x.toString()}`;
      const price = `price: $${datum.y}`;

      tooltip = (
        <Segment inverted>
          <Header size="small" content={date}/>
          <Header size="small" content={[price]}/>
        </Segment>
      );
    }

    return (
      <Segment>
        <FlexibleXYPlot xType="time"
                        height={600}
                        onMouseLeave={this.onMouseLeave}>
          <XAxis title="Time"/>
          <YAxis title="Price"/>
          <LineMarkSeries data={this.props.plotData}
                          curve="curveBasic"
                          onNearestXY={this.onNearestXY}/>
          <Crosshair values={this.state.crossHairDatum}>
            {tooltip}
          </Crosshair>
        </FlexibleXYPlot>
      </Segment>
    );
  }
}

export default StockPlot;
