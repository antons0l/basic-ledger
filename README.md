# Basic Ledger
A double-entry accounting ledger API built with TypeScript and Node.js.

## Overview

This is a complete implementation of a double-entry accounting ledger system that ensures all transactions balance and account balances are updated correctly according to accounting principles.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript:
   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. For development with auto-reload:
    ```bash
    npm run dev
    ```

The server will start on `http://localhost:5000` by default. You can set a custom port with the `PORT` environment variable.

## API Documentation

### POST /accounts

Create a new account.

**Request Body:**
- `id` (optional): UUID for the account. Generated if not provided.
- `name` (optional): Label for the account.
- `balance` (optional): Initial balance. Defaults to 0.
- `direction` (required): Either `"debit"` or `"credit"`.

**Request:**
```bash
curl -X POST http://localhost:5000/accounts \
  -H 'Content-Type: application/json' \
  -d '{"name": "Checking", "direction": "debit"}'
```

**Response (201):**
```json
{
  "id": "71cde2aa-b9bc-496a-a6f1-34964d05e6fd",
  "name": "Checking",
  "balance": 0,
  "direction": "debit"
}
```

### GET /accounts/:id

Retrieve an account by ID.

**Request:**
```bash
curl http://localhost:5000/accounts/71cde2aa-b9bc-496a-a6f1-34964d05e6fd
```

**Response (200):**
```json
{
  "id": "71cde2aa-b9bc-496a-a6f1-34964d05e6fd",
  "name": "Checking",
  "balance": 100,
  "direction": "debit"
}
```

**Response (404):**
```json
{
  "error": "Account not found"
}
```

### POST /transactions

Create a new transaction with balanced entries.

**Request Body:**
- `id` (optional): UUID for the transaction. Generated if not provided.
- `name` (optional): Label for the transaction.
- `entries` (required): Array of ledger entries. Must balance (sum of debits = sum of credits).
    - `account_id` (required): ID of the account to affect.
    - `direction` (required): Either `"debit"` or `"credit"`.
    - `amount` (required): Positive number representing the amount.


**Request:**
```bash
curl -X POST http://localhost:5000/transactions \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Withdraw cash",
    "entries": [
      {"account_id": "71cde2aa-b9bc-496a-a6f1-34964d05e6fd", "direction": "debit", "amount": 100},
      {"account_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "direction": "credit", "amount": 100}
    ]
  }'
```

**Response (201):**
```json
{
  "id": "3256dc3c-7b18-4a21-95c6-146747cf2971",
  "name": "Withdraw cash",
  "entries": [
    {
      "id": "9f694f8c-9c4c-44cf-9ca9-0cb1a318f0a7",
      "account_id": "71cde2aa-b9bc-496a-a6f1-34964d05e6fd",
      "direction": "debit",
      "amount": 100
    },
    {
      "id": "a5c1b7f0-e52e-4ab6-8f31-c380c2223efa",
      "account_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "direction": "credit",
      "amount": 100
    }
  ]
}
```

**Response (400):**
```json
{
  "error": "Transaction entries must balance (debits must equal credits)"
}
```

## Key Features

- ✅ Double-entry accounting enforcement (debits = credits)
- ✅ Correct balance updates based on account and entry directions
- ✅ UUID generation for accounts and transactions
- ✅ Input validation and error handling
- ✅ In-memory storage (no external dependencies)
- ✅ Type-safe with TypeScript
- ✅ RESTful API design

## Testing the API

### Example Workflow

1. Create two accounts:
```bash
curl -X POST http://localhost:5000/accounts \
  -H 'Content-Type: application/json' \
  -d '{"name": "Checking", "direction": "debit"}'

curl -X POST http://localhost:5000/accounts \
  -H 'Content-Type: application/json' \
  -d '{"name": "Cash", "direction": "debit"}'
```

2. Create a transaction moving money between them:
```bash
curl -X POST http://localhost:5000/transactions \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Withdraw cash",
    "entries": [
      {"account_id": "CHECKING_ID", "direction": "debit", "amount": 50},
      {"account_id": "CASH_ID", "direction": "credit", "amount": 50}
    ]
  }'
```

3. Check account balances, the Checking account should have 50 and 
the Cash account should have -50.
```bash
curl http://localhost:5000/accounts/CHECKING_ID
curl http://localhost:5000/accounts/CASH_ID
```


## What can be improved

- Database persistence (PostgreSQL recommended)
- Lock mechanism for transactions to avoid race condition
- Query transactions by date range
- Add comprehensive tests
