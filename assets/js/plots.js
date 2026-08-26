// Helpers de Plotly.js — mismo sistema de diseño que el resto de la serie.

const Plots = (() => {
  const COLORS = {
    bg: "#0f1420",
    paper: "#0f1420",
    grid: "#232b3d",
    text: "#c9d1e0",
    accent: "#34d399",
    accent2: "#f6ad55",
    accent3: "#f56565",
    muted: "#5a6478",
  };

  const CONFIG = {
    scrollZoom: true,
    displayModeBar: true,
    doubleClick: "reset+autosize",
    responsive: true,
    displaylogo: false,
  };

  function baseLayout(title, extra = {}) {
    return {
      title: title ? { text: title, font: { color: COLORS.text, size: 15 } } : undefined,
      paper_bgcolor: COLORS.paper,
      plot_bgcolor: COLORS.bg,
      font: { color: COLORS.text, family: "Inter, system-ui, sans-serif" },
      margin: { t: title ? 40 : 20, r: 20, b: 45, l: 55 },
      dragmode: "pan",
      hovermode: "x unified",
      xaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, ...(extra.xaxis || {}) },
      yaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, ...(extra.yaxis || {}) },
      legend: { font: { color: COLORS.text }, bgcolor: "rgba(0,0,0,0)" },
      ...extra,
    };
  }

  // g(f) vs. f, con una línea vertical marcando f* — el máximo interior que Kelly
  // encuentra, y por qué apostar de más reduce el crecimiento.
  function renderGrowthCurve(el, fRange, gValues, fStar, xLabel, yLabel) {
    const trace = {
      x: fRange, y: gValues, type: "scatter", mode: "lines",
      line: { color: COLORS.accent, width: 2.5 }, hovertemplate: "f=%{x:.2f}: %{y:.2%}<extra></extra>",
    };
    const layout = baseLayout(null, {
      shapes: [{ type: "line", x0: fStar, x1: fStar, y0: 0, y1: 1, yref: "paper", line: { color: COLORS.accent3, width: 1.5, dash: "dash" } }],
      annotations: [{ x: fStar, y: 1, yref: "paper", text: "f*", showarrow: false, yshift: 10, font: { color: COLORS.accent3, size: 12 } }],
      xaxis: { title: xLabel, gridcolor: COLORS.grid },
      yaxis: { title: yLabel, gridcolor: COLORS.grid, tickformat: ".1%" },
    });
    Plotly.newPlot(el, [trace], layout, CONFIG);
  }

  // Curvas de equity superpuestas (Kelly completo, medio, doble, sin apalancamiento) —
  // escala logarítmica en Y, porque el crecimiento es exponencial y las diferencias
  // solo se ven claramente en log.
  function renderEquityCurves(el, days, series, xLabel, yLabel) {
    const traces = series.map((s) => ({
      x: days, y: s.values, type: "scatter", mode: "lines", name: s.label,
      line: { color: s.color, width: 2 }, hovertemplate: "%{y:.2f}<extra></extra>",
    }));
    const layout = baseLayout(null, {
      yaxis: { title: yLabel, gridcolor: COLORS.grid, type: "log" },
      xaxis: { title: xLabel, gridcolor: COLORS.grid },
    });
    Plotly.newPlot(el, traces, layout, CONFIG);
  }

  // Histograma de valores terminales simulados (muchos caminos con la fracción elegida)
  // — muestra la distribución completa, no solo la mediana.
  function renderTerminalHistogram(el, finals, medianVal, xLabel, yLabel, medianLabel) {
    const trace = {
      x: finals, type: "histogram", nbinsx: 60,
      marker: { color: COLORS.muted }, opacity: 0.85,
    };
    const layout = baseLayout(null, {
      hovermode: "closest",
      shapes: [{ type: "line", x0: medianVal, x1: medianVal, y0: 0, y1: 1, yref: "paper", line: { color: COLORS.accent, width: 2, dash: "dash" } }],
      annotations: [{ x: medianVal, y: 1, yref: "paper", text: medianLabel, showarrow: false, yshift: 10, font: { color: COLORS.accent, size: 11 } }],
      xaxis: { title: xLabel, gridcolor: COLORS.grid },
      yaxis: { title: yLabel, gridcolor: COLORS.grid },
    });
    Plotly.newPlot(el, [trace], layout, CONFIG);
  }

  // Heatmap de sensibilidad: crecimiento REAL obtenido si se apuesta la fracción óptima
  // calculada con un mu supuesto, pero el mu verdadero resulta distinto — polaridad
  // (crecimiento positivo vs. negativo), no solo magnitud, así que usa una escala
  // divergente centrada en 0 en vez de una secuencial de un solo tono.
  function renderMisestimateHeatmap(el, assumedMuRange, trueMuRange, grid, xLabel, yLabel, zLabel) {
    const maxAbs = Math.max(...grid.flat().map((v) => Math.abs(v)), 1e-6);
    const trace = {
      z: grid,
      x: assumedMuRange.map((m) => (m * 100).toFixed(1) + "%"),
      y: trueMuRange.map((m) => (m * 100).toFixed(1) + "%"),
      type: "heatmap",
      zmin: -maxAbs,
      zmax: maxAbs,
      colorscale: [
        [0, COLORS.accent3],
        [0.5, "#141b2b"],
        [1, COLORS.accent],
      ],
      hovertemplate: `${xLabel}: %{x}<br>${yLabel}: %{y}<br>${zLabel}: %{z:.2%}<extra></extra>`,
      colorbar: { tickfont: { color: COLORS.text }, tickformat: ".0%", title: { text: zLabel, font: { color: COLORS.text } } },
    };
    const layout = baseLayout(null, {
      dragmode: false,
      hovermode: "closest",
      xaxis: { title: xLabel, gridcolor: COLORS.grid },
      yaxis: { title: yLabel, gridcolor: COLORS.grid },
    });
    Plotly.newPlot(el, [trace], layout, { ...CONFIG, scrollZoom: false });
  }

  return { COLORS, CONFIG, baseLayout, renderGrowthCurve, renderEquityCurves, renderTerminalHistogram, renderMisestimateHeatmap };
})();
