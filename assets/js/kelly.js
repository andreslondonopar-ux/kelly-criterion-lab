// Kelly Criterion: fracción óptima de apuesta binaria, tasa de crecimiento continua,
// generalización a un activo real (media/varianza), y simulación de curvas de equity.

const Kelly = (() => {
  // Apuesta binaria clásica: f* = p - q/b (p=prob. de ganar, b=cuota neta recibida por
  // cada unidad apostada, q=1-p).
  function binaryKelly(p, b) {
    const q = 1 - p;
    return p - q / b;
  }

  // Crecimiento (log) esperado por apuesta de la apuesta binaria, como función de f —
  // maximizado exactamente en binaryKelly(p,b), y es la que muestra por qué apostar más
  // allá de f* reduce el crecimiento (incluso puede llevar a ruina si f>=1).
  function binaryGrowthRate(f, p, b) {
    const q = 1 - p;
    if (f * b <= -1 || f >= 1) return -Infinity;
    return p * Math.log(1 + f * b) + q * Math.log(1 - f);
  }

  // Tasa de crecimiento esperado (log) como función de la fracción apostada f, para un
  // activo con retorno esperado mu y volatilidad sigma, financiando el resto a la tasa
  // libre de riesgo r. Kelly maximiza exactamente esta función.
  function growthRate(f, mu, sigma, r) {
    return r + f * (mu - r) - 0.5 * f * f * sigma * sigma;
  }

  // Fracción de Kelly continua (Gaussiana) que maximiza growthRate: f* = (mu-r)/sigma^2.
  function continuousKelly(mu, sigma, r) {
    return (mu - r) / (sigma * sigma);
  }

  function boxMuller() {
    let u1 = 0;
    while (u1 === 0) u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  // Simula una curva de equity de `days` pasos rebalanceando continuamente la fracción
  // f del capital en un activo con retorno esperado (aritmético) muDaily y volatilidad
  // sigmaDaily, financiando el resto (1-f) a la tasa libre de riesgo diaria r. El
  // retorno log de cada paso usa el mismo growthRate() como deriva (garantiza que la
  // simulación y la fórmula analítica sean consistentes por construcción) más un shock
  // aleatorio de tamaño f*sigmaDaily — así el rebalanceo de fracción fija sí tiene el
  // término de penalización -0.5*f²*sigma² que crea el máximo interior en f*.
  function simulateEquityCurve(f, muDaily, sigmaDaily, rDaily, days) {
    const drift = growthRate(f, muDaily, sigmaDaily, rDaily);
    const equity = [1];
    let v = 1;
    for (let i = 0; i < days; i++) {
      const shock = f * sigmaDaily * boxMuller();
      v *= Math.exp(drift + shock);
      equity.push(v);
    }
    return equity;
  }

  // Simula nPaths trayectorias y devuelve solo el valor final de cada una (para ver la
  // distribución de resultados, no cada trayectoria completa).
  function simulateTerminalValues(f, muDaily, sigmaDaily, rDaily, days, nPaths) {
    const drift = growthRate(f, muDaily, sigmaDaily, rDaily);
    const finals = new Array(nPaths);
    for (let p = 0; p < nPaths; p++) {
      let v = 1;
      for (let i = 0; i < days; i++) {
        const shock = f * sigmaDaily * boxMuller();
        v *= Math.exp(drift + shock);
      }
      finals[p] = v;
    }
    return finals;
  }

  function median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  function percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = p * (sorted.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  // Error estándar de la media anualizada estimada con `years` años de retornos diarios:
  // SE(mu_anual) = sigma_anual / sqrt(years) — un resultado real y muy citado (con solo
  // unos años de datos diarios, el error de estimar mu es enorme frente a mu mismo, la
  // razón cuantitativa detrás de por qué Kelly completo casi nunca se aplica tal cual).
  function standardErrorMu(sigmaAnnual, years) {
    return sigmaAnnual / Math.sqrt(years);
  }

  // Crecimiento REAL que se obtiene si se apuesta la fracción óptima calculada con un mu
  // supuesto (assumedMu), pero el mu verdadero resulta ser trueMu — mide el costo real,
  // en tasa de crecimiento, de un error de estimación (MacLean & Ziemba, "Optimal Betting
  // Under Parameter Uncertainty").
  function growthGivenMisestimate(assumedMu, trueMu, sigma, r) {
    const fUsed = continuousKelly(assumedMu, sigma, r);
    return growthRate(fUsed, trueMu, sigma, r);
  }

  // Máximo drawdown (caída desde el pico más reciente) de una curva de equity.
  function maxDrawdown(equityCurve) {
    let peak = equityCurve[0];
    let maxDD = 0;
    for (const v of equityCurve) {
      if (v > peak) peak = v;
      const dd = (peak - v) / peak;
      if (dd > maxDD) maxDD = dd;
    }
    return maxDD;
  }

  // Distribución de máximo drawdown sobre nPaths trayectorias simuladas con la fracción f
  // — para ver no solo el crecimiento típico sino qué tan mala puede ser la caída en el
  // camino (el trade-off real detrás de "por qué no apostar Kelly completo").
  function simulateDrawdownDistribution(f, muDaily, sigmaDaily, rDaily, days, nPaths) {
    const drift = growthRate(f, muDaily, sigmaDaily, rDaily);
    const drawdowns = new Array(nPaths);
    for (let p = 0; p < nPaths; p++) {
      let v = 1, peak = 1, maxDD = 0;
      for (let i = 0; i < days; i++) {
        const shock = f * sigmaDaily * boxMuller();
        v *= Math.exp(drift + shock);
        if (v > peak) peak = v;
        const dd = (peak - v) / peak;
        if (dd > maxDD) maxDD = dd;
      }
      drawdowns[p] = maxDD;
    }
    return drawdowns;
  }

  return {
    binaryKelly, binaryGrowthRate, growthRate, continuousKelly, boxMuller,
    simulateEquityCurve, simulateTerminalValues, median, percentile,
    standardErrorMu, growthGivenMisestimate, maxDrawdown, simulateDrawdownDistribution,
  };
})();
