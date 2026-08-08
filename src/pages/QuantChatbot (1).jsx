import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageSquare, Terminal, HelpCircle, ChevronRight } from 'lucide-react';
import { PageWrapper } from '../components/AppShell';
import { KaTeX, BlockKaTeX } from '../components/KaTeX';

// Helper component to format response text containing LaTeX and code blocks
function FormattedMessage({ text }) {
  if (!text) return null;

  // 1. Split by triple backticks code blocks
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const blocks = text.split(codeBlockRegex);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const lines = block.split('\n');
          const firstLine = lines[0] || '';
          const lang = firstLine.replace('```', '').trim();
          const code = lines.slice(1, -1).join('\n');
          return (
            <div key={idx} className="my-3 rounded-xl overflow-hidden border border-gray-800 bg-gray-950 font-mono text-xs">
              <div className="bg-gray-900 px-4 py-1.5 text-[10px] text-gray-400 font-semibold border-b border-gray-800 flex justify-between items-center select-none animate-pulse-soft">
                <span>{lang.toUpperCase() || 'CODE'}</span>
              </div>
              <pre className="p-4 overflow-x-auto text-blue-300">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // 2. Split by math markers: $$...$$ or $...$
        const mathRegex = /(\$\$.*?\$\$|\$.*?\$)/g;
        const parts = block.split(mathRegex);

        return (
          <span key={idx}>
            {parts.map((part, pidx) => {
              if (part.startsWith('$$') && part.endsWith('$$')) {
                const latex = part.slice(2, -2);
                return <BlockKaTeX key={pidx} latex={latex} />;
              } else if (part.startsWith('$') && part.endsWith('$')) {
                const latex = part.slice(1, -1);
                return <KaTeX key={pidx} latex={latex} />;
              }
              return <span key={pidx} className="whitespace-pre-line">{part}</span>;
            })}
          </span>
        );
      })}
    </div>
  );
}

// Structured Mock responses for preset questions
const mockResponses = {
  "derive the black-scholes pde": `The Black-Scholes PDE is derived using a portfolio of the option $V$ and a short position in $\\Delta$ shares of stock $S$.

The portfolio value is:
$$\\Pi = V - \\Delta S$$

Over a small time step $dt$, the change in portfolio value is:
$$d\\Pi = dV - \\Delta dS$$

Applying Itô's Lemma to $dV$ and setting $\\Delta = \\frac{\\partial V}{\\partial S}$ to eliminate stock risk, we get:
$$d\\Pi = \\left( \\frac{\\partial V}{\\partial t} + \\frac{1}{2}\\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} \\right) dt$$

To prevent arbitrage, the return must equal the risk-free rate:
$$d\\Pi = r\\Pi dt = r(V - \\Delta S) dt$$

Equating these yields the celebrated Black-Scholes PDE:
$$\\frac{\\partial V}{\\partial t} + rS\\frac{\\partial V}{\\partial S} + \\frac{1}{2}\\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} - rV = 0$$`,

  "explain ornstein-uhlenbeck mean reversion": `The Ornstein-Uhlenbeck (OU) process is defined by the stochastic differential equation:
$$dX_t = \\theta(\\mu - X_t)dt + \\sigma dW_t$$

Where:
- $X_t$ is the current asset price, interest rate, or spread.
- $\\theta > 0$ is the rate of mean reversion.
- $\\mu$ is the long-run mean level.
- $\\sigma$ is the volatility coefficient.
- $W_t$ is a standard Brownian motion.

### Core Mechanics
If $X_t > \\mu$, the drift term $\\theta(\\mu - X_t)dt$ becomes negative, pulling $X_t$ down toward the mean.
If $X_t < \\mu$, the drift becomes positive, pulling it up.

The analytical solution is:
$$X_t = X_0 e^{-\\theta t} + \\mu(1 - e^{-\\theta t}) + \\sigma \\int_0^t e^{-\\theta(t-s)} dW_s$$`,

  "how do i calculate expected shortfall?": `Expected Shortfall (ES), also known as CVaR, is a coherent risk measure that measures the average loss in the worst $(1-\\alpha)\\%$ of cases.

Mathematically, it is defined as:
$$ES_\\alpha = \\mathbb{E}[L \\mid L \\ge VaR_\\alpha] = \\frac{1}{1-\\alpha}\\int_{\\alpha}^1 VaR_u du$$

For a normally distributed portfolio return with mean $\\mu$ and standard deviation $\\sigma$:
$$ES_\\alpha = \\mu + \\sigma \\frac{\\phi(z_\\alpha)}{1-\\alpha}$$

Where:
- $\\phi(z)$ is the standard normal PDF.
- $z_\\alpha$ is the $\\alpha$-quantile of the standard normal distribution (e.g. $z_{0.95} \\approx 1.645$).`,

  "show python code to price a european option using monte carlo": `Here is the clean vectorized Python implementation using NumPy to price a European call option via Monte Carlo simulation:

\`\`\`python
import numpy as np

def monte_carlo_call_price(S0, K, r, T, sigma, num_simulations=100000):
    # Simulate standard normal random variables
    Z = np.random.standard_normal(num_simulations)
    
    # Calculate stock price at expiry ST under geometric Brownian motion
    ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * Z)
    
    # Payoff for Call option: max(ST - K, 0)
    payoffs = np.maximum(ST - K, 0)
    
    # Discount back to present value using risk-free rate
    price = np.exp(-r * T) * np.mean(payoffs)
    return price

# Example usage:
call_val = monte_carlo_call_price(S0=100, K=100, r=0.05, T=1.0, sigma=0.20)
print(f"Monte Carlo Call Price: {call_val:.4f}")
\`\`\``
};

