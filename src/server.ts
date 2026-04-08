import { config } from "dotenv";
import { app } from "./app.js";

config();

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Web Service API running on http://localhost:${port}`);
});
