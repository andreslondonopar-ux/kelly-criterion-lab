// Diccionario ES/EN + helpers. Mismo patrón que el resto de la serie.

const I18N = (() => {
  const STORAGE_KEY = "kellycriterionlab-locale";

  const dict = {
    "nav.intro": { es: "Intro", en: "Intro" },
    "nav.paso1": { es: "1. Apuesta binaria", en: "1. Binary bet" },
    "nav.paso2": { es: "2. Curva de crecimiento", en: "2. Growth curve" },
    "nav.paso3": { es: "3. Activo real", en: "3. Real asset" },
    "nav.paso4": { es: "4. Kelly fraccional", en: "4. Fractional Kelly" },
    "nav.paso5": { es: "5. Simulación", en: "5. Simulation" },
    "nav.limites": { es: "Límites", en: "Limits" },
    "nav.creador": { es: "Creador", en: "Creator" },

    "hero.eyebrow": { es: "Proyecto educativo · Kelly Criterion", en: "Educational project · Kelly Criterion" },
    "hero.h1": { es: "Kelly Criterion: cuánto apostar, paso a paso", en: "Kelly Criterion: how much to bet, step by step" },
    "hero.lead": {
      es: `John Kelly resolvió en 1956 una pregunta que todo el mundo con una ventaja
        (una apuesta, una inversión) enfrenta tarde o temprano: no cuánto se puede ganar,
        sino <strong>qué fracción del capital apostar</strong> para crecer lo más rápido
        posible sin arriesgarse a la ruina. Este sitio construye la fórmula desde una
        apuesta binaria clásica hasta un activo real con datos en vivo, mostrando por qué
        apostar de más es tan malo como apostar de menos.`,
      en: `In 1956, John Kelly solved a question everyone with an edge (a bet, an
        investment) eventually faces: not how much you can win, but <strong>what
        fraction of your capital to bet</strong> to grow as fast as possible without
        risking ruin. This site builds the formula from a classic binary bet up to a real
        asset with live data, showing why overbetting is just as bad as underbetting.`,
    },

    "controls.tickerLabel": { es: "Activo real (para el Paso 3)", en: "Real asset (for Step 3)" },
    "controls.riskfreeLabel": { es: "Tasa libre de riesgo (% anual)", en: "Risk-free rate (% annual)" },
    "controls.yearsLabel": { es: "Años de histórico", en: "Years of history" },
    "controls.recalcBtn": { es: "Recalcular", en: "Recalculate" },
    "controls.loadingDefault": { es: "Cargando ejemplo por defecto…", en: "Loading default example…" },
    "controls.hint": {
      es: "Todos los campos de esta página alimentan el mismo cálculo — cambia cualquiera y presiona \"Recalcular\" arriba.",
      en: "Every field on this page feeds the same calculation — change any of them and press \"Recalculate\" above.",
    },

    "paso1.badge": { es: "PASO 1", en: "STEP 1" },
    "paso1.title": { es: "El caso clásico: una apuesta binaria", en: "The classic case: a binary bet" },
    "paso1.p": {
      es: `Una apuesta donde ganas con probabilidad <code>p</code> y, si ganas, recibes
        <code>b</code> unidades por cada unidad apostada (si pierdes, pierdes lo
        apostado). Kelly responde: de tu capital, ¿qué fracción <code>f</code> apostar en
        cada ronda?`,
      en: `A bet where you win with probability <code>p</code> and, if you win, receive
        <code>b</code> units for every unit wagered (if you lose, you lose the wager).
        Kelly answers: of your capital, what fraction <code>f</code> should you bet each
        round?`,
    },
    "paso1.winProbLabel": { es: "Probabilidad de ganar (p)", en: "Win probability (p)" },
    "paso1.netOddsLabel": { es: "Cuota neta (b)", en: "Net odds (b)" },
    "paso1.formula": {
      es: "$$ f^* = p - \\frac{q}{b} = p - \\frac{1-p}{b} $$",
      en: "$$ f^* = p - \\frac{q}{b} = p - \\frac{1-p}{b} $$",
    },
    "paso1.resultLabel": { es: "Fracción óptima de Kelly (f*)", en: "Optimal Kelly fraction (f*)" },
    "paso1.noEdge": {
      es: "Con estos números no hay ventaja (f* ≤ 0) — Kelly dice: no apuestes.",
      en: "With these numbers there's no edge (f* ≤ 0) — Kelly says: don't bet.",
    },

    "paso2.badge": { es: "PASO 2", en: "STEP 2" },
    "paso2.title": { es: "La curva de crecimiento", en: "The growth curve" },
    "paso2.p": {
      es: `Para cada fracción <code>f</code> hay una tasa de crecimiento esperada del
        capital (en log, porque las apuestas se componen). La curva tiene un máximo — y
        ese máximo es exactamente <code>f*</code>. Apostar más allá de él no es "más
        agresivo pero más rentable": es simplemente peor, incluso antes de llegar al
        punto donde arruina.`,
      en: `For each fraction <code>f</code> there's an expected growth rate of capital
        (in log terms, because bets compound). The curve has a maximum — and that maximum
        is exactly <code>f*</code>. Betting beyond it isn't "more aggressive but more
        profitable": it's simply worse, even before reaching the point where it ruins
        you.`,
    },

    "paso3.badge": { es: "PASO 3", en: "STEP 3" },
    "paso3.title": { es: "Generalizar a un activo real", en: "Generalizing to a real asset" },
    "paso3.p": {
      es: `La misma idea aplica a invertir en un activo: en vez de una apuesta binaria
        discreta, el activo tiene un retorno esperado <code>μ</code> y una volatilidad
        <code>σ</code> (calculados en vivo de su histórico real). La versión continua de
        Kelly da una fórmula igual de simple:`,
      en: `The same idea applies to investing in an asset: instead of a discrete binary
        bet, the asset has an expected return <code>μ</code> and a volatility
        <code>σ</code> (computed live from its real history). The continuous version of
        Kelly gives an equally simple formula:`,
    },
    "paso3.formula": {
      es: "$$ f^* = \\frac{\\mu - r}{\\sigma^2} $$",
      en: "$$ f^* = \\frac{\\mu - r}{\\sigma^2} $$",
    },
    "paso3.muLabel": { es: "Retorno esperado anual (μ)", en: "Expected annual return (μ)" },
    "paso3.sigmaLabel": { es: "Volatilidad anual (σ)", en: "Annual volatility (σ)" },
    "paso3.fStarLabel": { es: "Fracción de Kelly (f*)", en: "Kelly fraction (f*)" },
    "paso3.leverageNote": {
      es: "f* > 100% significa que Kelly recomienda apalancarse — pedir prestado para invertir más del capital propio en el activo. No es un error: así de fuerte puede ser una ventaja real.",
      en: "f* > 100% means Kelly recommends leveraging — borrowing to invest more than your own capital in the asset. It's not a mistake: that's how strong a real edge can be.",
    },

    "paso4.badge": { es: "PASO 4", en: "STEP 4" },
    "paso4.title": { es: "Kelly fraccional: por qué no apostar Kelly completo", en: "Fractional Kelly: why not bet full Kelly" },
    "paso4.p": {
      es: `Kelly completo maximiza el crecimiento <em>mediano</em> a largo plazo — pero
        también maximiza la volatilidad del camino hasta llegar ahí. En la práctica casi
        nadie apuesta Kelly completo: μ y σ nunca se conocen con certeza (se estiman con
        error), y una sobreestimación de μ o subestimación de σ hace que el "Kelly
        completo" real termine siendo una sobre-apuesta. Medio Kelly es el punto de
        partida típico entre traders reales.`,
      en: `Full Kelly maximizes long-run <em>median</em> growth — but it also maximizes
        the volatility of the path to get there. In practice almost no one bets full
        Kelly: μ and σ are never known with certainty (they're estimated with error), and
        overestimating μ or underestimating σ turns the "true full Kelly" into an
        overbet. Half Kelly is the typical starting point among real traders.`,
    },

    "paso5.badge": { es: "PASO 5", en: "STEP 5" },
    "paso5.title": { es: "Simulación: la distribución completa de resultados", en: "Simulation: the full distribution of outcomes" },
    "paso5.p": {
      es: `Una sola curva de equity es una muestra de un proceso aleatorio — para ver el
        panorama completo hace falta simular muchas trayectorias con la misma fracción y
        mirar la distribución de resultados finales, no solo una.`,
      en: `A single equity curve is one sample of a random process — to see the full
        picture you need to simulate many trajectories with the same fraction and look at
        the distribution of final outcomes, not just one.`,
    },
    "paso5.medianLabel": { es: "Mediana", en: "Median" },

    "limits.badge": { es: "LÍMITES", en: "LIMITS" },
    "limits.title": { es: "Limitaciones y para seguir leyendo", en: "Limitations and further reading" },
    "limits.callout": {
      es: `Este sitio es material educativo, no asesoría financiera. Kelly asume que
        <code>μ</code> y <code>σ</code> se conocen exactamente — en la práctica se
        <strong>estiman con error</strong>, y ese error casi siempre hace que el Kelly
        "verdadero" sea menor al calculado (por eso el Kelly fraccional del Paso 4 es la
        norma, no la excepción). El modelo también asume <strong>reinversión continua
        sin restricciones</strong> de tamaño de posición ni liquidez, e
        <strong>ignora los costos de transacción</strong> del rebalanceo constante que la
        fórmula supone. Y aunque maximiza el crecimiento de largo plazo, no dice nada
        sobre cuánta pérdida temporal (drawdown) alguien está dispuesto a tolerar en el
        camino — eso es una decisión personal, no matemática.`,
      en: `This site is educational material, not financial advice. Kelly assumes
        <code>μ</code> and <code>σ</code> are known exactly — in practice they're
        <strong>estimated with error</strong>, and that error almost always makes the
        "true" Kelly fraction smaller than the calculated one (which is why fractional
        Kelly from Step 4 is the norm, not the exception). The model also assumes
        <strong>unrestricted continuous reinvestment</strong> with no position-size or
        liquidity limits, and <strong>ignores the transaction costs</strong> of the
        constant rebalancing it assumes. And while it maximizes long-run growth, it says
        nothing about how much temporary loss (drawdown) someone is willing to tolerate
        along the way — that's a personal decision, not a mathematical one.`,
    },
    "limits.reading": {
      es: `Para profundizar: John L. Kelly Jr., <em>"A New Interpretation of Information
        Rate"</em>, Bell System Technical Journal (1956) — el paper original; Edward
        Thorp, quien lo aplicó primero a blackjack y luego a mercados financieros; y los
        otros sitios de esta serie —
        <a href="https://markowitz-portfolio-lab.vercel.app" target="_blank" rel="noopener">Markowitz Portfolio Lab</a>,
        <a href="https://capm-beta-lab.vercel.app" target="_blank" rel="noopener">CAPM Beta-Alpha Lab</a>,
        <a href="https://black-scholes-lab.vercel.app" target="_blank" rel="noopener">Black-Scholes / Options Greeks Lab</a>, y
        <a href="https://var-risk-lab.vercel.app" target="_blank" rel="noopener">VaR Dashboard</a>.`,
      en: `To go deeper: John L. Kelly Jr., <em>"A New Interpretation of Information
        Rate"</em>, Bell System Technical Journal (1956) — the original paper; Edward
        Thorp, who first applied it to blackjack and then to financial markets; and the
        other sites in this series —
        <a href="https://markowitz-portfolio-lab.vercel.app" target="_blank" rel="noopener">Markowitz Portfolio Lab</a>,
        <a href="https://capm-beta-lab.vercel.app" target="_blank" rel="noopener">CAPM Beta-Alpha Lab</a>,
        <a href="https://black-scholes-lab.vercel.app" target="_blank" rel="noopener">Black-Scholes / Options Greeks Lab</a>, and
        <a href="https://var-risk-lab.vercel.app" target="_blank" rel="noopener">VaR Dashboard</a>.`,
    },

    "creator.badge": { es: "CREADOR", en: "CREATOR" },
    "creator.title": { es: "Sobre el creador", en: "About the creator" },
    "creator.text": { es: "Hecho por Andrés Londoño.", en: "Made by Andrés Londoño." },

    "footer.text": {
      es: "Kelly Criterion / Position Sizing Lab — proyecto educativo independiente, quinto de una serie de sitios sobre finanzas cuantitativas (ver Creador para los demás). Datos: Yahoo Finance. Cómputo: 100% en el navegador (JavaScript).",
      en: "Kelly Criterion / Position Sizing Lab — an independent educational project, fifth in a series of quantitative finance sites (see Creator for the rest). Data: Yahoo Finance. Computation: 100% in the browser (JavaScript).",
    },

    // --- Generado por JS ---
    "app.computing": { es: "Calculando…", en: "Computing…" },
    "app.fetching": { es: "Trayendo precio e histórico de {ticker}…", en: "Fetching price and history for {ticker}…" },
    "app.fetchFailed": { es: "No se pudo traer datos de {ticker}.", en: "Could not fetch data for {ticker}." },
    "app.ready": { es: "Listo.", en: "Ready." },
    "app.unexpectedError": { es: "Error inesperado.", en: "Unexpected error." },
    "app.statFullKelly": { es: "Kelly completo", en: "Full Kelly" },
    "app.statHalfKelly": { es: "Medio Kelly", en: "Half Kelly" },
    "app.statDoubleKelly": { es: "Doble Kelly", en: "Double Kelly" },
    "app.statCash": { es: "Efectivo (f=0)", en: "Cash (f=0)" },

    // --- Gráficas (plots.js) ---
    "charts.fractionAxis": { es: "Fracción apostada (f)", en: "Fraction bet (f)" },
    "charts.growthAxis": { es: "Crecimiento esperado (log, por apuesta)", en: "Expected growth (log, per bet)" },
    "charts.growthAnnualAxis": { es: "Crecimiento esperado anual (log)", en: "Expected annual growth (log)" },
    "charts.daysAxis": { es: "Días", en: "Days" },
    "charts.equityAxis": { es: "Valor del portafolio (log)", en: "Portfolio value (log)" },
    "charts.terminalValueAxis": { es: "Valor final del portafolio", en: "Final portfolio value" },
    "charts.frequencyAxis": { es: "Frecuencia", en: "Frequency" },
  };

  let locale = (localStorage.getItem(STORAGE_KEY) === "en") ? "en" : "es";

  function t(key, vars) {
    const entry = dict[key];
    let str = entry ? entry[locale] || entry.es : key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replaceAll(`{${k}}`, vars[k]);
      });
    }
    return str;
  }

  function getLocale() {
    return locale;
  }

  function setLocale(newLocale) {
    locale = newLocale === "en" ? "en" : "es";
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    applyStaticTranslations();
  }

  function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.innerHTML = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
  }

  return { t, getLocale, setLocale, applyStaticTranslations };
})();
