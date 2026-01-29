# Real-Time Live Bidding Platform

A production-ready real-time auction platform showcasing core system design concepts: real-time communication, race condition handling, and server-time synchronization. Built with in-memory data for clean, focused demonstration of these critical concepts.

## Features

- **Real-time Bidding**: Instant bid updates using Socket.io WebSocket
- **Race Condition Protection**: Per-item in-memory locking ensures only one bid succeeds per millisecond
- **Server-synced Countdown**: Timer synchronized with server to prevent client-side hacks
- **Visual Feedback**:
  - Green flash when you place a winning bid
  - Red flash when outbid
  - Trophy badge for highest bidder
  - Urgent animation in final seconds
- **Clean In-Memory Architecture**: Single source of truth, no database overhead

## Architecture Overview

This project demonstrates how to build real-time systems correctly:

### 1. Race Condition Handling (Core)

Per-item mutex locks prevent concurrent bid conflicts:

```javascript
// Only one bid per item at a time
if (this.itemLocks.has(itemId)) {
  throw new Error('Bid already processing');
}

// Acquire lock
this.itemLocks.set(itemId, true);
try {
  // Atomic operations
  const newBid = currentBid + increment;
  store.updateItem(itemId, { currentBid: newBid, winner: userId });
  broadcast UPDATE_BID to all clients;
} finally {
  // Release lock
  this.itemLocks.delete(itemId);
}
```

Result: 100 simultaneous bids → 1 accepted, 99 get "Outbid" error instantly.

### 2. Time Synchronization

Counters work across all devices correctly:

```javascript
// Server sends time with every response
GET /items → { serverTime: 1704067200000, items: [...] }

// Client calculates offset
offset = serverTime - Date.now()

// Countdown uses adjusted time
remainingMs = auctionEnd - (Date.now() + offset)
```

Benefits:
- Prevents clock manipulation
- Accurate auction end detection
- Synced experience across browsers

### 3. Real-Time Events

Socket.io handles instant updates:

**BID_PLACED** (Client → Server)
- Validate bid
- Check auction active
- Acquire lock
- Update state
- Broadcast UPDATE_BID to all

**UPDATE_BID** (Server → All)
- New highest bid
- Server timestamp
- All clients update UI instantly

**BID_ERROR** (Server → Bidder)
- "Outbid" message
- No UI refresh needed

**AUCTION_ENDED** (Server → All)
- Auction finished
- Disable buttons
- Show final price

## Tech Stack

**Backend**
- Node.js + Express
- Socket.io (real-time)
- In-memory data store
- Per-item mutex locking

**Frontend**
- React + Vite
- Socket.io-client
- Tailwind CSS
- Lucide icons


### Local Development

1. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. **Start backend** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```
   Runs on http://localhost:4000

3. **Start frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   Runs on http://localhost:5173

4. **Test bidding**
   - Open multiple browser tabs
   - Bid simultaneously
   - Observe race condition protection in action


## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── server.js              # Express + Socket.io setup
│   │   ├── socket.js              # Real-time event handlers
│   │   ├── services/
│   │   │   └── auction.service.js # Bidding with locking
│   │   ├── data/
│   │   │   └── store.js           # In-memory data store
│   │   └── routes/
│   │       └── items.routes.js    # REST API
│   ├
│   └── package.json
├── frontend
│   │
│   src/
│   ├── components/
│   │   ├── AuctionCard.jsx        # Item card with bid button
│   │   └── CountdownTimer.jsx     # Server-synced timer
│   ├── hooks/
│   │   └── useSocket.js           # Socket.io integration
│   ├── pages/
│   │   └── Dashboard.jsx          # Main UI
│   ├── services/
│   │   └── api.js                 # REST client
│   └── App.jsx