const defaultResponse = (query) => `That's an interesting question about "${query}"! 

Currently, my Quant Finance AI engine is operating in **sandbox mode** for this local deployment. 

Once configured with an active AI backend endpoint, I will be able to answer any custom mathematical or programming queries dynamically. 

For now, try clicking one of the preset **AI Prompt templates** in the sidebar to see how I render complex LaTeX derivatives and Python code blocks!`;

const presetPrompts = [
  { id: 'bs', text: 'Derive the Black-Scholes PDE' },
  { id: 'ou', text: 'Explain Ornstein-Uhlenbeck mean reversion' },
  { id: 'es', text: 'How do I calculate Expected Shortfall?' },
  { id: 'mc', text: 'Show Python code to price a European option using Monte Carlo' }
];

export default function QuantChatbot() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Welcome to the **QuantIQ AI Tutor**! 🧠\n\nI am your dedicated Quantitative Finance study companion. Ask me anything about stochastic calculus, options pricing, risk management, or portfolio theory.\n\nTry selecting one of the templates to see my interactive math derivations!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = (textToSend) => {
    const query = textToSend.trim();
    if (!query) return;

    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInput('');
    setLoading(true);

    // Real backend call — replaces the old setTimeout + hardcoded
    // mockResponses lookup. This hits the Flask retrieval endpoint,
    // which searches the app's actual formula/curriculum data.
    // VITE_API_URL is set in .env for local dev, and in Vercel's
    // environment variables once deployed — same code, different target.
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
    fetch(`${apiUrl}/api/chatbot/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query }),
    })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => [...prev, { sender: 'ai', text: data.answer }]);
      })
      .catch(err => {
        console.error('Chatbot request failed:', err);
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: "Couldn't reach the backend. Make sure the Flask server is running on port 5000."
        }]);
      })
      .finally(() => setLoading(false));
  };

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles size={22} className="text-amber-500 animate-pulse-soft" /> AI Tutor
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Interactive quantitative finance assistant. Deep explanations, LaTeX derivations, and code snippets.
          </p>
        </div>

        <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Presets Sidebar */}
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 gap-3">
            <div className="card p-4 space-y-3" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Terminal size={12} /> Prompt Templates
              </h3>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Click a preset topic below to ask the AI Tutor for a detailed mathematical breakdown:
              </p>
              <div className="space-y-1.5">
                {presetPrompts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSend(p.text)}
                    disabled={loading}
                    className="w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2 border border-transparent hover:border-gray-800 hover:bg-gray-800"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                  >
                    <HelpCircle size={13} className="mt-0.5 text-amber-500 flex-shrink-0" />
                    <span>{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="card p-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <h4 className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>🤖 Scope restriction</h4>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                This tutor model is fine-tuned to answer queries strictly regarding **Quantitative Finance, Economics, and Financial Math**. General knowledge queries will be redirected to study paths.
              </p>
            </div>
          </aside>

          {/* Chat Container */}
          <div className="flex-1 card flex flex-col overflow-hidden relative" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-card flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping-soft" />
                <span className="text-xs font-bold text-primary">Model: QuantGPT-v1 (Sandbox)</span>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">Local Session</span>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => {
                const isAI = m.sender === 'ai';
                return (
                  <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        isAI
                          ? 'border border-gray-800 text-primary rounded-tl-none'
                          : 'bg-amber-500 text-gray-950 font-medium rounded-tr-none'
                      }`}
                      style={isAI ? { background: 'var(--bg-secondary)' } : {}}
                    >
                      <div className="flex items-center gap-1.5 mb-1 select-none">
                        {isAI ? (
                          <>
                            <Sparkles size={11} className="text-amber-500" />
                            <span className="text-[10px] uppercase font-bold text-gray-400">AI Tutor</span>
                          </>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-amber-950">You</span>
                        )}
                      </div>
                      <FormattedMessage text={m.text} />
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 border border-gray-800 text-primary rounded-tl-none flex items-center gap-2" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold animate-pulse">Formulating derivation...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 border-t border-card flex gap-2"
              style={{ borderColor: 'var(--border)' }}
            >
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Ask about Black-Scholes, Greeks, Stochastic Calculus..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary p-2.5 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'var(--accent-gold)',
                  color: 'var(--bg-primary)',
                  opacity: loading || !input.trim() ? 0.6 : 1
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
