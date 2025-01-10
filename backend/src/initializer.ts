import express from "express";
import path from "path";
import fs from "fs";

export default class Initializer {
  constructor() {}

  public initExpressRoute(controller: any, app: express.Application) {
    if (controller.__routes) {
      for (const route of controller.__routes) {
        (app as any)[route.method](
          route.path,
          (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
          ) => {
            route.handler.call(controller, req, res, next);
          }
        );
      }
    }
  }

  private getAllTsFiles(dirPath: string): string[] {
    let files: string[] = [];
    const fileDirs = fs.readdirSync(dirPath);
    for (const fileDir of fileDirs) {
      const fullPath = path.join(dirPath, fileDir);
      if (fs.statSync(fullPath).isDirectory()) {
        files = files.concat(this.getAllTsFiles(fullPath));
      } else {
        if (fullPath.endsWith(".ts") || fullPath.endsWith(".js")) {
          files.push(fullPath);
        }
      }
    }
    return files;
  }

  private getAllControllers(): any[] {
    const controllers: any[] = [];
    const controllerPath = path.resolve(__dirname, "controllers");
    const files = this.getAllTsFiles(controllerPath);
    for (const file of files) {
      const controller = require(file).default;
      controllers.push(controller);
    }
    return controllers;
  }

  public init(app: express.Application): void {
    const controllers = this.getAllControllers();
    for (const controller of controllers) {
      try {
        const instance = new controller();
        this.initExpressRoute(instance, app);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }
}
