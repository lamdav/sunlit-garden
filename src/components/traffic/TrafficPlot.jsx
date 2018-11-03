import React, { Component } from "react";
import { Header, Segment } from "semantic-ui-react";
import { Crosshair, FlexibleXYPlot, LineMarkSeries, XAxis, YAxis } from "react-vis";

import "../../../node_modules/react-vis/dist/style.css";

class TrafficPlot extends Component {
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
    this.setState({crossHairDatum: [this.props.traffic.views[index]]});
  }

  render() {
    if (!this.props.traffic) {
      return null;
    }
    
    let tooltip = null;
    if (this.state.crossHairDatum.length > 0) {
      const datum = this.state.crossHairDatum[0];
      const date = `time: ${datum.x.toString()}`;
      const count = `count: ${datum.y}`;

      tooltip = (
        <Segment inverted>
          <Header size="small" content={date}/>
          <Header size="small" content={[count]}/>
        </Segment>
      );
    }

    return (
      <Segment>
        <Header content={this.props.traffic.repo}/>
        <FlexibleXYPlot xType="time"
                        height={600}
                        onMouseLeave={this.onMouseLeave}>
          <XAxis title="Time"/>
          <YAxis title="Count"/>
          <LineMarkSeries data={this.props.traffic.views}
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

export default TrafficPlot;