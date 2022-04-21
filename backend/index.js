const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors())

let liste = [
  { name: "web-host-547dcu815-2d1ha" },
  { name: "web-host-677dcb845-2d2hb" },
  { name: "web-host-457dcg865-2d3hc" },
  { name: "web-host-657dcd845-2d4hd" },
  { name: "web-host-637dcs885-2d5he" },
  { name: "web-host-357dct845-2d6hf" },
  { name: "web-host-157dca485-2d7hg" },
];

app.get("/api/pods", (req, res) => {
  res.json(liste);
});

app.delete("/api/pods/:id", (req, res) => {
  const { id } = req.params;

  if (id) {
    liste = liste.filter((item) => item.name !== id);
    console.log("delete ", id);
    return res.json({ delete: id });
  }

  res.status(400).json({ error: "user error" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend is running on port ${port}`);
});
