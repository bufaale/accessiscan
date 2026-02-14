import { startWorker } from "./worker.js";

startWorker().catch((error) => {
  console.error("Worker failed to start:", error);
  process.exit(1);
});
