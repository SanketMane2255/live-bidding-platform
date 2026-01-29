import React,{ useState, useEffect } from 'react';
import { Trophy, Clock, TrendingUp } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

export function AuctionCard({
  item,
  serverTime,
  onPlaceBid,
  currentUserId,
}) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashColor, setFlashColor] = useState('green');
  const [isEnded, setIsEnded] = useState(false);
  const [isBidding, setIsBidding] = useState(false);

  const isWinning = item.highestBidderId === currentUserId;
  const bidIncrement = 10;

  useEffect(() => {
    const now = Date.now();
    const endTime = new Date(item.endsAt).getTime();
    if (now >= endTime || item.status === 'ended') {
      setIsEnded(true);
    }
  }, [item.endsAt, item.status]);

  useEffect(() => {
    if (item.highestBidderId && item.highestBidderId !== currentUserId) {
      setFlashColor('red');
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 800);
      return () => clearTimeout(timer);
    } else if (item.highestBidderId === currentUserId) {
      setFlashColor('green');
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [item.currentBid, item.highestBidderId, currentUserId]);

  const handleBid = async () => {
    if (isEnded || isBidding) return;

    setIsBidding(true);
    try {
      await onPlaceBid(item.id, bidIncrement);
    } catch (error) {
      console.error('Bid error:', error);
    } finally {
      setTimeout(() => setIsBidding(false), 500);
    }
  };

  const handleExpire = () => {
    setIsEnded(true);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 ${
        isFlashing
          ? flashColor === 'green'
            ? 'border-green-500 animate-pulse'
            : 'border-red-500 animate-pulse'
          : isWinning && !isEnded
          ? 'border-green-400'
          : 'border-gray-200'
      }`}
    >
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
          {isWinning && !isEnded && (
            <Trophy className="w-6 h-6 text-yellow-300 flex-shrink-0 ml-2" />
          )}
        </div>
        {item.description && (
          <p className="text-blue-100 text-sm">{item.description}</p>
        )}
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">
              Current Bid
            </span>
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <CountdownTimer
                endsAt={item.endsAt}
                serverTime={serverTime}
                onExpire={handleExpire}
              />
            </div>
          </div>
          <div
            className={`text-3xl font-bold transition-colors duration-300 ${
              isFlashing
                ? flashColor === 'green'
                  ? 'text-green-600'
                  : 'text-red-600'
                : 'text-gray-900'
            }`}
          >
            ₹{item.currentBid.toLocaleString()}
          </div>
        </div>

        <div className="mb-4">
          {isWinning && !isEnded ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
              <Trophy className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700 font-semibold text-sm">
                You're winning!
              </span>
            </div>
          ) : item.highestBidderId && item.highestBidderId !== currentUserId && !isEnded ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
              <TrendingUp className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700 font-semibold text-sm">
                Outbid
              </span>
            </div>
          ) : isEnded ? (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
              <span className="text-gray-600 font-semibold text-sm">
                Auction Ended
              </span>
            </div>
          ) : null}
        </div>

        <button
          onClick={handleBid}
          disabled={isEnded || isBidding}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 transform ${
            isEnded
              ? 'bg-gray-400 cursor-not-allowed'
              : isBidding
              ? 'bg-blue-400 cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-lg'
          }`}
        >
          {isEnded
            ? 'Ended'
            : isBidding
            ? 'Placing Bid...'
            : `Bid +₹${bidIncrement}`}
        </button>

        <div className="mt-3 text-center text-xs text-gray-500">
          Starting Price: ₹{item.startingPrice.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
