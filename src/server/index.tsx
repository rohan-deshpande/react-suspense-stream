import React from "react";
import { renderToNodeStream } from "react-dom/server";
// @ts-ignore
// import { renderToNodeStreamAsync } from "react-lightyear/server";
import express from "express";
import { StaticRouter } from "@atlaskit/router";
import "isomorphic-fetch";
import LooselyLazyServer from "react-loosely-lazy/lib/cjs/server";
import { Layout } from "../client/layout";
import { routes } from "../client/routes";
import * as data from "./data";

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST || "");

const server = express();
server
  .disable("x-powered-by")
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR || ""))
  .get("/api/sidebar", async (req, res) => {
    await new Promise(r => setTimeout(r, 1000));
    res.send(JSON.stringify(data.sidebar));
  })
  .get("/api/projects", async (req, res) => {
    await new Promise(r => setTimeout(r, 3000));
    res.send(JSON.stringify(data.projects));
  })
  .get("/api/projects/:id", async (req, res) => {
    await new Promise(r => setTimeout(r, 3000));
    // @ts-ignore
    res.send(JSON.stringify(data.project[req.params.id]));
  })
  .get("/*", async (req, res) => {
    const location = req.url;
    const baseUrl = `${req.protocol}://${req.get("Host")}`;
    const resourceContext = { baseUrl };
    const resourcesPromise = await StaticRouter.requestResources({
      location,
      // @ts-ignore
      routes,
      resourceContext
    });

    // LooselyLazyServer.init("HYDRATE");

    await Promise.resolve();

    const stream = renderToNodeStream(
      <StaticRouter
        // @ts-ignore
        routes={routes}
        location={location}
        resourceContext={resourceContext}
      >
        <Layout />
      </StaticRouter>
    );

    res.writeHead(200, {
      "Content-Type": "text/html",
      "Transfer-Encoding": "chunked"
    });

    res.write(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Streaming example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${
          assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ""
        }
      </head>
      <body>
        <div id="root">`);

    stream.on("data", (chunk: string) => {
      res.write(chunk);
    });

    stream.on("error", err => {
      console.log(err);
      res.end(`<script>alert('error')</script>`);
    });

    stream.on("end", async () => {
      const resourceData = await resourcesPromise;
      res.end(`</div>
        <script>window.__INITIAL_STATE__ = ${JSON.stringify(
          resourceData
        )};</script>
        ${
          process.env.NODE_ENV === "production"
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`
        }
      </body>
    </html>`);
    });
  });

export default server;
