/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadZone } from './components/UploadZone';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { analyzeTradeScreenshot, AnalysisResult } from './services/analyzerService';
import { TrendingUp, ShieldCheck, Zap, BarChart3, AlertCircle, Bell, BellOff, Sun, Moon, Laptop, X, ShieldAlert, CheckCircle } from 'lucide-react';
import { useTheme } from './components/ThemeProvider';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  useEffect(() => {
    const checkMarketHours = () => {
      // Indian Market Hours (9:15 AM - 3:30 PM IST)
      const now = new Date();
      const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const istDate = new Date(istString);
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const day = istDate.getDay();

      if (day >= 1 && day <= 5) { // Mon-Fri
        const timeInMinutes = hours * 60 + minutes;
        const openTime = 9 * 60 + 15;
        const closeTime = 15 * 60 + 30;
        setIsMarketOpen(timeInMinutes >= openTime && timeInMinutes <= closeTime);
      } else {
        setIsMarketOpen(false);
      }
    };

    checkMarketHours();
    const interval = setInterval(checkMarketHours, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("File reading failed"));
        reader.readAsDataURL(file);
      });

      const result = await analyzeTradeScreenshot(base64);
      
      // Notify for Best Trades
      if (result.isBestTrade && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("🔥 A+ SETUP DETECTED", {
            body: `Tradezy: ${result.tradeType} signal detected for ${result.symbol || 'Market'}. Act within ${result.validityMinutes}m.`,
            icon: "/favicon.ico"
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission();
        }
      }

      // Keep only last 5 analyses
      setHistory(prev => [result, ...prev].slice(0, 5));
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("API key")) {
        setError("Missing or invalid API Key. Please configure GEMINI_API_KEY.");
      } else {
        setError("Analysis failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const currentAnalysis = history[0];

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-500 overflow-x-hidden">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="blob" style={{ top: '10%', left: '10%' }}></div>
        <div className="blob" style={{ bottom: '10%', right: '10%', animationDelay: '-5s' }}></div>
      </div>
      
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 tech-grid pointer-events-none -z-10 text-foreground" />
      
      {/* Navigation */}
      <nav className="h-16 border-b border-border bg-background/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:rotate-12 hover:scale-110 shadow-lg shadow-primary/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="font-bold tracking-tighter text-lg md:text-xl truncate text-foreground uppercase leading-none">TRADEZY<span className="text-primary">.AI</span></span>
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none mt-1">Global Institutional v4</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight transition-all duration-500 scale-95 hover:scale-100 ${
            isMarketOpen 
            ? 'bg-green-500/10 text-green-600 border-green-500/20' 
            : 'bg-muted text-muted-foreground border-border'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}></span>
            {isMarketOpen ? 'NSE Live' : 'Market Closed'}
          </div>

          <div className="hidden sm:block h-4 w-px bg-border mx-2"></div>

          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-muted transition-all text-foreground border border-transparent hover:border-border active:scale-95"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 rounded-xl hover:bg-muted transition-all text-foreground border border-transparent hover:border-border relative active:scale-95"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {history.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background ring-2 ring-primary/20"></span>
            )}
          </button>

          <button 
            onClick={requestNotificationPermission}
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold border uppercase tracking-tight transition-all hover:shadow-lg active:scale-95 ${
              notificationStatus === 'granted' 
              ? 'bg-primary text-primary-foreground border-primary shadow-primary/20' 
              : 'bg-transparent text-muted-foreground border-border'
            }`}
          >
            {notificationStatus === 'granted' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
            {notificationStatus === 'granted' ? 'Protected' : 'Enable Alerts'}
          </button>
        </div>
      </nav>

      {/* Notification Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full max-w-sm bg-card border-l border-border z-[70] shadow-2xl overflow-y-auto"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Notification Center</h2>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Real-time Signals</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  {history.length > 0 ? (
                    history.map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-xl border flex flex-col gap-2 transition-all cursor-pointer hover:border-foreground/40 group ${idx === 0 ? 'bg-muted/50 border-border' : 'bg-transparent border-border/60'}`}
                        onClick={() => {
                          setHistory(prev => {
                            const newHistory = [...prev];
                            const selected = newHistory.splice(idx, 1)[0];
                            return [selected, ...newHistory];
                          });
                          setIsSidebarOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.tradeType === 'CALL' ? 'bg-primary' : item.tradeType === 'PUT' ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                            <span className="text-[11px] font-black tracking-tight text-foreground uppercase">
                              {item.tradeType} SIGNAL
                            </span>
                          </div>
                          {item.isBestTrade && (
                            <div className="flex items-center gap-1 bg-foreground text-background px-2 py-0.5 rounded text-[8px] font-black uppercase">
                              <Zap className="w-2.5 h-2.5 fill-background" />
                              A+
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] font-bold text-foreground/90 uppercase">{item.symbol || 'MARKET'}</span>
                          <span className="text-[9px] font-bold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            {item.marketContext || 'NSE'}
                          </span>
                        </div>
                        <div className="text-[9px] text-muted-foreground font-medium flex items-center justify-between mt-2">
                           <span>Confidence: {item.confidence}%</span>
                           <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                      <BellOff className="w-12 h-12 text-foreground" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">No active signals</p>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">Upload a chart screenshot to generate institutional diagnostics.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="p-4 bg-muted rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      System Status
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground font-medium">Neural Engine</span>
                        <span className="text-foreground font-bold">OPTIMIZED</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground font-medium">Security Layer</span>
                        <span className="text-foreground font-bold uppercase">{notificationStatus === 'granted' ? 'ACTIVE' : 'IDLE'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12 space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-bold text-foreground tracking-[0.2em] uppercase"
          >
            Institutional Grade Analysis
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-[0.9]">
            PRECISION <span className="text-muted-foreground italic">SPECULATION.</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
            Upload chart captures to extract signal confluence, trend bias, and execution levels using neural network pattern recognition.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Main Slot */}
          <div className="w-full space-y-8">
            <UploadZone onUpload={handleFileUpload} isLoading={loading} />
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive text-xs font-bold uppercase tracking-tight"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Error: {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {currentAnalysis && !loading && (
                <AnalysisDisplay key={history.length} result={currentAnalysis} />
              )}
            </AnimatePresence>

            {/* How it Works / Features */}
            {!currentAnalysis && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
              >
                {[
                  { 
                    icon: <Zap className="w-5 h-5 text-primary" />, 
                    title: "Pattern Recognition", 
                    desc: "Neural networks identify candle structures, trendlines, and breakout zones instantly." 
                  },
                  { 
                    icon: <ShieldCheck className="w-5 h-5 text-primary" />, 
                    title: "Logic Confluence", 
                    desc: "Aggregate technical indicators to verify signal strength across multiple data points." 
                  },
                  { 
                    icon: <TrendingUp className="w-5 h-5 text-primary" />, 
                    title: "Risk Calibration", 
                    desc: "Automated stop-loss and take-profit levels calculated based on market volatility." 
                  }
                ].map((feature, i) => (
                  <div key={i} className="p-6 rounded-2xl glass-card border border-border/50 space-y-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1 uppercase tracking-tight">{feature.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card/30 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="font-bold tracking-tighter text-lg text-foreground uppercase">TRADEZY<span className="text-primary">.AI</span></span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm font-medium leading-relaxed">
                Empowering global traders with institutional-grade neural pattern recognition. Trade with precision, clarity, and institutional logic.
              </p>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Platform</h5>
              <ul className="space-y-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                <li className="hover:text-primary cursor-pointer transition-colors">Neural Engine</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Integrations</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Risk Protocol</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Compliance</h5>
              <ul className="space-y-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                <li className="hover:text-primary cursor-pointer transition-colors">Terms of Speculation</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Privacy Shield</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Security Layer</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">
              <span>&copy; 2026 Tradezy Global</span>
              <span className="hidden sm:inline">Built for Institutional Speculators</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Node: Asia-Cluster-01
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                VER: 4.2.1-STABLE
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
