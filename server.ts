import express from "express";
import path from "path";
import axios from "axios";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const LOGOS_FILE = path.join(process.cwd(), 'logos.json');
  const SHEET_ID = "1KBW2Qyr9g4exPecYvj7pfde5hmZf3XApytNSInWLFZI";
  const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

  // Initialize logos file if it doesn't exist
  try {
    await fs.access(LOGOS_FILE);
  } catch {
    await fs.writeFile(LOGOS_FILE, JSON.stringify({}));
  }

  // API Route to fetch spreadsheet data
  app.get("/api/appointments", async (req, res) => {
    try {
      const response = await axios.get(CSV_URL, {
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      res.header("Content-Type", "text/csv");
      res.send(response.data);
    } catch (error) {
      console.error("Error fetching data from Google Sheets:", error);
      res.status(500).json({ error: "Erro ao buscar dados da planilha." });
    }
  });

  // API to get logo mappings
  app.get("/api/logos", async (req, res) => {
    try {
      const data = await fs.readFile(LOGOS_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Erro ao ler logos." });
    }
  });

  // API to update logo mappings
  app.post("/api/logos", async (req, res) => {
    try {
      const logos = req.body;
      await fs.writeFile(LOGOS_FILE, JSON.stringify(logos, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao salvar logos." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
