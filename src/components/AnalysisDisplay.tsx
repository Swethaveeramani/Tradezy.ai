import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AnalysisResult } from '../services/analyzerService';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  ShieldAlert, 
  ArrowUpRight,
  Info,
  Clock,
  CheckCircle2,
  Globe,
  Timer,
  Zap
} from 'lucide-react';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  key?: string | number;
}

export function AnalysisDisplay({ result }: AnalysisDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(result.validityMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTradeColor = () => {
    if (result.tradeType === 'CALL') return 'text-white border-green-500/20 bg-green-500/90 glow-call';
    if (result.tradeType === 'PUT') return 'text-white border-red-500/20 bg-red-500/90 glow-put';
    return 'text-foreground border-border bg-card';
  };

  const getSentimentIcon = () => {
    switch (result.sentiment) {
      case 'BULLISH': return <TrendingUp className="w-4 h-4" />;
      case 'BEARISH': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4 opacity-50" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-5xl mx-auto space-y-6 mt-12 mb-24"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recommendation Card */}
        <div className={`col-span-1 xl:col-span-1 border rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative shadow-2xl transition-all duration-500 ${getTradeColor()}`}>
           {result.isBestTrade && (
             <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 animate-pulse glass shadow-lg`}>
               <Zap className="w-3 h-3 fill-primary text-primary" />
               A+ SETUP
             </div>
           )}
           
           <div>
             <div className="text-[10px] uppercase tracking-widest mb-6 font-bold opacity-70">Analysis Outcome</div>
             <div className="flex items-end gap-3 mb-2">
               <span className="text-5xl sm:text-6xl font-black tracking-tighter leading-none">{result.tradeType}</span>
               <span className="text-[11px] font-black uppercase pb-2 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm">
                 {result.sentiment}
               </span>
             </div>
             {result.marketContext && (
               <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-90">
                 <Globe className="w-3.5 h-3.5" />
                 {result.marketContext}
               </div>
             )}
           </div>

           <div className="mt-10">
             <div className="text-[10px] font-bold uppercase mb-4 tracking-widest opacity-70">Signal Validity</div>
             <div className={`flex items-center gap-2 p-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-inner ${timeLeft < 60 ? 'animate-pulse' : ''}`}>
               <Timer className="w-5 h-5" />
               <span className="text-2xl font-mono font-bold tracking-tighter">{timeLeft > 0 ? formatTime(timeLeft) : 'EXPIRED'}</span>
               <span className="text-[10px] font-bold uppercase ml-auto opacity-70">Countdown</span>
             </div>
             
             <div className="mt-8 flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">Confidence Score</span>
                <span className="text-sm font-bold">{result.confidence}%</span>
             </div>
             <div className="w-full h-2 rounded-full overflow-hidden bg-black/10 backdrop-blur-sm">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: `${result.confidence}%` }}
                 className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
               />
             </div>
           </div>
        </div>

        {/* Market Stats */}
        <div className="col-span-1 xl:col-span-2 glass-card rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold tracking-widest text-primary font-mono uppercase">Neural Intelligence Feed</h4>
              <h3 className="text-xl font-bold tracking-tight">Signal Diagnostics</h3>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full text-[10px] font-bold text-muted-foreground border border-border uppercase">
              <Clock className="w-3.5 h-3.5" />
              Capture: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-2 group hover:border-primary/30 transition-colors">
              <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Entry</div>
              <div className="text-base font-bold text-primary font-mono tracking-tight truncate">{result.recommendedEntry || '---'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-2 group hover:border-destructive/30 transition-colors">
              <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Stop Loss</div>
              <div className="text-base font-bold text-destructive font-mono tracking-tight truncate">{result.stopLoss || '---'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-2 group hover:border-primary/30 transition-colors">
              <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Take Profit</div>
              <div className="text-base font-bold text-primary font-mono tracking-tight truncate">{result.takeProfit || '---'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-2 group hover:border-foreground/30 transition-colors">
              <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Bias</div>
              <div className="flex items-center gap-1.5 text-base font-bold uppercase">
                {getSentimentIcon()}
                {result.sentiment}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50">
            <div className="text-[10px] uppercase text-muted-foreground font-bold mb-4 tracking-widest">Detected Confluence</div>
            <div className="flex flex-wrap gap-2">
              {result.keyIndicators.map((indicator, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-[10px] text-foreground font-bold uppercase tracking-tight hover:bg-muted transition-colors">
                  {indicator}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rationale Section */}
        <div className="col-span-1 lg:col-span-2 glass-card border border-border/50 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">Institutional Rationale</h3>
                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-0.5 bg-primary"></span>
                  Pattern Logic
                </p>
              </div>
            </div>

            {result.symbol && (
              <div className="px-5 py-2.5 bg-foreground text-background rounded-2xl border border-foreground flex items-center gap-4 shadow-xl transition-transform hover:scale-105">
                <div className="text-[10px] font-black opacity-60 uppercase tracking-widest border-r border-background/20 pr-4">Focus</div>
                <div className="text-sm font-mono font-black uppercase tracking-tighter">{result.symbol}</div>
              </div>
            )}
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed text-[15px] font-medium selection:bg-primary/20">
              {result.explanation}
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="p-6 bg-muted/50 border border-border rounded-2xl space-y-4 flex-1">
                <div className="flex items-center gap-3 text-primary text-[11px] font-black uppercase tracking-[0.2em]">
                  <Target className="w-5 h-5" />
                  Terminal Execution
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                  Select your institutional bridge to transmit signals. Recommended allocation: 2-5% of core margin for {result.marketContext || 'NSE'} session.
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full sm:w-72">
                <button 
                  onClick={() => window.open(`https://kite.zerodha.com/chart/ext/tvc/NSE/${result.symbol?.replace(/\s+/g, '')}`, '_blank')}
                  className="w-full py-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-black text-xs tracking-[0.3em] transition-all shadow-lg active:scale-95 uppercase"
                >
                  Zerodha Kite
                </button>
                <button 
                  onClick={() => window.open('https://pro.upstox.com/', '_blank')}
                  className="w-full py-3.5 bg-transparent border-2 border-border text-foreground hover:bg-muted rounded-2xl font-black text-xs tracking-[0.3em] transition-all active:scale-95 uppercase"
                >
                  Upstox Pro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Prerequisites Checklist */}
        <div className="col-span-1 glass-card border border-border/50 rounded-2xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center border border-border/50">
              <CheckCircle2 className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">Pre-Flight</h3>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Safety Check</p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {result.checklist.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="flex items-start gap-4 p-4 bg-background/40 border border-border/50 rounded-2xl group hover:border-primary/40 transition-all cursor-default"
              >
                <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center mt-0.5 group-hover:border-primary group-hover:bg-primary/5 transition-all">
                  <div className="w-2.5 h-2.5 bg-transparent group-hover:bg-primary rounded-full transition-all" />
                </div>
                <span className="text-[13px] font-bold text-muted-foreground uppercase tracking-tighter leading-tight group-hover:text-foreground transition-colors">{item}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-border/50 text-center space-y-3">
             <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Protocol Verified</div>
             <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase">
               All systems operational. Ensure active NSE/BSE connectivity before execution.
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
