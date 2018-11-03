import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Sidebar, Card, Input, Header, Loader, Sticky } from "semantic-ui-react";
import io from "socket.io-client"

import ChatService from "./ChatService";

// const dummyMessages = []
// for (let i = 0; i <= 20; i++) {
//   dummyMessages.push( {author: "david", data: `hello world ${i}`, timestamp: Date.now() + i}  )
// }

class ChatBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      messages: [],
      inputRef: null,
      firstMessageRef: null,
      isLoading: true,
      stopLoading: false,
      hasScrolled: true
    };

    this.socket = null
    this.service = new ChatService();

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.setInputRef = this.setInputRef.bind(this);
    this.setfirstMessageRef = this.setfirstMessageRef.bind(this);
    this.scrollIntoView = this.scrollIntoView.bind(this);
    this.makeMessage = this.makeMessage.bind(this);
    this.addMessages = this.addMessages.bind(this);
    this.sortMessageByTimestamp = this.sortMessageByTimestamp.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
  }

  handleMessageChange(event) {
    event.preventDefault();
    this.setState({message: event.target.value});
  }

  handleMessageSubmit(event) {
    event.preventDefault();
    console.log("submit: " + this.state.message);

    this.socket.emit("publish", {author: "david", data: this.state.message});
    this.setState({message: ""});
  }

  handleEnterKey(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      this.handleMessageSubmit(event);
    }
  }

  setInputRef(inputRef) {
    this.setState({inputRef});
  }

  setfirstMessageRef(firstMessageRef) {
    this.setState({firstMessageRef});
  }

  scrollIntoView(ref) {
    if (ref) {
      const node = ReactDOM.findDOMNode(ref);
      node.scrollIntoView();
    } else {
      console.log("ref was not initialized :(");
    }
  }

  makeMessage(message, index) {
    if (index === 0) {
      return (
        <Card key={`${index} ${message.timestamp}`}
              header={message.author}
              meta={new Date(message.timestamp).toTimeString()}
              description={message.data}
              fluid
              ref={this.setfirstMessageRef}/>
      );
    }
    return (
      <Card key={`${index} ${message.timestamp}`}
            header={message.author}
            meta={new Date(message.timestamp).toTimeString()}
            description={message.data}
            fluid/>
    );
  }

  handleLoad(detail, view) {
    const firstMessageRef = this.state.firstMessageRef;
    if (!this.state.stopLoading 
      && !this.state.isLoading 
      && this.state.hasScrolled
      && firstMessageRef) {
      const headerNode = ReactDOM.findDOMNode(firstMessageRef);
      const headerBounds = headerNode.getBoundingClientRect();
      if (headerBounds.top >= 0 && headerBounds.top <= window.innerHeight) {
        console.log("load more");
        this.setState({isLoading: true, hasScrolled: false});
        this.service.getMessagesBefore(this.state.messages[0].timestamp)
          .then((messagesResponse) => messagesResponse.data)
          .then((messages) => this.addMessages(messages));
      }
    } else if (!this.state.hasScrolled && !this.state.isLoading) {
      console.log("user has scrolled since last load succeeded");
      this.setState({hasScrolled: true});
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      console.log("component is visible...scrolling")
      this.scrollIntoView(this.state.inputRef);
    }
  }

  componentDidMount() {
    this.socket = io("localhost:8081");
    this.socket.on("messages", (message) => {
      console.log(`received message: ${JSON.stringify(message)}`);
      this.addMessages([message]);
    });

    this.service.getMessagesBefore(Date.now())
      .then((messagesResponse) => messagesResponse.data)
      .then((messages) => this.addMessages(messages));
  }

  addMessages(messages) {
    if (messages && messages.length === 0) { 
      this.setState({stopLoading: true});
      return;
    }
    console.log("incoming messages")
    console.log(messages);
    const stateMessages = this.state.messages;
    this.setState({messages: stateMessages.concat(messages).sort(this.sortMessageByTimestamp), isLoading: false});
  }

  sortMessageByTimestamp(m1, m2) {
    return m1.timestamp - m2.timestamp;
  }


  componentWillUnmount() {
    this.socket.disconnect();
    this.socket = null;
  }

  render() {
    const chatStyle = {
      minHeight: window.innerHeight
    };
    const headerStyle = {
      marginTop: "10px", 
      marginBottom: "10px"
    };

    return (
      <Sidebar animation="overlay"
               visible={this.props.visible}
               direction="left"
               width="very wide"
               onScroll={this.handleLoad}>
        <Card fluid
              style={chatStyle}>
          <Card.Header as={Header}
                       style={headerStyle}
                       textAlign="center"
                       content="Major Key Chat Room"/>

          <Card.Content> 
            <Card.Description>
              <Card.Group>
                {this.state.messages.map(this.makeMessage)}
              </Card.Group>
            </Card.Description>
          </Card.Content>

          <Card.Content extra>
            <Input placeholder="Type a message..."
                  fluid
                  value={this.state.message} 
                  onChange={this.handleMessageChange}
                  onSubmit={this.handleMessageSubmit}
                  onKeyDown={this.handleEnterKey}
                  ref={this.setInputRef}/>
          </Card.Content>
        </Card>
      </Sidebar>
    );
  }
}

export default ChatBox;
