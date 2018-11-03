import React, { Component } from "react";
import StockTracker from "./components/stocks/StockTracker";
import { Sidebar, Menu } from "semantic-ui-react";
import ChatBox from "./components/chat/ChatBox";
import TrafficWatch from "./components/traffic/TrafficWatch";

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
        <ChatBox visible={this.state.sidebarVisible}/>
        
        <Menu borderless
              inverted
              fixed="top"
              style={menuStyle}>
          <Menu.Item position="left"
                     index={0}
                     onClick={this.toggleChat}
                     icon="chat"/>
        </Menu>
        <Sidebar.Pusher onClick={this.hideChat}
                        style={pusherStyle}>
          <StockTracker/>
          <TrafficWatch/>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}

export default App;
