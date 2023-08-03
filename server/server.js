const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const twilio = require("twilio");

const PORT = process.env.PORT || 5002;
// prometheus port 8001 
const NODEPROMEPORT = 8001;
const REACTPROMEPORT = 8000;
const app = express();
app.use(express.json());
const prome = express();
const reactprome = express();
// create prometheus server
const server = http.createServer(app);

const Prometheus = require('prom-client');
const register = new Prometheus.Registry();
register.setDefaultLabels({
  app: 'nodejs'
})
Prometheus.collectDefaultMetrics({register})
// for react registry
const reactregister = new Prometheus.Registry();
reactregister.setDefaultLabels({
  app: 'reactjs'
});
Prometheus.collectDefaultMetrics({reactregister});
// console.log(Prometheus.collectDefaultMetrics.metricsList);

// self-defined metrics
const roomcounter = new Prometheus.Counter({
  name: 'endpoint_access_time',
  help: 'watch how many times is the url accessed',
  labelNames: ['roomcheck', 'endpoint'],
});
const WebRTCTimeHistogram = new Prometheus.Gauge({
  name: 'webrtc_one_time_handshaking',
  help: '2 times webRTCHandler.prepareNewPeerConnection function execution time in seconds',
  labelNames: ['roomid','sender','receiver'], 
});
const HowManyPeople = new Prometheus.Gauge({
  name: 'the_number_of_people',
  help: 'watch how many people are in the room',
  labelNames: ['roomid'],
});
//socket io function execution time
const CreateRoomTimeHistogram = new Prometheus.Histogram({
  name: 'createroom_execution_time_milliseconds',
  help: 'createroom function execution time in milliseconds',
  buckets: [0.001,0.002,0.003,0.004,0.005,0.006,0.007,0.008,0.009,0.01], // Define the time buckets in seconds
});
const JoinRoomTimeHistogram = new Prometheus.Histogram({
  name: 'joinroom_execution_time_milliseconds',
  help: 'joinroom function execution time in milliseconds',
  buckets: [0.001,0.002,0.003,0.004,0.005,0.006,0.007,0.008,0.009,0.01], // Define the time buckets in seconds
});
const LeavingRoomTimeHistogram = new Prometheus.Histogram({
  name: 'leavingroom_execution_time_milliseconds',
  help: 'leavingroom function execution time in milliseconds',
  buckets: [0.001,0.002,0.003,0.004,0.005,0.006,0.007,0.008,0.009,0.01], // Define the time buckets in seconds
});
register.registerMetric(roomcounter);
register.registerMetric(HowManyPeople);
register.registerMetric(CreateRoomTimeHistogram);
register.registerMetric(JoinRoomTimeHistogram);
register.registerMetric(LeavingRoomTimeHistogram);
register.registerMetric(WebRTCTimeHistogram);

//self defined metrics for reactjs because it can't use prometheus library
const MessagePassingTime = new Prometheus.Histogram({
  name: 'message_passing_execution_milliseconds',
  help: 'messagepassing function execution time in miliseconds',
  buckets: [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1], // Define the time buckets in seconds
});
const TotalCreateRoomTime = new Prometheus.Summary({
  name: 'total_createroom_time_miliseconds',
  help: 'createroom function execution time in miliseconds',
});
const TotalVideoOpenTime = new Prometheus.Summary({
  name: 'total_videoopen_time_miliseconds',
  help: 'video open function execution time in miliseconds',
  percentiles: [0.2,0.4,0.6,0.8],
});
const TotalVideoOffTime = new Prometheus.Summary({
  name: 'total_videooff_time_miliseconds',
  help: 'video off function execution time in miliseconds',
  percentiles: [0.2,0.4,0.6,0.8],
});
reactregister.registerMetric(MessagePassingTime);
reactregister.registerMetric(TotalCreateRoomTime);
reactregister.registerMetric(TotalVideoOpenTime);
reactregister.registerMetric(TotalVideoOffTime);
app.use(cors());
prome.use(cors());
reactprome.use(cors());

let connectedUsers = [];
let rooms = [];

