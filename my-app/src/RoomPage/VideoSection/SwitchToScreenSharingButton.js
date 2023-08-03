import React, { useState } from "react";
import SwitchImg from "../../resources/images/switchToScreenSharing.svg";
import LocalScreenSharingPreview from "./LocalScreenSharingPreview";
import * as webRTCHandler from "../../utils/webRTCHandler";
import {SendMessagesMetrics} from "../../utils/api";
const constraints = {
  audio: false,
  video: true,
};
// metrics for screen sharing and turn off the screen 
const SwitchToScreenSharingButton = () => {
  const [isScreenSharingActive, setIsScreenSharingActive] = useState(false);
  const [screenSharingStream, setScreenSharingStream] = useState(null);

  // here this is the screensharing button click handles
  const handleScreenShareToggle = async () => {
    if (!isScreenSharingActive) {
      // if the mic is now scanning you instead of sharing your desktop 
      let stream = null;
      try {
        // asynchronous function can not be listed as metrics
        stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      } catch (err) {
        console.log(
          "error occurred when trying to get an access to screen share stream"
        );
      }
      if (stream) {
        //TODO: send the metrics to nodeserver backend
        const startTime = performance.now();
        setScreenSharingStream(stream);

        webRTCHandler.toggleScreenShare(isScreenSharingActive, stream);
        const endTime = performance.now();
        const executionTimeMs = endTime-startTime; 
        const sharescreen = {time:executionTimeMs,labels:"screenon"};
        const returnstr = SendMessagesMetrics(sharescreen); 
        //setIsScreenSharingActive true means mic is scanning you now
        setIsScreenSharingActive(true);
        // execute here function to switch the video track which we are sending to other users
      }
    } else {
      // close your face on the mic
      const startTime = performance.now();
      webRTCHandler.toggleScreenShare(isScreenSharingActive);
      setIsScreenSharingActive(false);

      // stop screen share stream
      // for each user stop watching the guys sharing his screen
      screenSharingStream.getTracks().forEach((t) => t.stop());
      const endTime = performance.now();
      const executionTimeMs = endTime-startTime; 
      const sharescreen = {time:executionTimeMs,labels:"screenoff"};
      const returnstr = SendMessagesMetrics(sharescreen);
      setScreenSharingStream(null);
    }
  };

  return (
    <>
      <div className="video_button_container">
        <img
          src={SwitchImg}
          onClick={handleScreenShareToggle}
          className="video_button_image"
        />
      </div>
      {isScreenSharingActive && (
        <LocalScreenSharingPreview stream={screenSharingStream} />
      )}
    </>
  );
};

export default SwitchToScreenSharingButton;
