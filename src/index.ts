import express, { Request, Response, NextFunction } from "express";
import { LedgerService } from "./ledger";

// Ledger initialization
const ledger = new LedgerService();

// Express app setup
const app = express();
app.use(express.json());

// Routes
app.post("/accounts", (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = ledger.createAccount(req.body);
    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
});

app.get("/accounts/:id", (req: Request, res: Response) => {
  const account = ledger.getAccount(req.params.id);
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json(account);
});

app.post("/transactions", (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = ledger.createTransaction(req.body);
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.status(400).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Ledger server running on port ${PORT}`);
});