//prometheus client
prome.get('/metrics', async (req, res) => {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err);
  }
});
reactprome.get('/metrics', async (req, res) => {
  try {
    const metrics = await reactregister.metrics();
    res.set('Content-Type', reactregister.contentType);
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err);
  }
});
prome.listen(NODEPROMEPORT, () => {
  console.log(`Prometheus exporter server is running on port ${NODEPROMEPORT}`);
});
reactprome.listen(REACTPROMEPORT, () => {
  console.log(`Prometheus exporter react server is running on port ${REACTPROMEPORT}`);
});
// create route to check if room exists
app.get("/api/room-exists/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find((room) => room.id === roomId);
  // collect access times of roomid 
  
  if (room) {
    roomcounter.labels({ roomcheck: '/api/room-exists/', endpoint: room.id }).inc();
    // send reponse that room exists
    if (room.connectedUsers.length > 3) {
      return res.send({ roomExists: true, full: true });
    } else {
      return res.send({ roomExists: true, full: false });
    }
  } else {
    // send response that room does not exists
    return res.send({ roomExists: false });
  }
  
});

app.get("/api/get-turn-credentials", (req, res) => {
  // const accountSid = "AC7cff1792ce0f8d410f4790a5048eeeb7";
  // const authToken = "c9f5e65fe22c2e6764d5ca5530d4970c";

  // const client = twilio(accountSid, authToken);

  // res.send({ token: null });
  const iceservers = {
    urls: 'turn:localhost:3478',
    username: 'tony',
    credential: '870101',
  }
  res.send({token:iceservers});
  // try {
  //   client.tokens.create().then((token) => {
  //     res.send({ token });
  //   });
  // } catch (err) {
  //   console.log("error occurred when fetching turn server credentials");
  //   console.log(err);
  //   res.send({ token: null });
  // }
});
//collect message passing data from api.js SendMessagesMetrics  
app.post("/api/messagetime", (req, res) => {
  const messagetime = req.body;
  console.log("message time is "+messagetime.time);
  MessagePassingTime.observe(messagetime.time);
  res.send('get the message passing time from react');
});
app.post("/api/createroom", (req, res) => {
  const messagetime = req.body;
  console.log("createroom time is "+ messagetime.time);
  TotalCreateRoomTime.observe(messagetime.time);
  res.send('get the createroom time from react');
});
app.post("/api/screenon", (req, res) => {
  const messagetime = req.body;
  console.log("turnon the screensharing time is "+ messagetime.time);
  TotalVideoOpenTime.observe(messagetime.time);
  res.send('get the screen turnon time from react');
});
app.post("/api/screenoff", (req, res) => {
  const messagetime = req.body;
  console.log("turn off the screensharing time is "+ messagetime.time);
  TotalVideoOffTime.observe(messagetime.time);
  res.send('get the screen turnoff time from react');
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

function timeElapsed(start) {
  const end = process.hrtime(start);
  const elapsedSeconds = end[0];
  const elapsedNanoseconds = end[1];
  return elapsedSeconds + elapsedNanoseconds / 1e9; // Convert nanoseconds to seconds
}

io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);
  
  //done
  socket.on("create-new-room", (data) => {
    const startTime = process.hrtime();
    createNewRoomHandler(data, socket);
    const elapsedSeconds = timeElapsed(startTime);
    //convert to seconds
    CreateRoomTimeHistogram.observe(elapsedSeconds);
  });

  //done
  socket.on("join-room", (data) => {
    const startTime = process.hrtime();
    joinRoomHandler(data, socket);
    const elapsedSeconds = timeElapsed(startTime);
    //convert to seconds
    JoinRoomTimeHistogram.observe(elapsedSeconds);
  });

  //done
  socket.on("disconnect", () => {
    const startTime = process.hrtime();
    disconnectHandler(socket);
    const elapsedSeconds = timeElapsed(startTime);
    LeavingRoomTimeHistogram.observe(elapsedSeconds);
  });

  //done
  socket.on("conn-signal", (data) => {
    signalingHandler(data, socket);
  });

  //done
  socket.on("conn-init", (data) => {
    initializeConnectionHandler(data, socket);
  });

  socket.on("direct-message", (data) => {
    directMessageHandler(data, socket);
  });
});

// socket.io handlers

