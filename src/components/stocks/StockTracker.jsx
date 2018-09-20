import React, { Component } from "react";
import { Button, Grid, Input, Statistic, Segment, Message, Dropdown } from "semantic-ui-react";
import { FlexibleXYPlot, LineSeries, XAxis, YAxis } from "react-vis";

import "../../../node_modules/react-vis/dist/style.css";


import StockService from "./StockService";

class StockTracker extends Component {
  constructor(props) {
    super(props);

    this.service = new StockService();
    this.state = {
      symbol: "",
      interval: "1min",
      data: null,
      error: null,
      plot: null
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onDropdownChange = this.onDropdownChange.bind(this);
  }

  onInputChange(event, {value}) {
    this.setState({symbol: value});
  }

  handleSubmit(event, data) {
    this.service.quote(this.state.symbol)
      .then((response) => response.data)
      .then((stockData) => {         
        let error = (
          <Message key="noResult"
                   error
                   content="No results"/>
        );
        let data = null;
        if (Object.keys(stockData["Global Quote"]).length) {
          data = stockData["Global Quote"];
          error = null;
        }
        this.setState({error, data}); 
      })
      .catch((error) => {
        const responseError = error.response.data.errors;
        const errorComponents = responseError.map((error, index) => {
          return (
            <Message error
                     content={error.msg}
                     key={index + " " + error.msg}/>
          );
        });
        this.setState({error: errorComponents});
      });
    this.service.daily(this.state.symbol, this.state.interval)
      .then((response) => response.data)
      .then((stockData) => {
        console.log(stockData);
        const timeseries = stockData[`Time Series (${this.state.interval})`];
        const times = Object.keys(timeseries);
        const plotData = times.map((time) => Object.assign({}, {x: new Date(time), y: parseFloat(timeseries[time]["4. close"])}));

        const plotComponent = (
          <Segment>
            <FlexibleXYPlot xType="time"
                            height={600}>
              <XAxis title="Time"/>
              <YAxis title="Price"/>
              <LineSeries data={plotData}
                          curve="curveBasis"/>
            </FlexibleXYPlot>
          </Segment>
        );

        this.setState({plot: plotComponent});
      })
      .catch((error) => console.log(error));
  }

  onDropdownChange(event, {value}) {
    console.log(value);
    this.setState({interval: value});
  }

  render() {
    const inputAction = (
      <Button primary
              icon="search"
              onClick={this.handleSubmit}/>
    );

    let content = null;
    if (this.state.data) {
      const basicData = this.state.data;
      const open = basicData["02. open"];
      const high = basicData["03. high"];
      const low = basicData["04. low"];


      content = (
        <Segment>
          <Statistic.Group horizontal>
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
      );
    }

    const options = [
      {text: "1 min", value: "1min"},
      {text: "5 min", value: "5min"},
      {text: "15 min", value: "15min"},
      {text: "30 min", value: "30min"},
      {text: "60 min", value: "60min"},
    ];
    return (
      <Grid.Row columns={2}>
        <Grid.Column>
          <Segment.Group>
            <Segment>
              <Input placeholder="Stock Symbol"
                     action={inputAction}
                     onChange={this.onInputChange}
                     label={<Dropdown value={this.state.interval} options={options} onChange={this.onDropdownChange}/>}
                     labelPosition="left"
                     fluid/>
            </Segment>
            {this.state.error ? <Segment> {this.state.error} </Segment> : null}
            {content}
          </Segment.Group>
        </Grid.Column>

        {this.state.plot  
          ? (
            <Grid.Column>
              <Segment.Group>
                {this.state.plot}     
              </Segment.Group>
            </Grid.Column>
          )
          : null 
        }
      </Grid.Row>
    );
  }
}

export default StockTracker;