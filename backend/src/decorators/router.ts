function registerRoute(method: string, path: string): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor => {
    if (!target.__routes) {
      target.__routes = [];
    }
    target.__routes.push({ method, path, handler: descriptor?.value || "" });
    return descriptor;
  };
}

export const GET = (path: string): MethodDecorator => {
  return registerRoute("get", path);
};
export const POST = (path: string): MethodDecorator => {
  return registerRoute("post", path);
};
export const PUT = (path: string): MethodDecorator => {
  return registerRoute("put", path);
};
export const DELETE = (path: string): MethodDecorator => {
  return registerRoute("delete", path);
};
