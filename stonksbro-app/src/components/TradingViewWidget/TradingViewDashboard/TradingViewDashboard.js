import React, { useState, useEffect, useRef, memo } from 'react';
import './TradingViewDashboard.css';

function TradingViewDashboard() {
  const container = useRef(null);
  const [watchlist, setWatchlist] = useState(['AAPL', 'IBM', 'TSLA', 'AMD', 'MSFT', 'GOOG']);
  const [newSymbol, setNewSymbol] = useState('');

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      watchlist: watchlist,
      autosize: true,
      width: '100%',
      height: '100%',
      symbol: 'NASDAQ:AAPL',
      interval: 'D',
      timezone: 'exchange',
      theme: 'dark',
      style: '1',
      withdateranges: true,
      allow_symbol_change: true,
      save_image: false,
      support_host: 'https://www.tradingview.com',
    });

    container.current.appendChild(script);
  }, [watchlist]);

  const addSymbol = () => {
    if (newSymbol && !watchlist.includes(newSymbol.toUpperCase())) {
      setWatchlist([...watchlist, newSymbol.toUpperCase()]);
      setNewSymbol('');
    }
  };

  const removeSymbol = (symbol) => {
    setWatchlist(watchlist.filter(item => item !== symbol));
  };

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: '100%', width: '100%' }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: '100%', width: '100%' }}
      ></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noreferrer nofollow"
          target="_blank"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewDashboard);