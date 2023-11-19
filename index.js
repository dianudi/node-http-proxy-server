import { createConnection, createServer } from "node:net";

const LISTEN_PORT = 8080;

const server = createServer({});
server.on("connection", (clientSocket) => {
  clientSocket.on("error", (e) => console.error(e.message));
  clientSocket.once("data", (data) => {
    const payload = data.toString("utf-8");
    let host,
      port = 80;
    try {
      if (payload.split("\r\n")[0].split(" ")[0] === "CONNECT") {
        [host, port] = payload.split("\r\n")[0].split(" ")[1].split(":");
        clientSocket.write(Buffer.from("HTTP/1.1 200 Connection Established\r\n\r\n"));
      } else {
        host = new URL(payload.split("\r\n")[0].split(" ")[1]).host;
      }
      const remoteSocket = createConnection(port, host);
      if (port === 80) {
        remoteSocket.write(data);
      }
      remoteSocket.on("timeout", () => {
        clientSocket.write(Buffer.from("HTTP/1.1 599 Network Connect Timeout Error\r\n\r\n"));
        clientSocket.end();
      });
      clientSocket.pipe(remoteSocket);
      remoteSocket.pipe(clientSocket);
      remoteSocket.on("error", (e) => {
        console.error(e.message);
      });
      clientSocket.on("close", () => {
        remoteSocket.end();
        // remoteSocket.removeAllListeners();
      });
    } catch (error) {
      console.error(error.message);
    }
  });
  clientSocket.on("timeout", () => clientSocket.end());
});

server.listen(LISTEN_PORT, () => {
  console.info(`Server ready 🚀`);
});
