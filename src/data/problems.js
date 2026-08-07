export const problems = [
  {
    id: 'p1',
    title: 'Price a European Call Option',
    topic: 'Options Pricing',
    difficulty: 'Medium',
    tags: ['black-scholes', 'options', 'pricing'],
    problem: `A stock is currently trading at $100. The strike price is $105, the risk-free rate is 5% per annum, the volatility is 20%, and the time to expiry is 1 year. Use the Black-Scholes model to calculate the price of a European call option.`,
    hints: [
      'Start by computing d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)',
      'Then compute d₂ = d₁ - σ√T',
      'Finally use C = S·N(d₁) - K·e^{-rT}·N(d₂)',
      'N(0.0769) ≈ 0.5307, N(-0.1231) ≈ 0.4510',
    ],
    solution: `**Step 1: Calculate d₁**
d₁ = [ln(100/105) + (0.05 + 0.04/2) × 1] / (0.20 × √1)
d₁ = [ln(0.9524) + 0.07] / 0.20
d₁ = [-0.0488 + 0.07] / 0.20
d₁ = 0.0212 / 0.20 = 0.1060

**Step 2: Calculate d₂**
d₂ = 0.1060 - 0.20 × 1 = -0.0940

**Step 3: Find N(d₁) and N(d₂)**
N(0.1060) ≈ 0.5422
N(-0.0940) ≈ 0.4626

**Step 4: Apply Black-Scholes formula**
C = 100 × 0.5422 - 105 × e^{-0.05} × 0.4626
C = 54.22 - 105 × 0.9512 × 0.4626
C = 54.22 - 46.22
**C ≈ $8.00**`,
  },
  {
    id: 'p2',
    title: 'Verify Put-Call Parity',
    topic: 'Options Pricing',
    difficulty: 'Easy',
    tags: ['put-call parity', 'options', 'no-arbitrage'],
    problem: `Using the same parameters from Problem 1 (S=100, K=105, r=5%, σ=20%, T=1), the call is priced at $8.00. What should the put be priced at? What arbitrage exists if the put is quoted at $10?`,
    hints: [
      'Use put-call parity: C - P = S - Ke^{-rT}',
      'Rearrange to solve for P: P = C - S + Ke^{-rT}',
      'If P_market ≠ P_theory, an arbitrage exists',
    ],
    solution: `**Step 1: Apply put-call parity**
P = C - S + K·e^{-rT}
P = 8.00 - 100 + 105 × e^{-0.05}
P = 8.00 - 100 + 99.88
**P = $7.88**

**Step 2: Arbitrage if P_market = $10**
The put is overpriced by $10 - $7.88 = $2.12.

**Arbitrage strategy:**
- Sell the overpriced put for $10
- Buy the call for $8
- Short-sell the stock (receive $100)
- Invest $99.88 at the risk-free rate
Net cash inflow today: $10 - $8 + $100 - $99.88 = **$2.12 risk-free profit**`,
  },
  {
    id: 'p3',
    title: 'Portfolio Variance Calculation',
    topic: 'Portfolio Theory',
    difficulty: 'Easy',
    tags: ['portfolio', 'variance', 'diversification'],
    problem: `You have a two-asset portfolio: 60% in Asset A (σ_A = 15%, E[R_A] = 10%) and 40% in Asset B (σ_B = 25%, E[R_B] = 16%). The correlation between A and B is ρ = 0.3. Calculate: (a) Expected portfolio return, (b) Portfolio standard deviation.`,
    hints: [
      'E[Rₚ] = w_A × E[R_A] + w_B × E[R_B]',
      'σ²ₚ = w²_A σ²_A + w²_B σ²_B + 2 w_A w_B ρ σ_A σ_B',
      'Cov(A,B) = ρ × σ_A × σ_B',
    ],
    solution: `**(a) Expected Return**
E[Rₚ] = 0.6 × 10% + 0.4 × 16% = 6% + 6.4% = **12.4%**

**(b) Portfolio Variance**
σ²ₚ = (0.6)² × (0.15)² + (0.4)² × (0.25)² + 2 × 0.6 × 0.4 × 0.3 × 0.15 × 0.25
σ²ₚ = 0.36 × 0.0225 + 0.16 × 0.0625 + 2 × 0.6 × 0.4 × 0.3 × 0.0375
σ²ₚ = 0.0081 + 0.0100 + 0.0054
σ²ₚ = 0.0235

**Portfolio σ = √0.0235 = 15.33%**

Note: Individual weighted volatilities would be 0.6×15% + 0.4×25% = 19%, so diversification reduced risk from 19% to 15.33%.`,
  },
  {
    id: 'p4',
    title: "Apply Itô's Lemma to ln(S)",
    topic: 'Stochastic Calculus',
    difficulty: 'Hard',
    tags: ["ito's lemma", 'gbm', 'stochastic calculus'],
    problem: `Given that a stock price follows GBM: dS = μS dt + σS dW, apply Itô's Lemma to f(S) = ln(S) to show that log-returns are normally distributed.`,
    hints: [
      "Itô's Lemma: df = (∂f/∂t + μS·∂f/∂S + ½σ²S²·∂²f/∂S²)dt + σS·∂f/∂S dW",
      'Compute ∂f/∂S and ∂²f/∂S² for f(S) = ln(S)',
      'Integrate both sides from 0 to T',
    ],
    solution: `**Step 1: Compute partial derivatives**
f(S) = ln(S)
∂f/∂t = 0 (f doesn't depend explicitly on t)
∂f/∂S = 1/S
∂²f/∂S² = -1/S²

**Step 2: Apply Itô's Lemma**
d(ln S) = [0 + μS·(1/S) + ½σ²S²·(-1/S²)]dt + σS·(1/S)dW
d(ln S) = [μ - ½σ²]dt + σ dW

**Step 3: Integrate from 0 to T**
ln(S_T) - ln(S_0) = (μ - ½σ²)T + σW_T
ln(S_T/S_0) = (μ - ½σ²)T + σW_T

**Since W_T ~ N(0,T):**
ln(S_T/S_0) ~ N((μ - ½σ²)T, σ²T)

This proves log-returns are normally distributed, i.e., S_T is **log-normally** distributed.`,
  },
  {
    id: 'p5',
    title: 'CAPM and Expected Return',
    topic: 'Portfolio Theory',
    difficulty: 'Easy',
    tags: ['capm', 'beta', 'risk premium'],
    problem: `The risk-free rate is 3%. The market portfolio has an expected return of 9% and standard deviation of 18%. Stock XYZ has a beta of 1.4. (a) What is the expected return of XYZ per CAPM? (b) If XYZ has a correlation of 0.7 with the market and σ_XYZ = 30%, verify beta using the formula.`,
    hints: [
      'CAPM: E[R] = Rƒ + β(E[Rₘ] - Rƒ)',
      'β = Cov(Rᵢ, Rₘ)/Var(Rₘ) = ρ·σᵢ·σₘ / σ²ₘ',
    ],
    solution: `**(a) CAPM Expected Return**
E[R_XYZ] = 3% + 1.4 × (9% - 3%)
E[R_XYZ] = 3% + 1.4 × 6%
**E[R_XYZ] = 11.4%**

**(b) Verify Beta**
β = ρ × σ_XYZ / σₘ
β = 0.7 × 30% / 18%
β = 0.7 × 1.667
**β = 1.167** ≈ 1.17

Note: This differs from the given 1.4, meaning either the problem has inconsistent parameters, or the actual covariance implied by ρ=0.7 gives a different beta. Always use actual covariance data when possible.`,
  },
  {
    id: 'p6',
    title: 'VaR Calculation — Parametric Method',
    topic: 'Risk Management',
    difficulty: 'Medium',
    tags: ['var', 'risk management', 'normal distribution'],
    problem: `A portfolio has a daily mean return of 0.05% and daily standard deviation of 1.2%. Assuming normally distributed returns: (a) Calculate the 1-day 95% VaR. (b) Calculate the 1-day 99% VaR. (c) Scale to 10-day VaR using the square root of time rule.`,
    hints: [
      'For 95% confidence: z = 1.645; for 99%: z = 2.326',
      'VaR = -(μ - z·σ) for a long position',
      'Multi-day VaR ≈ 1-day VaR × √n',
    ],
    solution: `**1-day 95% VaR**
VaR₉₅ = -(μ - z₀.₀₅·σ) = -(0.05% - 1.645 × 1.2%)
VaR₉₅ = -(0.05% - 1.974%) = **1.924%** of portfolio value

**1-day 99% VaR**
VaR₉₉ = -(0.05% - 2.326 × 1.2%)
VaR₉₉ = -(0.05% - 2.791%) = **2.741%** of portfolio value

**10-day VaR (square root of time)**
10-day VaR₉₅ = 1.924% × √10 = **6.08%**
10-day VaR₉₉ = 2.741% × √10 = **8.67%**

**Note:** The √T rule assumes i.i.d. returns. In practice, volatility clustering (GARCH effects) makes this an approximation.`,
  },
  {
    id: 'p7',
    title: 'Bond Duration and Price Sensitivity',
    topic: 'Fixed Income',
    difficulty: 'Medium',
    tags: ['duration', 'bond', 'interest rate risk'],
    problem: `A 5-year bond pays annual coupons of 6% on a face value of $1,000. The current yield to maturity is 7%. Calculate: (a) The bond price, (b) Macaulay duration, (c) The approximate price change if yields increase by 50 bps.`,
    hints: [
      'Bond price = Σ C/(1+y)^t + F/(1+y)^T',
      'Macaulay Duration = Σ [t × PV(CFₜ)] / Price',
      'Modified Duration = Macaulay Duration / (1 + y)',
      'ΔP ≈ -D_mod × ΔY × P',
    ],
    solution: `**(a) Bond Price**
PV of coupons: 60 × [1 - 1/(1.07)^5] / 0.07 = 60 × 4.1002 = $246.01
PV of face value: 1000 / (1.07)^5 = $712.99
**Price = $959.00**

**(b) Macaulay Duration** (weighted average time)
Year 1: PV=56.07, weight=5.85%, contribution=0.0585
Year 2: PV=52.40, weight=5.47%, contribution=0.1093
Year 3: PV=48.97, weight=5.11%, contribution=0.1532
Year 4: PV=45.77, weight=4.77%, contribution=0.1909
Year 5: PV=755.78, weight=78.81%, contribution=3.9405
**D_mac = 4.4524 years**

**(c) Price Sensitivity to +50 bps**
D_mod = 4.4524 / 1.07 = 4.161 years
ΔP ≈ -4.161 × 0.005 × $959 = **-$19.97**
New price ≈ $959 - $19.97 = **$939.03**`,
  },
  {
    id: 'p8',
    title: 'GARCH(1,1) Volatility Forecast',
    topic: 'Econometrics',
    difficulty: 'Hard',
    tags: ['garch', 'volatility', 'forecasting'],
    problem: `A GARCH(1,1) model is estimated with ω = 0.000005, α = 0.09, β = 0.90. Yesterday's variance was σ²_{t-1} = 0.0001 and yesterday's return was ε_{t-1} = -0.02 (-2%). (a) Compute today's conditional variance, (b) Compute the long-run (unconditional) variance, (c) Is this model stationary?`,
    hints: [
      'σ²ₜ = ω + α·ε²_{t-1} + β·σ²_{t-1}',
      'Long-run variance: σ̄² = ω / (1 - α - β)',
      'Stationarity requires α + β < 1',
    ],
    solution: `**(a) Today's conditional variance**
σ²ₜ = 0.000005 + 0.09 × (-0.02)² + 0.90 × 0.0001
σ²ₜ = 0.000005 + 0.09 × 0.0004 + 0.00009
σ²ₜ = 0.000005 + 0.000036 + 0.000090
**σ²ₜ = 0.000131 → σₜ = 1.14%**

**(b) Long-run unconditional variance**
σ̄² = ω / (1 - α - β) = 0.000005 / (1 - 0.09 - 0.90)
σ̄² = 0.000005 / 0.01 = **0.0005 → σ̄ = 2.24%**

**(c) Stationarity check**
α + β = 0.09 + 0.90 = 0.99 < 1 ✓
**Yes, the model is stationary.** The process reverts to its long-run mean, though very slowly (high persistence).`,
  },
];
