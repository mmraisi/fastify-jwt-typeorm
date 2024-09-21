import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import fastify, { FastifyInstance } from "fastify";
import { join } from "node:path";
import oas from "oas-fastify";
import autoload from "@fastify/autoload";
import { handler } from "./routes/index";
import { errorHandler } from "./lib/error-handler";

/*
	The openapi.json will be generated using make schema or & run commands
*/
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import spec from "./openapi.json";

//workaround for fastify issue (https://github.com/ahmadnassri/node-oas-fastify/issues/17)
(spec as { $id?: string }).$id = "$";

const PORT = process.env.PORT ?? 4000;

export let server: FastifyInstance;

export default class Server {
  fastifyInstance: FastifyInstance;

  constructor(private opts: any) {
    // fastify default options
    const defaultOptions = {
      routing: {
        publicRoutes: [],
      },
      db: {},
      logger: {},
      server: {
        keepAliveTimeout: 5000,
        mode: "api",
        ignoreTrailingSlash: false,
      },
      development: {
        security: true,
      },
      featureFlags: {},
      // OpenAPI does not accept the openAPI schema "example" property without the following option
      ajv: {
        customOptions: {
          strict: false,
        },
      },
    };

    this.opts = {
      routing: {
        ...defaultOptions.routing,
        ...(opts.routing || {}),
      },
      db: {
        ...defaultOptions.db,
        ...(opts.db || {}),
      },
      logger: {
        ...defaultOptions.logger,
        ...(opts.logger || {}),
      },
      server: {
        ...defaultOptions.server,
        ...(opts.server || {}),
      },
      development: {
        ...defaultOptions.development,
        ...(opts.development || {}),
      },
      featureFlags: {
        ...defaultOptions.featureFlags,
        ...(opts.featureFlags || {}),
      },
      ajv: {
        ...defaultOptions.ajv,
        ...(opts.avj || {}),
      },
    };

    this.fastifyInstance = fastify({
      ...this.opts,
    }) as any;

    // add plugins
    this.fastifyInstance.register(autoload, {
      dir: join(__dirname, "plugins"),
      encapsulate: false,
      options: this.opts,
    });
    this.fastifyInstance.setErrorHandler(errorHandler);

    // Integrate oas-fastify
    this.fastifyInstance.register(oas, {
      spec,
      handler,
    });
  }

  // some changes

  async start() {
    const instance = this.fastifyInstance;
    try {
      await instance.listen({
        port: PORT as number,
        host: "0.0.0.0",
      });
      console.log("app is listening on port:", PORT);
      return instance;
    } catch (error) {
      instance.log.error(error);
      process.exit(1);
    }
  }
}
