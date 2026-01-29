import auctionService from './services/auction.service.js';

export function initializeSocketHandlers(io) {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    connectedUsers.set(socket.id, {
      userId: socket.handshake.query.userId || socket.id,
      connectedAt: Date.now(),
    });

    socket.emit('connected', {
      socketId: socket.id,
      serverTime: Date.now(),
    });

    socket.on('BID_PLACED', (data) => {
      try {
        const { itemId, bidIncrement } = data;
        const user = connectedUsers.get(socket.id);
        const bidderId = user?.userId || socket.id;

        if (!itemId || !bidIncrement) {
          socket.emit('BID_ERROR', {
            message: 'Invalid bid data',
            serverTime: Date.now(),
          });
          return;
        }

        if (bidIncrement <= 0) {
          socket.emit('BID_ERROR', {
            message: 'Bid increment must be positive',
            serverTime: Date.now(),
          });
          return;
        }

        const result = auctionService.placeBid(
          itemId,
          bidderId,
          bidIncrement
        );

        io.emit('UPDATE_BID', {
          itemId: result.id,
          currentBid: result.currentBid,
          highestBidderId: result.highestBidderId,
          serverTime: Date.now(),
        });

        console.log(
          `💰 Bid placed: ${result.title} - ₹${result.currentBid} by ${bidderId}`
        );
      } catch (error) {
        console.error('Bid error:', error.message);

        socket.emit('BID_ERROR', {
          message: error.message,
          serverTime: Date.now(),
        });
      }
    });

    socket.on('CHECK_AUCTIONS', () => {
      try {
        const expiredAuctions = auctionService.checkExpiredAuctions();

        expiredAuctions.forEach((auction) => {
          io.emit('AUCTION_ENDED', {
            itemId: auction.id,
            finalBid: auction.currentBid,
            winnerId: auction.highestBidderId,
            serverTime: Date.now(),
          });
        });
      } catch (error) {
        console.error('Error checking auctions:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      connectedUsers.delete(socket.id);
    });
  });

  setInterval(() => {
    try {
      const expiredAuctions = auctionService.checkExpiredAuctions();

      expiredAuctions.forEach((auction) => {
        io.emit('AUCTION_ENDED', {
          itemId: auction.id,
          finalBid: auction.currentBid,
          winnerId: auction.highestBidderId,
          serverTime: Date.now(),
        });
      });
    } catch (error) {
      console.error('Error in auction check interval:', error);
    }
  }, 10000);
}
