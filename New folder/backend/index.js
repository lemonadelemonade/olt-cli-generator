const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Telnet } = require("telnet-client");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/push-to-olt", async (req, res) => {
  const { cliScript } = req.body;

  const connection = new Telnet();

  const params = {
    host: "103.144.102.44", // Ganti dengan IP OLT kamu
    port: 1162,
    shellPrompt: "PANDAWA-JTB#", // Sesuai prompt setelah login
    timeout: 5000,
    loginPrompt: "Username:",
    passwordPrompt: "Password:",
    username: "fauzi",           // Username sesuai login ke OLT kamu
    password: "@fauzi890",   // Ganti dengan password asli OLT
    debug: true,
  };

  try {
    await connection.connect(params);

    const commands = cliScript
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    for (const cmd of commands) {
      const resCmd = await connection.exec(cmd);
      console.log(`> ${cmd}\n${resCmd}`);
    }

    res.send("Script berhasil dikirim ke OLT!");
    connection.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Gagal mengirim script ke OLT.");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
