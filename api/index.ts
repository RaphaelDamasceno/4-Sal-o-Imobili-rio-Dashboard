import express from "express";
import path from "path";
import axios from "axios";
import fs from "fs/promises";

const app = express();
app.use(express.json());

const SHEET_ID = "1KBW2Qyr9g4exPecYvj7pfde5hmZf3XApytNSInWLFZI";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
const LOGOS_FILE = path.join(process.cwd(), 'logos.json');

// Initialize logos file if it doesn't exist
async function initLogos() {
  try {
    await fs.access(LOGOS_FILE);
  } catch {
    try {
      await fs.writeFile(LOGOS_FILE, JSON.stringify({}));
    } catch (e) {
      console.warn("Could not write initial logos.json (this is expected on Vercel)");
    }
  }
}
initLogos();

// API Route to fetch spreadsheet data
app.get("/api/appointments", async (req, res) => {
  console.log(`[API] Fetching appointments from: ${CSV_URL}`);
  try {
    const response = await axios.get(CSV_URL, {
      timeout: 15000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    if (!response.data) {
      return res.status(500).json({ error: "Planilha retornou dados vazios." });
    }

    res.header("Content-Type", "text/csv");
    res.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.send(response.data);
  } catch (error: any) {
    console.error("[API] Error fetching data from Google Sheets:", error.message);
    res.status(500).json({ error: "Erro ao buscar dados da planilha: " + error.message });
  }
});

// API to get logo mappings
app.get("/api/logos", async (req, res) => {
  try {
    const data = await fs.readFile(LOGOS_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.json({});
  }
});

// API to update logo mappings
app.post("/api/logos", async (req, res) => {
  try {
    const logos = req.body;
    await fs.writeFile(LOGOS_FILE, JSON.stringify(logos, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar logos. Nota: A Vercel não suporta gravação persistente de arquivos." });
  }
});

export default app;
