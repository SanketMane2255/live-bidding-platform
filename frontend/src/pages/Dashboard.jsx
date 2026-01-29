import React,{ useState, useEffect } from 'react';
import { Gavel, Wifi, WifiOff } from 'lucide-react';
import { AuctionCard } from '../components/AuctionCard';
import { useSocket } from '../hooks/useSocket';
import { fetchAuctionItems } from '../services/api';

export function Dashboard() {
  const [items, setItems] = useState([]);
  const [serverTime, setServerTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isConnected, placeBid, on, off } = useSocket();

  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const handleBidUpdate = (data) => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === data.itemId
            ? {
                ...item,
                currentBid: data.currentBid,
                highestBidderId: data.highestBidderId,
              }
            : item
        )
      );
      setServerTime(data.serverTime);
    };

    const handleBidError = (data) => {
      alert(data.message || 'Bid failed. Please try again.');
      console.error('Bid error:', data);
    };

    const handleAuctionEnded = (data) => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === data.itemId ? { ...item, status: 'ended' } : item
        )
      );
    };

    on('UPDATE_BID', handleBidUpdate);
    on('BID_ERROR', handleBidError);
    on('AUCTION_ENDED', handleAuctionEnded);

    return () => {
      off('UPDATE_BID', handleBidUpdate);
      off('BID_ERROR', handleBidError);
      off('AUCTION_ENDED', handleAuctionEnded);
    };
  }, [on, off]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAuctionItems();
      setItems(data.items);
      setServerTime(data.serverTime);
    } catch (err) {
      setError('Failed to load auction items. Please refresh the page.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <div className="text-red-600 text-center mb-4">
            <p className="font-semibold text-lg">{error}</p>
          </div>
          <button
            onClick={loadItems}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gavel className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Live Auction
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Real-time bidding platform
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">
                    Disconnected
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No auctions available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <AuctionCard
                key={item.id}
                item={item}
                serverTime={serverTime}
                onPlaceBid={placeBid}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
