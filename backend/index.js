const express = require("express");
const promMid = require("express-prometheus-middleware");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const app = express();
const cors = require("cors");

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  promMid({
    metricsPath: "/metrics",
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
    requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  })
);

app.use("/api", apiLimiter);
app.use(morgan("combined"));
app.use(cors());

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const namespace = process.env.NAMESPACE || "spacepods";

const k8s = require("@kubernetes/client-node");
const fetch = require("node-fetch");

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const opts = {};
kc.applyToRequest(opts);

app.get("/healthz", (req, res) => {
  fetch(
    `${kc.getCurrentCluster().server}/api/v1/namespaces/${namespace}/pods`,
    opts
  ).then((data) => {
    if (data.status !== 200) {
      return res.status(500).end();
    }
    res.send("ok");
  });
});

app.get("/api", (req, res) => res.send("ok"));
app.get("/api/pods", (req, res) => {
  fetch(
    `${kc.getCurrentCluster().server}/api/v1/namespaces/${namespace}/pods`,
    opts
  )
    .then((res) => res.json())
    .then((data) => {
      res.json(data);
    });
});

app.delete("/api/pods/:id", (req, res) => {
  const { id } = req.params;
  if (id) {
    const options = { ...opts, method: "DELETE" };
    fetch(
      `${
        kc.getCurrentCluster().server
      }/api/v1/namespaces/${namespace}/pods/${id}`,
      options
    )
      .then((res) => res.json())
      .then((data) => {
        res.json({ kill: data.metadata.name });
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    res.status(400).json({ error: "user error" });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend is running on port ${port}`);
});
