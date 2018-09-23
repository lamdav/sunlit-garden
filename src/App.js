import React, { Component } from "react";
import StockTracker from "./components/stocks/StockTracker";
import { Sidebar, Menu, Segment } from "semantic-ui-react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarVisible: false
    };

    this.toggleChat = this.toggleChat.bind(this);
    this.hideChat = this.hideChat.bind(this);
  }

  toggleChat() {
    const isSidebarVisible = this.state.sidebarVisible;
    this.setState({sidebarVisible: !isSidebarVisible});
  }

  hideChat() {
    this.setState({sidebarVisible: false});
  }

  render() {
    const menuStyle = {
      marginTop: "0px" // have menu flushed to the top of screen
    };

    const pusherStyle = {
      padding: "50px",
      minHeight: window.innerHeight
    };

    return (
      <Sidebar.Pushable>
        <Sidebar as={Segment.Group} 
                 animation="push"
                 visible={this.state.sidebarVisible}
                 direction="right"
                 width="very wide">
          <Segment inverted>
            Hello World
          </Segment>
        </Sidebar>
        
        <Menu borderless
              style={menuStyle}>
          <Menu.Item position="left"
                     index={0}
                     onClick={this.toggleChat}
                     icon="chat"/>
        </Menu>
        <Sidebar.Pusher onClick={this.hideChat}
                        style={pusherStyle}>
          <StockTracker/>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}

export default App;
