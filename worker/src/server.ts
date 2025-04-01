import http from "http";

export class Server {
  private server: http.Server;
  private port: number;

  constructor(port: number = 8000) {
    this.port = port;
    this.server = http.createServer(this.requestHandler.bind(this));
  }

  private requestHandler(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): void {
    if (req.url === "/" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Worker is running" }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    }
  }

  start(): void {
    this.server.listen(this.port, () => {
      console.log(`Worker HTTP server listening on port ${this.port}`);
    });
  }

  shutdown(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log("HTTP server closed");
        resolve();
      });
    });
  }
}
