import React, { useState, useEffect, useRef, memo } from 'react';

function TradingViewDashboard() {
  const container = useRef(null);
  const [watchlist, setWatchlist] = useState(['AAPL', 'IBM', 'TSLA', 'AMD', 'MSFT']);
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
      theme: 'light',
      style: '1',
      withdateranges: true,
      allow_symbol_change: true,
      save_image: false,
      "details": true,
      "hide_side_toolbar": false,
      support_host: 'https://www.tradingview.com',
    });

    container.current.appendChild(script);
  }, [watchlist]);

  /* const addSymbol = () => {
    if (newSymbol && !watchlist.includes(newSymbol.toUpperCase())) {
      setWatchlist([...watchlist, newSymbol.toUpperCase()]);
      setNewSymbol('');
    }
  };

  const removeSymbol = (symbol) => {
    setWatchlist(watchlist.filter(item => item !== symbol));
  }; */

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
    >
      <div
        className="tradingview-widget-container__widget"
      ></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noreferrer nofollow"
          target="_blank"
        >
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewDashboard);