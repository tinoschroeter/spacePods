const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

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

app.get("/healthz", (req, res) => res.send("ok"));

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
  console.log("id: ", id);
  console.log("req.params: ", req.params);
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
        return res.json(data);
      })
      .catch((error) => res.status(500).json({ error }));
  }
  res.status(400).json({ error: "user error" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend is running on port ${port}`);
});
