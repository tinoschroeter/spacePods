const express = require("express")
const app = express()

app.get("/", (req, res) => res.send("Hello Kubernetes"))

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Backend is running on port ${port}`)
})
