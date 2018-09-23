import React, { Component } from "react";
import { Button, Dropdown, Grid, Input, Message, Segment } from "semantic-ui-react";

import StockService from "./StockService";
import StockErrorFeed from "./StockErrorFeed";
import StockVisual from "./StockVisual";

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
      plotData: null,
      trackings: []
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
    this.createTrackingVisual = this.createTrackingVisual.bind(this);
    this.extractPlotData = this.extractPlotData.bind(this);
    this.addStock = this.addStock.bind(this);
  }

  componentDidMount() {
    this.service.track()
      .then((response) => response.data)
      .then((trackings) => {
        return Promise.all(trackings.map((tracking) => {
          const symbolPromise = Promise.resolve(tracking.symbol);
          const quotePromise = this.service.quote(tracking.symbol)
          const dailyPromise = this.service.daily(tracking.symbol, tracking.interval)
          return Promise.all([symbolPromise, quotePromise, dailyPromise])
        }));
      })
      .then((data) => {
        return data.map((datum) => {
          let symbol, quoteData, dailyData;
          [symbol, quoteData, dailyData] = datum;
          return {
            symbol,
            quoteData: quoteData.data["Global Quote"], 
            dailyData: this.extractPlotData(dailyData.data)
          };          
        });
      })
      .then((data) => {
        console.log(data);
        this.setState({trackings: data});
      });
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
        const plotData = this.extractPlotData(stockData);
        this.setState({dailyError: [], plotData});
      })
      .catch(this.handleServerError);
  }

  extractPlotData(stockData) {
    if (stockData["Information"]) {
      this.setState({error: <Message error content={stockData["Information"]}/>});
      return [];
    }
    const timeseriesKeyCandidates = Object.keys(stockData).filter((key) => key.startsWith("Time Series"));
    if (timeseriesKeyCandidates.length === 0) {
      return [];
    }
    let timeseriesKey, rest;
    [timeseriesKey, rest] = timeseriesKeyCandidates
    const timeseries = stockData[timeseriesKey];
    const times = Object.keys(timeseries);
    return times.map((time) => Object.assign({}, {x: new Date(time), y: parseFloat(timeseries[time]["4. close"])}));
  }

  handleServerError(error) {
    console.log(error);
    if (error.response && error.data && error.data.errors) {
      const responseError = error.response.data.errors;
      const errorComponents = responseError.map((error, index) => {
        return (
          <Message error
                   content={error.msg}
                   key={index + " " + error.msg}/>
        );
      });
      this.setState({error: errorComponents});
    } else {
      this.setState({error: [<Message error content={error.message}/>]});
    }
  }

  onDropdownChange(event, {value}) {
    this.setState({interval: value});
  }

  createTrackingVisual({dailyData, quoteData, symbol}, index) {
    return (
      <Grid.Row columns={1}
                key={`${symbol} ${index}`}>
        <Grid.Column>
          <StockVisual data={quoteData}
                       plotData={dailyData}/>
        </Grid.Column>
      </Grid.Row>
    );
  }

  addStock(event, data) {
    this.service.addTrack(this.state.symbol, this.state.interval)
      .catch(this.handleServerError)
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
              
              <StockVisual data={this.state.data}
                           plotData={this.state.plotData}
                           showAdd
                           onAddClick={this.addStock}/>

              <StockErrorFeed errors={errors}/>
            </Segment.Group>
          </Grid.Column>
        </Grid.Row>
        
        {this.state.trackings.map(this.createTrackingVisual)}
      </Grid> 
    );
  }
}

export default StockTracker;
