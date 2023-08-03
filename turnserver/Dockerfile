FROM ubuntu:20.04
EXPOSE 3478/tcp
EXPOSE 3478/udp
RUN apt-get update -y
RUN apt-get install coturn -y
CMD turnserver -a -o -v -n --no-dtls --no-tls -u tony:870101 -r testRealm & sleep infinity
