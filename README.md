# webRTC-dockercompose
### first docker image build 
1. cd my-app && docker build -t react .
2. cd server && docker build -t node .
3. cd turnserver && docker build -t turnserver
### second execute commands:
1. at the root folder and execute "docker compose up -d"

#### frontend reactjs core functions:
1. webRTCHandler.js handles with send messages, audio and video streaming via webrtc signaling
2. turn.js get the credentials from the backend so that it can access with coturn server container
3. api.js get the room-exists resonse and send the frontend prometheus metrics to backend

#### backend nodejs core functions:
1. register some metrics exposed to prometheus and these metrics also includes frontend metrics
2. socket io.on listens the event comming from the frontend service via socket.emit
3. signalhandler deals with the signaling process of the pair of sender and receiver
4. directMessageHandler can handle the message passing from one sender to the other receivers in the chat room


#### port-forward all the service on the localhost:
ports:
- 9090: prometheus
- 8000/metrics: frontend metrics endpoint
- 8001/metrics: backend metrics endpoint
- 3002: react app web ui
- 3000: grafana web ui
- 9093: alertmanager

* more to-do-lists in the future:
1. overcome the issues of the socket io connection on k8s environment by using ingress
2. deploy on the public cloud 

