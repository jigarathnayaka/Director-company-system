import fs from "fs";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
