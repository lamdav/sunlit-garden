import React, { Component } from "react";
import TrafficService from "./TrafficService";
import TrafficPlot from "./TrafficPlot";
import { Segment } from "semantic-ui-react";

class TrafficWatch extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      trafficData: []
    };

    this.service = new TrafficService();
    this.createTrafficPlot = this.createTrafficPlot.bind(this);
  }
  componentDidMount() {
    this.service.getViews()
      .then((response) => response.data)
      .then((trafficData) => {
        return trafficData.map((trafficDatum) => {
          const views = trafficDatum.views.map((view) => {
            const x = new Date(view.timestamp);
            const y = view.count;
            return {x, y};
          });
          return {repo: trafficDatum.repo, views};
        });
      })
      .then((trafficData) => this.setState({trafficData}));
  }

  createTrafficPlot(trafficDatum, index) {
    return (
      <TrafficPlot traffic={trafficDatum} key={`${index} ${trafficDatum.repo}`}/>
    );
  }

  render() {
    return (
      <Segment>
        {this.state.trafficData.map(this.createTrafficPlot)}
      </Segment>
    );
  }
}

export default TrafficWatch;