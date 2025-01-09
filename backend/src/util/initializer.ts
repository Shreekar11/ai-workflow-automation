import express from "express";

export class Initializer {
  public init(app: express.Application): void {
    app.get("/", (req: express.Request, res: express.Response) => {
      res.json({ message: "Server is running" }).status(200);
    });
  }
}
