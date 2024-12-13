# NETOPIA Payment Package - Sample Application

This is a sample JS application demonstrating the integration with the NETOPIA Payment Package using the [NPM Package](https://www.npmjs.com/package/netopia-payment2).

## Features

- **Start Payment**: Initiates a payment request with necessary configurations.
- **Check Payment Status**: Queries the payment status based on transaction and order IDs.
- **IPN Verification**: Processes and validates IPN (Instant Payment Notification) messages from NETOPIA.

## Requirements

- Node.js version 20.11.1 or higher
- [NETOPIA Payment Package](https://www.npmjs.com/package/netopia-payment2)
- `.env` file for configuration

## Installation

1. Clone the repository:

   ```bash
    git clone https://github.com/netopiapayments/sample-app-js.git
    cd sample-app-js
   ```

2. Install dependencies:

   ```bash
    npm install
   ```

3. Create a `.env` file in the root directory

   ```bash
    cp .env.sample .env
   ```

4. Run the application:
   ```bash
   npm start
   ```

## Methods

### 1. `createOrder` (POST)

**Description:** Initiates a payment request.

**Response:**

- On success, returns the payment URL to complete the transaction.

---

### 2. `verify` (POST)

**Description:** Processes Instant Payment Notifications (IPN) from Netopia.

**Response:**

- Validates the IPN and returns a confirmation response.

---

### 3. `getStatus` (POST)

**Description:** Retrieves the status of a payment.

**Payload:**

```json
{
  "ntpID": "NTPTXN123",
  "orderID": "ORDER-12345"
}
```

**Response:**

- Returns the current status of the payment.

---

## Project Structure

```
.
├── app
│   └── db
|       └── orders.db               # Local database for storing order details
|   └── public                      # Static files (CSS, JS, images)
|   └── routes
|       └── cart.js                 # Route for handling create order requests
|       └── confirmation.js         # Route for handling payment status
|       └── index.js                # Main entry point of the application
|       └── ipn.js                  # Route for handling IPN notifications
|       └── orders.js               # Route for handling order operations
|       └── products.js             # Route for handling products operations
|   └── views                       # HTML templates for rendering pages
├── lib
│   └── netopia.js                  # Netopia Payment and IPN Configuration
├── package.json                    # This file contains metadata about the project, including dependencies (npm packages), scripts for running tasks, and configuration settings
└── .env                            # Environment variables
```

## Usage Notes

- The application is configured to run in **sandbox mode** by default (`isLive: false`). Switch to live mode by setting `isLive: true` in the `> lib > netopia.js` file.
- The `notifyUrl` and `redirectUrl` must be publicly accessible for production use.
