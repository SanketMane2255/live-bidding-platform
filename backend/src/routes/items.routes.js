import express from 'express';
import auctionService from '../services/auction.service.js';

const router = express.Router();

router.get('/items', async (req, res) => {
  try {
    await auctionService.checkExpiredAuctions();

    const items = await auctionService.getAuctionItems();
    const serverTime = Date.now();

    res.json({
      serverTime,
      items,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      error: 'Failed to fetch auction items',
      message: error.message,
    });
  }
});

router.get('/items/:id', async (req, res) => {
  try {
    const item = await auctionService.getAuctionItem(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({
      serverTime: Date.now(),
      item,
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      error: 'Failed to fetch auction item',
      message: error.message,
    });
  }
});

export default router;
