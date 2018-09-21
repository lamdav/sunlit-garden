import React, { Component } from "react";
import { Segment } from "semantic-ui-react";

class StockErrorFeed extends Component {
  render() {
    if (this.props.errors.length === 0) {
      return null;
    }

    return (
      <Segment>
        {this.props.errors}
      </Segment>
    );
  }
}

export default StockErrorFeed;
