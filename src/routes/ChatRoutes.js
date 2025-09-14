const express = require("express");
const http = require("http");
const https = require("https");
const config = require("../config");

const chatRoutes = express.Router();

chatRoutes.post("/", (req, res) => {
  const target = new URL(config.WEBHOOK_URL);
  const client = target.protocol === 'http:' ? http : https;

  const upstream = client.request(
    target,
    { method: "POST", headers: { "Content-Type": "application/json" } },
    (upRes) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      upRes.on("data", (chunk) => { res.write(chunk); if (res.flush) res.flush(); });
      upRes.on("end", () => res.end());
    }
  );

  upstream.on("error", (err) => {
    console.error("Chat error:", err.message);
    if (!res.headersSent) return res.status(500).json({ error: "Chatbot failed to respond" });
    res.end();
  });

  const { message, prompt } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const payload = prompt && String(prompt).trim().length > 0 ? { message, prompt } : { message };
  upstream.write(JSON.stringify(payload));
  upstream.end();
});

module.exports = { chatRoutes };