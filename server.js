import express from "express";
import cors from "cors";
import nfts from "./api/nfts.route.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/v1/nfts", nfts);
app.use("*", (req, res) => {
  res.status(404).json({ error: "not found" });
});

export default app;
