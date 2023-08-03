import React from "react";
import ConnectingButton from "./ConnectingButton";
import { useHistory } from "react-router-dom";
// Metrics Done!
// turn to the other pages I think it's not so important 
const ConnectingButtons = () => {
  let history = useHistory();

  const pushToJoinRoomPage = () => {
    history.push("/join-room");
  };

  const pushToJoinRoomPageAsHost = () => {
    history.push("/join-room?host=true");
  };

  return (
    <div className="connecting_buttons_container">
      <ConnectingButton
        buttonText="Join a meeting"
        onClickHandler={pushToJoinRoomPage}
      />
      <ConnectingButton
        createRoomButton
        buttonText="Host a meeting"
        onClickHandler={pushToJoinRoomPageAsHost}
      />
    </div>
  );
};

export default ConnectingButtons;
