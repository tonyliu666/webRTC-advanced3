import React, { useState } from "react";
import SendMessageButton from "../../resources/images/sendMessageButton.svg";
import * as webRTCHandler from "../../utils/webRTCHandler";
import {SendMessagesMetrics} from "../../utils/api";
import {trackLatency} from "../../utils/common";
const NewMessage = () => {
  const [message, setMessage] = useState("");

  const handleTextChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyPressed = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      // send message to other users
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (message.length > 0) {
      const exectime = trackLatency(webRTCHandler.sendMessageUsingDataChannel(message));
      const Message = {time:exectime,labels:"message"};
      const returnstr = SendMessagesMetrics(Message);
      setMessage("");
    }
  };

  return (
    <div className="new_message_container">
      <input
        className="new_message_input"
        value={message}
        onChange={handleTextChange}
        placeholder="Type your message ..."
        type="text"
        onKeyDown={handleKeyPressed}
      />
      <img
        className="new_message_button"
        src={SendMessageButton}
        onClick={sendMessage}
      />
    </div>
  );
};

export default NewMessage;
