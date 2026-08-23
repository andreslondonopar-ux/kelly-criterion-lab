// Orquestación: un solo pipeline. La apuesta binaria (Paso 1-2) es matemática pura y
// sincrónica; el activo real (Paso 3 en adelante) trae precio+histórico en vivo. Todo
// se recalcula junto con "Recalcular". Bilingüe desde el arranque — todo string
// generado acá pasa por I18N.t().

const TRADING_DAYS = 252;

(function () {
  const el = (id) => document.getElementById(id);

  const tickerInput = el("ticker-input");
  const riskfreeInput = el("riskfree-input");
  const yearsInput = el("years-input");
  const recalcBtn = el("recalc-btn");
  const statusLineEl = el("status-line");
  const langToggleBtn = el("lang-toggle");

  const winProbInput = el("winprob-input");
  const netOddsInput = el("netodds-input");
  const fStarBinaryEl = el("fstar-binary");
  const binaryWarningEl = el("binary-warning");
  const binaryGrowthChartEl = el("binary-growth-chart");

  const muEl = el("mu-value");
  const sigmaEl = el("sigma-value");
  const fStarContinuousEl = el("fstar-continuous");
  const leverageNoteEl = el("leverage-note");
  const continuousGrowthChartEl = el("continuous-growth-chart");

  const equityCurvesChartEl = el("equity-curves-chart");

  const terminalHistogramEl = el("terminal-histogram");
  const medianStatEl = el("median-stat");

  let state = null;

  function fmtPct(x, d = 2) {
    return (x * 100).toFixed(d) + "%";
  }
  function fmtNum(x, d = 3) {
    return x.toFixed(d);
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function toISO(d) {
    return d.toISOString().slice(0, 10);
  }
  function setStatus(msg, isError = false) {
    statusLineEl.textContent = msg;
    statusLineEl.classList.toggle("error", !!isError);
  }
  function setBusy(b) {
    recalcBtn.disabled = b;
    document.body.classList.toggle("is-recalculating", b);
  }

  async function fetchPrices(tickers, years) {
    const end = new Date();
    const start = new Date(end.getFullYear() - years, end.getMonth(), end.getDate());
    const url = `/api/prices?tickers=${encodeURIComponent(tickers.join(","))}&start=${toISO(start)}&end=${toISO(end)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || I18N.t("app.unexpectedError"));
    return json;
  }

  function annualizedMeanVol(closes) {
    const rets = [];
    for (let i = 1; i < closes.length; i++) rets.push(Math.log(closes[i] / closes[i - 1]));
    const meanDaily = rets.reduce((a, b) => a + b, 0) / rets.length;
    const varDaily = rets.reduce((a, b) => a + (b - meanDaily) * (b - meanDaily), 0) / (rets.length - 1);
    return { mu: meanDaily * TRADING_DAYS, sigma: Math.sqrt(varDaily * TRADING_DAYS) };
  }

  // --- Paso 1-2: apuesta binaria ---

  function renderBinaryPanel(p, b) {
    const fStar = Kelly.binaryKelly(p, b);
    fStarBinaryEl.textContent = fmtPct(fStar);
    fStarBinaryEl.classList.toggle("up", fStar > 0);
    fStarBinaryEl.classList.toggle("down", fStar <= 0);
    binaryWarningEl.style.display = fStar <= 0 ? "block" : "none";

    const lo = Math.max(-1 / b + 0.02, -0.5);
    const hi = 0.97;
    const n = 150;
    const fRange = Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
    const gValues = fRange.map((f) => Kelly.binaryGrowthRate(f, p, b));
    Plots.renderGrowthCurve(binaryGrowthChartEl, fRange, gValues, fStar, I18N.t("charts.fractionAxis"), I18N.t("charts.growthAxis"));
    return fStar;
  }

  // --- Paso 3: activo real, continuo ---

  function renderContinuousPanel(mu, sigma, r) {
    const fStar = Kelly.continuousKelly(mu, sigma, r);
    muEl.textContent = fmtPct(mu);
    sigmaEl.textContent = fmtPct(sigma);
    fStarContinuousEl.textContent = fmtPct(fStar);
    leverageNoteEl.style.display = fStar > 1 ? "block" : "none";

    const lo = Math.min(-0.5, fStar - 1);
    const hi = Math.max(2, fStar * 2 + 0.5);
    const n = 150;
    const fRange = Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
    const gValues = fRange.map((f) => Kelly.growthRate(f, mu, sigma, r));
    Plots.renderGrowthCurve(continuousGrowthChartEl, fRange, gValues, fStar, I18N.t("charts.fractionAxis"), I18N.t("charts.growthAnnualAxis"));
    return fStar;
  }

  // --- Paso 4: curvas de equity ---

  function renderEquityCurves(fStar, muDaily, sigmaDaily, rDaily) {
    const days = TRADING_DAYS * 3;
    const daysArr = Array.from({ length: days + 1 }, (_, i) => i);
    const fractions = [
      { f: 0, label: I18N.t("app.statCash"), color: Plots.COLORS.muted },
      { f: fStar * 0.5, label: I18N.t("app.statHalfKelly"), color: Plots.COLORS.accent2 },
      { f: fStar, label: I18N.t("app.statFullKelly"), color: Plots.COLORS.accent },
      { f: fStar * 2, label: I18N.t("app.statDoubleKelly"), color: Plots.COLORS.accent3 },
    ];
    const series = fractions.map((fr) => ({
      label: fr.label,
      color: fr.color,
      values: Kelly.simulateEquityCurve(fr.f, muDaily, sigmaDaily, rDaily, days),
    }));
    Plots.renderEquityCurves(equityCurvesChartEl, daysArr, series, I18N.t("charts.daysAxis"), I18N.t("charts.equityAxis"));
  }

  // --- Paso 5: distribución de resultados finales ---

  function renderTerminalDistribution(fStar, muDaily, sigmaDaily, rDaily) {
    const days = TRADING_DAYS * 3;
    const finals = Kelly.simulateTerminalValues(fStar, muDaily, sigmaDaily, rDaily, days, 3000);
    const med = Kelly.median(finals);
    medianStatEl.textContent = fmtNum(med, 2);
    Plots.renderTerminalHistogram(terminalHistogramEl, finals, med, I18N.t("charts.terminalValueAxis"), I18N.t("charts.frequencyAxis"), I18N.t("paso5.medianLabel"));
  }

  function renderFromState() {
    if (!state) return;
    const { p, b, mu, sigma, r, fStarContinuous } = state;
    const fStarBinary = renderBinaryPanel(p, b);
    renderContinuousPanel(mu, sigma, r);
    const muDaily = mu / TRADING_DAYS, sigmaDaily = sigma / Math.sqrt(TRADING_DAYS), rDaily = r / TRADING_DAYS;
    renderEquityCurves(fStarContinuous, muDaily, sigmaDaily, rDaily);
    renderTerminalDistribution(fStarContinuous, muDaily, sigmaDaily, rDaily);
  }

  async function runPipeline() {
    setBusy(true);

    try {
      const p = clamp((parseFloat(winProbInput.value) || 55) / 100, 0.001, 0.999);
      const b = clamp(parseFloat(netOddsInput.value) || 1, 0.01, 20);

      const ticker = (tickerInput.value || "AAPL").trim().toUpperCase();
      tickerInput.value = ticker;
      setStatus(I18N.t("app.fetching", { ticker }));

      const years = clamp(parseInt(yearsInput.value, 10) || 5, 1, 20);
      const json = await fetchPrices([ticker], years);
      const rows = (json.data || {})[ticker];
      if (!rows || rows.length < 60) throw new Error(I18N.t("app.fetchFailed", { ticker }));

      const closes = rows.map((r) => r.close);
      const { mu, sigma } = annualizedMeanVol(closes);
      const r = (parseFloat(riskfreeInput.value) || 4) / 100;
      const fStarContinuous = Kelly.continuousKelly(mu, sigma, r);

      state = { p, b, mu, sigma, r, fStarContinuous };
      renderFromState();
      setStatus(I18N.t("app.ready"));
    } catch (err) {
      setStatus(err.message || I18N.t("app.unexpectedError"), true);
    } finally {
      setBusy(false);
    }
  }

  recalcBtn.addEventListener("click", runPipeline);
  [tickerInput, riskfreeInput, yearsInput, winProbInput, netOddsInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runPipeline();
    });
  });

  langToggleBtn.addEventListener("click", () => {
    const next = I18N.getLocale() === "es" ? "en" : "es";
    I18N.setLocale(next);
    langToggleBtn.textContent = next === "es" ? "EN" : "ES";
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
      });
    }
    if (state) {
      renderFromState();
      setStatus(I18N.t("app.ready"));
    } else {
      setStatus(I18N.t("controls.loadingDefault"));
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    I18N.applyStaticTranslations();
    langToggleBtn.textContent = I18N.getLocale() === "es" ? "EN" : "ES";
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
      });
    }
    runPipeline();
  });
})();
