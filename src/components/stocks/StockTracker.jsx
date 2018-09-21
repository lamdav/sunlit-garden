import React, { Component } from "react";
import { Button, Grid, Input, Segment, Message, Dropdown, GridRow } from "semantic-ui-react";

import StockService from "./StockService";
import StockPlot from "./StockPlot";
import StockStats from "./StockStats";
import StockErrorFeed from "./StockErrorFeed";

class StockTracker extends Component {
  constructor(props) {
    super(props);

    this.service = new StockService();
    this.state = {
      symbol: "",
      interval: "15min",
      priceCrossHair: [],
      data: null,
      quoteErrors: [],
      dailyErrors: [],
      plot: null
    };

    this.dropdownOptions = [
      {text: "1 min", value: "1min"},
      {text: "5 min", value: "5min"},
      {text: "15 min", value: "15min"},
      {text: "30 min", value: "30min"},
      {text: "60 min", value: "60min"},
    ];

    this.onInputChange = this.onInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleServerError = this.handleServerError.bind(this);
    this.onDropdownChange = this.onDropdownChange.bind(this);
  }

  onInputChange(event, {value}) {
    this.setState({symbol: value});
  }

  handleSubmit(event, data) {
    this.service.quote(this.state.symbol)
      .then((response) => response.data)
      .then((stockData) => {         
        let quoteErrors = [
          <Message key="noResult"
                   error
                   content="No results"/>
        ];
        let data = null;
        if (Object.keys(stockData["Global Quote"]).length) {
          data = stockData["Global Quote"];
          quoteErrors = [];
        }
        this.setState({quoteErrors, data}); 
      })
      .catch(this.handleServerError);
    this.service.daily(this.state.symbol, this.state.interval)
      .then((response) => response.data)
      .then((stockData) => {
        if (stockData["Error Message"]) {
          const dailyErrors = [
            <Message key="invalidSymbol"
                     error
                     content={`Invalid Symbol ${this.state.symbol}`}/>
          ];
          this.setState({dailyError: [dailyErrors]});
          return;
        }
        const timeseries = stockData[`Time Series (${this.state.interval})`];
        const times = Object.keys(timeseries);
        const plotData = times.map((time) => Object.assign({}, {x: new Date(time), y: parseFloat(timeseries[time]["4. close"])}));
        this.setState({dailyError: [], plotData});
      })
      .catch(this.handleServerError);
  }

  handleServerError(error) {
    console.log(error);
    const responseError = error.response.data.errors;
    const errorComponents = responseError.map((error, index) => {
      return (
        <Message error
                 content={error.msg}
                 key={index + " " + error.msg}/>
      );
    });
    this.setState({error: errorComponents});
  }

  onDropdownChange(event, {value}) {
    this.setState({interval: value});
  }

  render() {
    const inputAction = (
      <Button primary
              icon="search"
              onClick={this.handleSubmit}/>
    );
    const errors = this.state.dailyErrors.concat(this.state.quoteErrors);

    return (
      <Grid>
        <Grid.Row columns={1}>
          <Grid.Column>
            <Segment.Group>
              <Segment>
                <Input placeholder="Stock Symbol"
                       action={inputAction}
                       onChange={this.onInputChange}
                       label={<Dropdown value={this.state.interval} options={this.dropdownOptions} onChange={this.onDropdownChange}/>}
                       labelPosition="left"
                       fluid/>
              </Segment>

              <StockErrorFeed errors={errors}/>
            </Segment.Group>
          </Grid.Column>
        </Grid.Row>
        
        <Grid.Row columns={1}>
          <Grid.Column>
            <Segment.Group horizontal>
              <StockStats data={this.state.data}/>
              <StockPlot plotData={this.state.plotData}/>
            </Segment.Group>
          </Grid.Column>
        </Grid.Row>
      </Grid> 
    );
  }
}

export default StockTracker;