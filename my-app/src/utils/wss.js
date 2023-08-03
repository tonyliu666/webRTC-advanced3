import io from "socket.io-client";
import { setRoomId, setParticipants, setSocketId } from "../store/actions";
import store from "../store/store";
import * as webRTCHandler from "./webRTCHandler";
import { appendNewMessageToChatHistory } from "./directMessages";
// import {functionExecutionTimeGauge} from "./prometheus"

const SERVER = "http://localhost:5002";

let socket = null;

export const connectWithSocketIOServer = () => {
  socket = io(SERVER);
  
  // prometheus create the handler for
  // tracking socket io connection time(from client to server)
  // TODO: 
  // const startTime = process.hrtime(); 
  socket.on("connect", () => {
    console.log("successfully connected with socket io server");
    console.log(socket.id);
    store.dispatch(setSocketId(socket.id));
  });
  // const endTime = process.hrtime(startTime);
  // const executionTimeMs = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);
  // functionExecutionTimeGauge.set(executionTimeMs);
  
  
  //server.js createNewRoomHandler call this
  //prometheus has already handled this
  //it's done
  socket.on("room-id", (data) => {
    const { roomId } = data;
    store.dispatch(setRoomId(roomId));
  });

  //server.js createNewRoomHandler call this
  //prometheus has already handled this
  //it's done
  socket.on("room-update", (data) => {
    const { connectedUsers } = data;
    store.dispatch(setParticipants(connectedUsers));
  });

  //it's done for metrics collection
  socket.on("conn-prepare", (data) => {
    const { connUserSocketId } = data;

    webRTCHandler.prepareNewPeerConnection(connUserSocketId, false);

    // inform the user which just join the room that we have prepared for incoming connection
    socket.emit("conn-init", { connUserSocketId: connUserSocketId });
  });

  //it's done
  socket.on("conn-signal", (data) => {
    webRTCHandler.handleSignalingData(data);
  });

  //it's done
  socket.on("conn-init", (data) => {
    const { connUserSocketId } = data;
    webRTCHandler.prepareNewPeerConnection(connUserSocketId, true);
  });

  //it's done
  socket.on("user-disconnected", (data) => {
    webRTCHandler.removePeerConnection(data);
  });

  socket.on("direct-message", (data) => {
    appendNewMessageToChatHistory(data);
  });
};

export const createNewRoom = (identity, onlyAudio) => {
  // emit an event to server that we would like to create new room
  const data = {
    identity,
    onlyAudio,
  };

  socket.emit("create-new-room", data);
};

export const joinRoom = (identity, roomId, onlyAudio) => {
  //emit an event to server that we would to join a room
  const data = {
    roomId,
    identity,
    onlyAudio,
  };

  socket.emit("join-room", data);
};

export const signalPeerData = (data) => {
  socket.emit("conn-signal", data);
};

export const sendDirectMessage = (data) => {
  socket.emit("direct-message", data);
};
