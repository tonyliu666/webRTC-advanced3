# webRTC-dockercompose
### command:
1. cd turnserver
2. docker build -t coturn .
3. docker compose up -d 

frontend reactjs core functions:
1. webRTCHandler.js handles with send messages, audio and video streaming via webrtc signaling
2. turn.js get the credentials from the backend so that it can access with coturn server container
3. api.js get the room-exists resonse and send the frontend prometheus metrics to backend

backend nodejs core functions:
1. register some metrics exposed to prometheus and these metrics also includes frontend metrics
2. socket io.on listens the event comming from the frontend service via socket.emit
3. signalhandler deals with the signaling process of the pair of sender and receiver
4. directMessageHandler can handle the message passing from one sender to the other receivers in the chat room





