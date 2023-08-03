import React, { useRef, useEffect } from "react";

const LocalScreenSharingPreview = ({ stream }) => {
  const localPreviewRef = useRef();
  // const [transmissionRate, setTransmissionRate] = useState(0);
  useEffect(() => {
    const video = localPreviewRef.current;

    // let previousTime = 0;
    // let previousBytesLoaded = 0;

    // const handleTimeUpdate = () => {
    //     const currentTime = video.currentTime;
    //     const currentBytesLoaded = video.buffered.;

    //     const timeElapsed = currentTime - previousTime;
    //     const bytesTransferred = currentBytesLoaded - previousBytesLoaded;

    //     // Calculate the video transmission rate in bits per second (bps)
    //     const transmissionRateBps = (bytesTransferred * 8) / timeElapsed;
    //     setTransmissionRate(transmissionRateBps);
        
    //     previousTime = currentTime;
    //     previousBytesLoaded = currentBytesLoaded;
    // };
    video.srcObject = stream;
    // video.addEventListener('timeupdate', handleTimeUpdate);
    video.onloadedmetadata = () => {
      video.play();
    };
    // return () => {
    //   video.removeEventListener('timeupdate', handleTimeUpdate);
    // };
  }, [stream]);

  return (
    <div className="local_screen_share_preview">
      <video muted autoPlay ref={localPreviewRef}>
      </video>
    </div>
  );
};

export default LocalScreenSharingPreview;
