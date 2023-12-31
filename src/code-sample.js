export const codeSample = {
  id: "viz01",
  name: "GCP Architecture",
  version: "1.0.0",
  author: "Wei",
  email: "amourguo@gmail.com",
  createDate: "2022-11-05T13:15:30Z",
  lastUpdate: "2022-12-05T13:15:30Z",
  nodes: [
    {
      id: "viz01-g01",
      name: "Cloud",
      type: "group",
      category: "group",
      connectTo: [],
      otherProperties: "...",
      nodes: [
        {
          id: "viz01-g01-u01",
          name: "TEST",
          type: "node",
          category: "service",
          connectTo: ["viz01-g01-g01"],
          otherProperties: "...",
          nodes: [],
        },
        {
          id: "viz01-g01-g01",
          name: null,
          type: "group",
          category: "group",
          connectTo: ["viz01-g01-u02", "viz01-g01-u03"],
          otherProperties: "...",
          nodes: [
            {
              id: "viz01-g01-g01-u01",
              name: "Pub/Sub",
              type: "node",
              category: "service",
              connectTo: [],
              otherProperties: "...",
              nodes: null,
            },
            {
              id: "viz01-g01-g01-u02",
              name: "Monitoring",
              type: "node",
              category: "service",
              connectTo: [],
              otherProperties: "...",
              nodes: null,
            },
            {
              id: "viz01-g01-g01-u03",
              name: "Pub/Sub",
              type: "node",
              category: "service",
              connectTo: ["viz01-g01-g05"],
              otherProperties: "...",
              nodes: null,
            },
          ],
        },
        {
          id: "viz01-g01-u02",
          name: "Pub/Sub",
          type: "node",
          category: "service",
          connectTo: ["viz01-g01-g03", "viz01-g01-g05"],
          otherProperties: "...",
          nodes: [],
        },
        {
          id: "viz01-g01-u03",
          name: "TEST",
          type: "node",
          category: "service",
          connectTo: [],
          otherProperties: "...",
          nodes: [],
        },
        {
          id: "viz01-g01-g03",
          name: null,
          type: "group",
          category: "group",
          connectTo: ["viz01-g01-g04"],
          otherProperties: "...",
          nodes: [
            {
              id: "viz01-g01-g03-u01",
              name: "Cloud Storage",
              type: "node",
              category: "service",
              connectTo: [],
              otherProperties: "...",
              nodes: null,
            },
            {
              id: "viz01-g01-g03-u02",
              name: "Datastore",
              type: "node",
              category: "service",
              connectTo: [],
              otherProperties: "...",
              nodes: null,
            },
          ],
        },
        {
          id: "viz01-g01-g04",
          name: null,
          type: "group",
          category: "group",
          connectTo: ["viz01-g01-g03"],
          otherProperties: "...",
          nodes: [
            {
              id: "viz01-g01-g04-u01",
              name: "App Engine",
              type: "node",
              category: "service",
              connectTo: [],
              otherProperties: "...",
              nodes: null,
            },
            {
              id: "viz01-g01-g04-u02",
              name: "Compute Engine",
              type: "node",
              category: "service",
              connectTo: [],
              otherProperties: "...",
              nodes: null,
            },
          ],
        },
        {
          id: "viz01-g01-g05",
          name: null,
          type: "group",
          category: "group",
          connectTo: ["viz01-g01-g04", "viz01-g01-u04"],
          otherProperties: "...",
          nodes: [
            {
              id: "viz01-g01-g05-u01",
              name: "Big Query",
              type: "node",
              category: "service",
              connectTo: [],
              otherProperties: "...",
              nodes: null,
            },
            {
              id: "viz01-g01-g05-u02",
              name: "Dataprop",
              type: "node",
              category: "service",
              connectTo: [],
              otherProperties: "...",
              nodes: null,
            },
            {
              id: "viz01-g01-g05-u03",
              name: "Datalab",
              type: "node",
              category: "service",
              connectTo: [],
              otherProperties: "...",
              nodes: null,
            },
            {
              id: "viz01-g01-g05-u04",
              name: "Dataflow",
              type: "node",
              category: "service",
              connectTo: [],
              otherProperties: "...",
              nodes: null,
            },
          ],
        },
        {
          id: "viz01-g01-u04",
          name: "TEST",
          type: "node",
          category: "service",
          connectTo: [],
          otherProperties: "...",
          nodes: [],
        },
      ],
    },
  ],
};