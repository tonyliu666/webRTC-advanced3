import React from "react";

const ConnectingButton = ({
  createRoomButton = false,
  buttonText,
  onClickHandler,
}) => {
  const buttonClass = createRoomButton
    ? "create_room_button"
    : "join_room_button";
  // the rendeering part is not the key points for maintainers
  return (
    <button className={buttonClass} onClick={onClickHandler}>
      {buttonText}
    </button>
  );
};

export default ConnectingButton;
