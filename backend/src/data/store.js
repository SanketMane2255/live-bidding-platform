export class AuctionStore {
  constructor() {
    this.items = this.initializeItems();
    this.bidHistory = [];
  }

  initializeItems() {
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    const threeHours = 3 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const fourHours = 4 * 60 * 60 * 1000;
    const ninetyMinutes = 90 * 60 * 1000;
    const fiveHours = 5 * 60 * 60 * 1000;

    return new Map([
      [
        '1',
        {
          id: '1',
          title: 'iPhone 15 Pro Max',
          description: 'Brand new iPhone 15 Pro Max 256GB in Titanium Blue',
          startingPrice: 50000,
          currentBid: 50000,
          highestBidderId: null,
          endsAt: new Date(now + twoHours).toISOString(),
          status: 'active',
          createdAt: new Date(now).toISOString(),
        },
      ],
      [
        '2',
        {
          id: '2',
          title: 'MacBook Pro M3',
          description: 'Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD',
          startingPrice: 120000,
          currentBid: 120000,
          highestBidderId: null,
          endsAt: new Date(now + threeHours).toISOString(),
          status: 'active',
          createdAt: new Date(now).toISOString(),
        },
      ],
      [
        '3',
        {
          id: '3',
          title: 'Sony WH-1000XM5',
          description: 'Premium noise cancelling wireless headphones',
          startingPrice: 15000,
          currentBid: 15000,
          highestBidderId: null,
          endsAt: new Date(now + oneHour).toISOString(),
          status: 'active',
          createdAt: new Date(now).toISOString(),
        },
      ],
      [
        '4',
        {
          id: '4',
          title: 'iPad Air',
          description: 'iPad Air 5th generation with M1 chip, 64GB WiFi',
          startingPrice: 35000,
          currentBid: 35000,
          highestBidderId: null,
          endsAt: new Date(now + fourHours).toISOString(),
          status: 'active',
          createdAt: new Date(now).toISOString(),
        },
      ],
      [
        '5',
        {
          id: '5',
          title: 'AirPods Pro 2',
          description: 'Latest AirPods Pro with USB-C charging case',
          startingPrice: 18000,
          currentBid: 18000,
          highestBidderId: null,
          endsAt: new Date(now + ninetyMinutes).toISOString(),
          status: 'active',
          createdAt: new Date(now).toISOString(),
        },
      ],
      [
        '6',
        {
          id: '6',
          title: 'Samsung Galaxy Watch 6',
          description: 'Samsung Galaxy Watch 6 Classic 47mm',
          startingPrice: 25000,
          currentBid: 25000,
          highestBidderId: null,
          endsAt: new Date(now + fiveHours).toISOString(),
          status: 'active',
          createdAt: new Date(now).toISOString(),
        },
      ],
    ]);
  }

  getItems() {
    const items = Array.from(this.items.values()).map((item) => ({
      ...item,
    }));
    return items;
  }

  getItem(itemId) {
    return this.items.get(itemId) || null;
  }

  updateItem(itemId, updates) {
    const item = this.items.get(itemId);
    if (item) {
      const updated = { ...item, ...updates };
      this.items.set(itemId, updated);
      return updated;
    }
    return null;
  }

  recordBid(itemId, bidderId, bidAmount, status = 'accepted') {
    this.bidHistory.push({
      id: `bid_${Date.now()}_${Math.random()}`,
      itemId,
      bidderId,
      bidAmount,
      bidTime: new Date().toISOString(),
      status,
    });
  }

  checkExpiredAuctions() {
    const now = Date.now();
    const expired = [];

    for (const [id, item] of this.items.entries()) {
      if (item.status === 'active') {
        const endTime = new Date(item.endsAt).getTime();
        if (now >= endTime) {
          this.updateItem(id, { status: 'ended' });
          expired.push(item);
        }
      }
    }

    return expired;
  }
}

export const store = new AuctionStore();