const createNewRoomHandler = (data, socket) => {
  console.log("host is creating new room");
  console.log(data);
  const { identity, onlyAudio } = data;

  const roomId = uuidv4();

  // create new user
  const newUser = {
    identity,
    id: uuidv4(),
    socketId: socket.id,
    roomId,
    onlyAudio,
  };

  // push that user to connectedUsers
  connectedUsers = [...connectedUsers, newUser];

  //create new room
  const newRoom = {
    id: roomId,
    connectedUsers: [newUser],
  };
  // join socket.io room
  socket.join(roomId);

  rooms = [...rooms, newRoom];

  // emit to that client which created that room roomId
  socket.emit("room-id", { roomId });

  // emit an event to all users connected
  // to that room about new users which are right in this room
  socket.emit("room-update", { connectedUsers: newRoom.connectedUsers });
  // add a new user to the new room and update the number of users
  HowManyPeople.labels({roomid: roomId}).inc();
};

const joinRoomHandler = (data, socket) => {
  const { identity, roomId, onlyAudio } = data;

  const newUser = {
    identity,
    id: uuidv4(),
    socketId: socket.id,
    roomId,
    onlyAudio,
  };

  // join room as user which just is trying to join room passing room id
  const room = rooms.find((room) => room.id === roomId);
  room.connectedUsers = [...room.connectedUsers, newUser];

  // join socket.io room
  socket.join(roomId);
  //add one people in the specific room id(prometheus)
  HowManyPeople.labels({ roomid: roomId}).inc();

  // add new user to connected users array
  connectedUsers = [...connectedUsers, newUser];

  // emit to all users which are already in this room to prepare peer connection
  room.connectedUsers.forEach((user) => {
    if (user.socketId !== socket.id) {
      const data = {
        connUserSocketId: socket.id,
      };
      // estimate the webrtc transfer time for each pair of users(prometheus)
      const startTime = process.hrtime();
      io.to(user.socketId).emit("conn-prepare", data);
      const elapsedSeconds = timeElapsed(startTime);
      const labelValues = { roomid: room.id, sender: newUser.identity,receiver: user.identity};
      WebRTCTimeHistogram.labels(labelValues).set(elapsedSeconds);
    }
  });

  io.to(roomId).emit("room-update", { connectedUsers: room.connectedUsers });
};

const disconnectHandler = (socket) => {
  // find if user has been registered - if yes remove him from room and connected users array
  const user = connectedUsers.find((user) => user.socketId === socket.id);

  if (user) {
    // remove user from room in server
    const room = rooms.find((room) => room.id === user.roomId);

    room.connectedUsers = room.connectedUsers.filter(
      (user) => user.socketId !== socket.id
    );
    //count down the number of the room by one(prometheus)

    // leave socket io room
    socket.leave(user.roomId);
    // prometheus
    HowManyPeople.labels({roomid: room.id}).dec();
    // close the room if amount of the users which will stay in room will be 0
    if (room.connectedUsers.length > 0) {
      // emit to all users which are still in the room that user disconnected
      io.to(room.id).emit("user-disconnected", { socketId: socket.id });

      // emit an event to rest of the users which left in the toom new connectedUsers in room
      io.to(room.id).emit("room-update", {
        connectedUsers: room.connectedUsers,
      });
    } else {
      rooms = rooms.filter((r) => r.id !== room.id);
    }
  }
};

const signalingHandler = (data, socket) => {
  const { connUserSocketId, signal } = data;

  const signalingData = { signal, connUserSocketId: socket.id };
  io.to(connUserSocketId).emit("conn-signal", signalingData);
};

// information from clients which are already in room that They have preapred for incoming connection
const initializeConnectionHandler = (data, socket) => {
  const { connUserSocketId } = data;

  const initData = { connUserSocketId: socket.id };
  io.to(connUserSocketId).emit("conn-init", initData);
};

const directMessageHandler = (data, socket) => {
  if (
    connectedUsers.find(
      (connUser) => connUser.socketId === data.receiverSocketId
    )
  ) {
    const receiverData = {
      authorSocketId: socket.id,
      messageContent: data.messageContent,
      isAuthor: false,
      identity: data.identity,
    };
    socket.to(data.receiverSocketId).emit("direct-message", receiverData);

    const authorData = {
      receiverSocketId: data.receiverSocketId,
      messageContent: data.messageContent,
      isAuthor: true,
      identity: data.identity,
    };

    socket.emit("direct-message", authorData);
  }
};

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
