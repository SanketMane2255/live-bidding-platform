import { store } from '../data/store.js';

class AuctionService {
  constructor() {
    this.itemLocks = new Map();
  }

  getAuctionItems() {
    return store.getItems();
  }

  getAuctionItem(itemId) {
    return store.getItem(itemId);
  }

  placeBid(itemId, bidderId, bidIncrement) {
    const lockKey = itemId;

    if (this.itemLocks.has(lockKey)) {
      throw new Error('Another bid is being processed. Please try again.');
    }

    this.itemLocks.set(lockKey, true);

    try {
      const item = store.getItem(itemId);

      if (!item) {
        throw new Error('Auction item not found');
      }

      const now = Date.now();
      const endsAt = new Date(item.endsAt).getTime();

      if (now >= endsAt || item.status !== 'active') {
        throw new Error('Auction has ended');
      }

      const newBidAmount = Number(item.currentBid) + Number(bidIncrement);

      if (newBidAmount <= item.currentBid) {
        throw new Error('Bid must be higher than current bid');
      }

      const updatedItem = store.updateItem(itemId, {
        currentBid: newBidAmount,
        highestBidderId: bidderId,
      });

      store.recordBid(itemId, bidderId, newBidAmount, 'accepted');

      console.log(
        `💰 Bid placed: ${updatedItem.title} - ₹${updatedItem.currentBid} by ${bidderId}`
      );

      return updatedItem;
    } finally {
      this.itemLocks.delete(lockKey);
    }
  }

  endAuction(itemId) {
    const item = store.getItem(itemId);
    if (item) {
      return store.updateItem(itemId, { status: 'ended' });
    }
    return null;
  }

  checkExpiredAuctions() {
    return store.checkExpiredAuctions();
  }
}

export default new AuctionService();
