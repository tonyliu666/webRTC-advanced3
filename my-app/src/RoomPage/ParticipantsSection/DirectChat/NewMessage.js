import React, { useState } from "react";
import sendMessageButton from "../../../resources/images/sendMessageButton.svg";
import * as webRTCHandler from "../../../utils/webRTCHandler";
// import * as wss from "../../../utils/wss";
import {SendMessagesMetrics} from "../../../utils/api";
import { connect } from "react-redux";
import {trackLatency} from "../../../utils/common";

// const NewMessage = ({ activeConversation, identity }) => {
const NewMessage = () => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (message.length > 0) {
      const exectime = trackLatency(webRTCHandler.sendMessageUsingDataChannel(message));
      // wss.sendDirectMessage({
      //   receiverSocketId: activeConversation.socketId,
      //   identity: identity,
      //   messageContent: message,
      // });
      
      const returnstr = SendMessagesMetrics(exectime);
      setMessage("");
    }
  };

  const handleTextChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyPressed = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="new_message_container new_message_direct_border">
      <input
        className="new_message_input"
        value={message}
        onChange={handleTextChange}
        placeholder="Type your message.."
        type="text"
        onKeyDown={handleKeyPressed}
      />
      <img
        className="new_message_button"
        src={sendMessageButton}
        onClick={sendMessage}
      />
    </div>
  );
};

const mapStoreStateToProps = (state) => {
  return {
    ...state,
  };
};

export default connect(mapStoreStateToProps)(NewMessage);
