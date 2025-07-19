const express = require("express");
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

app.use("/api", apiLimiter);
app.use(morgan("combined"));
app.use(cors());

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const namespace = process.env.NAMESPACE || "spacepods";

let kc;
let opts = {};

// Initialize Kubernetes client asynchronously
async function initKubernetesClient() {
  const k8s = await import("@kubernetes/client-node");

  kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  // Get authentication details from kubeconfig
  const cluster = kc.getCurrentCluster();
  const user = kc.getCurrentUser();

  // Set up headers for API requests
  opts.headers = {};
  opts.headers["Content-Type"] = "application/json";

  // Add authentication header
  if (user && user.token) {
    opts.headers["Authorization"] = `Bearer ${user.token}`;
  } else {
    // Try to get token from service account
    try {
      const fs = require("fs");
      const token = fs.readFileSync(
        "/var/run/secrets/kubernetes.io/serviceaccount/token",
        "utf8",
      );
      opts.headers["Authorization"] = `Bearer ${token}`;
    } catch (err) {
      console.warn("Could not load service account token:", err.message);
    }
  }

  // Handle TLS verification
  if (cluster && cluster.skipTLSVerify) {
    opts.rejectUnauthorized = false;
  }
}

// Initialize the client
initKubernetesClient().catch(console.error);

app.get("/healthz", (_req, res) => {
  fetch(
    `${kc.getCurrentCluster().server}/api/v1/namespaces/${namespace}/pods`,
    opts,
  ).then((data) => {
    if (data.status !== 200) {
      return res.status(500).end();
    }
    res.send("ok");
  });
});

app.get("/api", (_req, res) => res.send("ok"));
app.get("/api/pods", (req, res) => {
  fetch(
    `${kc.getCurrentCluster().server}/api/v1/namespaces/${namespace}/pods`,
    opts,
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
      options,
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
