# 📐 Calculus Made Easy for Clara
> *From First Principles to Intuitive Mastery*

An interactive, production-ready educational web platform built to teach calculus with clarity, visual intuition, and mathematical rigor.

---

## 🌟 Pedagogical Philosophy

Calculus often intimidates learners because traditional textbooks introduce dry, algebraic formalism before establishing physical intuition. In **Calculus Made Easy for Clara**, every concept adheres to the following sequence:

1. **In Plain English (ELI5):** A single, crystal-clear, everyday sentence explaining the concept before introducing any notation.
2. **The Intuitive Analogy:** A real-world mental model (speedometers, water tanks, photo finishes, mountain terrains).
3. **Interactive Visual Sandbox:** Direct manipulation via sliders and HTML5 Canvas graphs so Clara can *feel* the math.
4. **Textbook-Grade Rigor:** Crisp, KaTeX-rendered mathematical definitions.
5. **Step-by-Step Worked Examples:** Dual-column breakdowns displaying math transformations alongside plain-English translations of every move.
6. **Self-Check Quizzes:** Immediate interactive feedback with pedagogical explanations.

---

## 🚀 Tech Stack

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 (configured with warm ivory light mode and sleek slate dark mode)
- **Math Engine:** KaTeX (`katex`) for textbook-grade typesetting
- **Interactive Visuals:** HTML5 Canvas 2D & SVG graphs with high-DPI scaling
- **Icons:** Lucide React (`lucide-react`)
- **Celebration Feedback:** Canvas Confetti (`canvas-confetti`)
- **Deployment Target:** Vercel (Production SPA configured with `vercel.json`)

---

## 🔬 Core Interactive Sandboxes

1. **The Derivative Explorer & Tangent Transformer:**
   - Slide point $x_0$ dynamically along curves ($x^2$, $x^3 - 3x$, $\sin(x)$, $\frac{4}{1+x^2}$).
   - Toggle secant approximation with a $\Delta x$ slider: watch the secant line morph into the instantaneous tangent line as $\Delta x \to 0$.
   - Real-time slope readout and derivative curve tracking.

2. **The Riemann Sum Integrator:**
   - Adjust partition size $n$ from $2$ to $100$ rectangles.
   - Switch between **Left**, **Right**, **Midpoint**, and **Trapezoidal** sum approximations.
   - Live comparison of Riemann Sum $\sum f(x_i^*)\Delta x$ against the exact analytical integral $\int_a^b f(x)\,dx$ with percentage accuracy.

3. **The Taylor & Maclaurin Series Approximator:**
   - Add polynomial terms from degree $n = 0$ to $n = 11$ to watch curves hug transcendental functions like $\sin(x)$, $\cos(x)$, and $e^x$.
   - Live KaTeX formula showing the exact generated polynomial.

4. **Clara's Real-World Box Optimization Problem:**
   - Interactive cut slider $x$ for corner cutouts on flat cardboard.
   - Live 2D cut template alongside volume curve $V(x)$.
   - "Snap to Calculus Peak" button showing why setting $\frac{dV}{dx} = 0$ achieves maximum volume.

---

## 📚 Master Formula Vault & Clara's Study Board

- **Searchable & Filterable Vault:** Contains essential calculus formulas across Limits, Derivatives, Integrals, Series, Trigonometric Identities, and Multivariable Vectors.
- **Copy to Clipboard:** Copy exact LaTeX syntax with one click.
- **Pin to Study Board:** Persisted in `localStorage` for personalized revision.
- **Progress Tracking & Certificate:** Visual certificate celebrating Clara's mastery milestones with celebratory confetti.

---

## 🛠️ Local Development

```bash
# 1. Clone or navigate to the project directory
cd calculus-for-clara

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production (TypeScript check + Vite bundle)
npm run build
```

---

## 🌐 Git & Vercel Deployment Instructions

### Step 1: Initialize Git Repository
Run the following commands inside the `calculus-for-clara` directory:

```bash
# Initialize git repository
git init

# Add all project files
git add .

# Create initial commit
git commit -m "Initial commit: Calculus Made Easy for Clara educational platform"
```

### Step 2: Push to GitHub
Create a new repository on [GitHub](https://github.com/new) named `calculus-for-clara`, then push:

```bash
# Set default branch
git branch -M main

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/calculus-for-clara.git

# Push code
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your `calculus-for-clara` repository.
3. Vercel automatically detects **Vite** framework preset:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**. Your app will be live with a global CDN and HTTPS within 30 seconds!

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI globally (if not installed)
npm install -g vercel

# Deploy directly from terminal
vercel
```
