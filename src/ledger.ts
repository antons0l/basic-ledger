import { v4 as uuidv4 } from "uuid";
import { Account, Direction, LedgerEntry, Transaction } from "./types";

// Validation utilities
const isValidDirection = (direction: unknown): boolean => {
  return direction === "debit" || direction === "credit";
};

const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === "number" && value > 0;
};

// Business logic
export class LedgerService {
  private accounts: Map<string, Account> = new Map();
  private transactions: Map<string, Transaction> = new Map();

  createAccount(data: {
    id?: string;
    name?: string;
    balance?: number;
    direction: Direction;
  }): Account {
    if (!isValidDirection(data.direction)) {
      throw new Error(`Direction must be either 'debit' or 'credit'`);
    }

    const account: Account = {
      id: data.id || uuidv4(),
      name: data.name,
      balance: data.balance || 0,
      direction: data.direction,
    };

    this.accounts.set(account.id, account);
    return account;
  }

  getAccount(id: string): Account | null {
    return this.accounts.get(id) || null;
  }

  createTransaction(data: {
    id?: string;
    name?: string;
    entries: Array<LedgerEntry>;
  }): Transaction {
    // Validate entries exist
    if (!Array.isArray(data.entries) || data.entries.length === 0) {
      throw new Error("Transaction must have at least one entry");
    }

    // Validate all entries have required fields
    for (const entry of data.entries) {
      if (!entry.account_id) {
        throw new Error("Each entry must have an account_id");
      }
      if (!isValidDirection(entry.direction)) {
        throw new Error('Entry direction must be either "debit" or "credit"');
      }
      if (!isPositiveNumber(entry.amount)) {
        throw new Error("Entry amount must be a positive number");
      }
    }

    // Validate accounts exist
    for (const entry of data.entries) {
      if (!this.accounts.has(entry.account_id)) {
        throw new Error(`Account ${entry.account_id} does not exist`);
      }
    }

    // Validate double-entry balancing
    const debits = data.entries
      .filter((e) => e.direction === "debit")
      .reduce((sum, e) => sum + e.amount, 0);

    const credits = data.entries
      .filter((e) => e.direction === "credit")
      .reduce((sum, e) => sum + e.amount, 0);

    if (Math.abs(debits - credits) > 0.0001) {
      throw new Error(
        "Transaction entries must balance (debits must equal credits)"
      );
    }

    // Create transaction with generated IDs for entries
    const entries: LedgerEntry[] = data.entries.map((e) => ({
      id: uuidv4(),
      direction: e.direction,
      amount: e.amount,
      account_id: e.account_id,
    }));

    const transaction: Transaction = {
      id: data.id || uuidv4(),
      name: data.name,
      entries,
    };

    // Apply entries to accounts
    for (const entry of entries) {
      this.applyEntryToAccount(entry);
    }

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  private applyEntryToAccount(entry: LedgerEntry): void {
    const account = this.accounts.get(entry.account_id);
    if (!account) return;

    // If directions match, add; if they differ, subtract
    const isSameDirection = account.direction === entry.direction;
    account.balance += isSameDirection ? entry.amount : -entry.amount;
  }
}
