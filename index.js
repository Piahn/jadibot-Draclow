/**
 * Node_Modules
 * @description importing modules from node_modules
 */
import express from "express";
import path from "path";
import axios from "axios";
import bodyParser from "body-parser";

/**
 * Express Settings
 * @description express settings
 */
const app = express();
const __dirname = path.resolve();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/**
 * Routes
 * @description router handler
 */
app.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3001/jadibot");
    const jadibots = response.data.map((jadibot) => ({
      id: jadibot.id.replace("@s.whatsapp.net", ""),
      keyid: jadibot.keyid,
      owner: jadibot.owner.replace("@s.whatsapp.net", ""),
    }));

    res.render("index", {
      jadibots: jadibots,
      title: "Draclow Company - Jadibot List",
    });
  } catch (error) {
    console.error("Error fetching data from JSON Server:", error.message);

    res.render("index", {
      jadibots: [],
      title: "Draclow Company - Jadibot List",
      error: "Gagal mengambil data dari server",
    });
  }
});

app.post("/jadibot", async (req, res) => {
  const { id, keyid, owner } = req.body;

  if (!id || !keyid || !owner) {
    return res
      .status(400)
      .json({ error: "Field id, keyid, dan owner wajib diisi." });
  }

  const waRegex = /^\d+@s\.whatsapp\.net$/;
  if (!waRegex.test(id)) {
    return res
      .status(400)
      .json({ error: "Format id tidak valid. Contoh: 628xxx@s.whatsapp.net" });
  }
  if (!waRegex.test(owner)) {
    return res.status(400).json({
      error: "Format owner tidak valid. Contoh: 628xxx@s.whatsapp.net",
    });
  }

  if (typeof keyid !== "string" || keyid.trim().length === 0) {
    return res.status(400).json({ error: "keyid tidak boleh kosong." });
  }

  try {
    const response = await axios.post("http://localhost:3001/jadibot", {
      id,
      keyid,
      owner,
    });

    return res.status(201).json({
      status: 201,
      message: "Data berhasil disimpan di JSON Server",
      data: response.data,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "Gagal menyimpan data ke JSON Server",
      detail: error.message,
    });
  }
});

app.delete("/jadibot/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Field id wajib diisi." });
  }

  const waRegex = /^\d+@s\.whatsapp\.net$/;
  if (!waRegex.test(id)) {
    return res
      .status(400)
      .json({ error: "Format id tidak valid. Contoh: 628xxx@s.whatsapp.net" });
  }

  try {
    const response = await axios.delete(`http://localhost:3001/jadibot/${id}`);

    return res.status(200).json({
      message: "Data berhasil dihapus dari JSON Server",
      data: response.data,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Gagal menghapus data dari JSON Server",
      detail: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log(`Example app listening on port http://localhost:${3000}`);
});
