'use client';

import { useEffect, useState } from 'react';

type Alert = {
  id: string;
  type: 'tvl' | 'whale' | 'volume' | 'sentiment';
  protocol: string;
  message: string;
  timestamp: number;
  severity: 'high' | 'medium' | 'low';
};

type ProtocolData = {
  name: string;
  tvl: number;
  tvlChange24h: number;
  volume24h: number;
  volumeChange24h: number;
};

export default function CryptoGemBot() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [protocols, setProtocols] = useState<ProtocolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'settings'>('dashboard');

  // Fetch DeFiLlama data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.llama.fi/protocols');
        const data = await response.json();
        
        // Get top 20 protocols by TVL
        const topProtocols = data
          .sort((a: any, b: any) => b.tvl - a.tvl)
          .slice(0, 20)
          .map((p: any) => ({
            name: p.name,
            tvl: p.tvl,
            tvlChange24h: p.change_1d || 0,
            volume24h: p.volume24h || 0,
            volumeChange24h: p.volumeChange24h || 0,
          }));
        
        setProtocols(topProtocols);
        
        // Generate alerts based on significant changes
        const newAlerts: Alert[] = [];
        topProtocols.forEach((protocol: ProtocolData) => {
          if (Math.abs(protocol.tvlChange24h) > 10) {
            newAlerts.push({
              id: `${protocol.name}-${Date.now()}`,
              type: 'tvl',
              protocol: protocol.name,
              message: `TVL ${protocol.tvlChange24h > 0 ? 'increased' : 'decreased'} by ${Math.abs(protocol.tvlChange24h).toFixed(2)}%`,
              timestamp: Date.now(),
              severity: Math.abs(protocol.tvlChange24h) > 20 ? 'high' : 'medium',
            });
          }
        });
        
        setAlerts(newAlerts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return `${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <h1 className="text-2xl font-bold">Crypto Gems Alert Bot</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-4 py-2 rounded-lg transition-all relative ${
                  activeTab === 'alerts'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Alerts
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'settings'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="text-sm text-gray-400 mb-2">Total Protocols Tracked</div>
                    <div className="text-3xl font-bold">{protocols.length}</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="text-sm text-gray-400 mb-2">Active Alerts</div>
                    <div className="text-3xl font-bold text-yellow-400">{alerts.length}</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="text-sm text-gray-400 mb-2">Total TVL</div>
                    <div className="text-3xl font-bold">
                      {formatNumber(protocols.reduce((sum, p) => sum + p.tvl, 0))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold mb-4">Top Protocols by TVL</h2>
                  <div className="space-y-3">
                    {protocols.map((protocol, index) => (
                      <div
                        key={protocol.name}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-gray-400 font-mono text-sm w-8">#{index + 1}</div>
                          <div>
                            <div className="font-semibold">{protocol.name}</div>
                            <div className="text-sm text-gray-400">
                              TVL: {formatNumber(protocol.tvl)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              protocol.tvlChange24h > 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {protocol.tvlChange24h > 0 ? '+' : ''}
                            {protocol.tvlChange24h.toFixed(2)}%
                          </div>
                          <div className="text-xs text-gray-400">24h change</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Active Alerts</h2>
                {alerts.length === 0 ? (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
                    <div className="text-6xl mb-4">🔔</div>
                    <div className="text-xl text-gray-400">No alerts at the moment</div>
                    <div className="text-sm text-gray-500 mt-2">
                      You'll be notified when significant market movements are detected
                    </div>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border-l-4 ${
                        alert.severity === 'high'
                          ? 'border-red-500'
                          : alert.severity === 'medium'
                          ? 'border-yellow-500'
                          : 'border-blue-500'
                      } border-t border-r border-b border-white/10`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                              {alert.type === 'tvl' && '📊'}
                              {alert.type === 'whale' && '🐋'}
                              {alert.type === 'volume' && '📈'}
                              {alert.type === 'sentiment' && '💭'}
                            </span>
                            <span className="font-semibold text-lg">{alert.protocol}</span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                alert.severity === 'high'
                                  ? 'bg-red-500/20 text-red-400'
                                  : alert.severity === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-gray-300">{alert.message}</div>
                          <div className="text-sm text-gray-500 mt-2">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Alert Settings</h2>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold mb-4">TVL Change Alerts</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Alert when TVL changes by more than:
                      </label>
                      <input
                        type="number"
                        defaultValue="10"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        placeholder="10"
                      />
                      <div className="text-xs text-gray-500 mt-1">Percentage change threshold</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold mb-4">Volume Alerts</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Alert when volume changes by more than:
                      </label>
                      <input
                        type="number"
                        defaultValue="20"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        placeholder="20"
                      />
                      <div className="text-xs text-gray-500 mt-1">Percentage change threshold</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                      <span>Enable browser notifications</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                      <span>Enable sound alerts</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5" />
                      <span>Email notifications (coming soon)</span>
                    </label>
                  </div>
                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-all">
                  Save Settings
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

