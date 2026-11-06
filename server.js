const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Conversion data ----------
// Linear categories: each unit's factor converts it to a base unit.
const CATEGORIES = {
  length: {
    title: 'Length',
    label: 'Enter the length to convert',
    base: 'meter',
    units: {
      millimeter: { symbol: 'mm', factor: 0.001 },
      centimeter: { symbol: 'cm', factor: 0.01 },
      meter: { symbol: 'm', factor: 1 },
      kilometer: { symbol: 'km', factor: 1000 },
      inch: { symbol: 'in', factor: 0.0254 },
      foot: { symbol: 'ft', factor: 0.3048 },
      yard: { symbol: 'yd', factor: 0.9144 },
      mile: { symbol: 'mi', factor: 1609.344 },
    },
  },
  weight: {
    title: 'Weight',
    label: 'Enter the weight to convert',
    base: 'gram',
    units: {
      milligram: { symbol: 'mg', factor: 0.001 },
      gram: { symbol: 'g', factor: 1 },
      kilogram: { symbol: 'kg', factor: 1000 },
      ounce: { symbol: 'oz', factor: 28.349523125 },
      pound: { symbol: 'lb', factor: 453.59237 },
    },
  },
  temperature: {
    title: 'Temperature',
    label: 'Enter the temperature to convert',
    units: {
      celsius: { symbol: '°C' },
      fahrenheit: { symbol: '°F' },
      kelvin: { symbol: 'K' },
    },
  },
};

const toCelsius = {
  celsius: (v) => v,
  fahrenheit: (v) => ((v - 32) * 5) / 9,
  kelvin: (v) => v - 273.15,
};
const fromCelsius = {
  celsius: (c) => c,
  fahrenheit: (c) => (c * 9) / 5 + 32,
  kelvin: (c) => c + 273.15,
};

function convert(type, value, from, to) {
  if (type === 'temperature') {
    return fromCelsius[to](toCelsius[from](value));
  }
  const { units } = CATEGORIES[type];
  return (value * units[from].factor) / units[to].factor;
}

function formatNumber(n) {
  // Up to 6 decimals, no trailing zeros, no exponent for normal ranges.
  const rounded = Math.round((n + Number.EPSILON) * 1e6) / 1e6;
  const safe = Object.is(rounded, -0) ? 0 : rounded;
  return safe.toLocaleString('en-US', { maximumFractionDigits: 6, useGrouping: false });
}

// ---------- Rendering ----------
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderTabs(active) {
  return Object.entries(CATEGORIES)
    .map(([key, c]) => {
      const current = key === active ? ' class="active" aria-current="page"' : '';
      return `<a href="/${key}"${current}>${c.title}</a>`;
    })
    .join('');
}

function renderOptions(units, selected) {
  return Object.entries(units)
    .map(([name, u]) => {
      const sel = name === selected ? ' selected' : '';
      const label = name.charAt(0).toUpperCase() + name.slice(1);
      return `<option value="${name}"${sel}>${label} (${esc(u.symbol)})</option>`;
    })
    .join('');
}

function renderPage(type, { values = {}, error = '', result = null } = {}) {
  const cat = CATEGORIES[type];
  const names = Object.keys(cat.units);
  const from = values.from || names[0];
  const to = values.to || names[1];

  let body;
  if (result) {
    body = `
      <section class="result" aria-live="polite">
        <p class="result-label">Result of your calculation</p>
        <p class="result-value">${esc(result)}</p>
        <a class="button secondary" href="/${type}">Reset</a>
      </section>`;
  } else {
    body = `
      <form method="post" action="/${type}" target="_self" novalidate>
        ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}
        <label for="value">${cat.label}</label>
        <input id="value" name="value" type="text" inputmode="decimal" autocomplete="off"
               value="${esc(values.value || '')}" required autofocus>

        <label for="from">Unit to convert from</label>
        <select id="from" name="from">${renderOptions(cat.units, from)}</select>

        <label for="to">Unit to convert to</label>
        <select id="to" name="to">${renderOptions(cat.units, to)}</select>

        <button class="button" type="submit">Convert</button>
      </form>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${cat.title} · Unit Converter</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main class="card">
    <h1>Unit Converter</h1>
    <nav class="tabs" aria-label="Measurement type">${renderTabs(type)}</nav>
    ${body}
  </main>
</body>
</html>`;
}

// ---------- Routes ----------
app.get('/', (req, res) => res.redirect('/length'));

for (const type of Object.keys(CATEGORIES)) {
  app.get(`/${type}`, (req, res) => res.send(renderPage(type)));

  app.post(`/${type}`, (req, res) => {
    const cat = CATEGORIES[type];
    const { value = '', from, to } = req.body;
    const values = { value, from, to };
    const raw = String(value).trim().replace(/,/g, '');

    if (raw === '' || !/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(raw)) {
      return res.status(400).send(renderPage(type, { values, error: 'Enter a number, like 12 or 3.5.' }));
    }
    if (!cat.units[from] || !cat.units[to]) {
      return res.status(400).send(renderPage(type, { values, error: 'Choose a unit to convert from and to.' }));
    }

    const num = parseFloat(raw);
    if (type === 'temperature' && from === 'kelvin' && num < 0) {
      return res.status(400).send(renderPage(type, { values, error: 'Kelvin can’t be below 0.' }));
    }
    if (type === 'temperature' && from === 'celsius' && num < -273.15) {
      return res.status(400).send(renderPage(type, { values, error: 'Celsius can’t be below −273.15.' }));
    }
    if (type === 'temperature' && from === 'fahrenheit' && num < -459.67) {
      return res.status(400).send(renderPage(type, { values, error: 'Fahrenheit can’t be below −459.67.' }));
    }

    const out = convert(type, num, from, to);
    const result = `${formatNumber(num)} ${cat.units[from].symbol} = ${formatNumber(out)} ${cat.units[to].symbol}`;
    res.send(renderPage(type, { values, result }));
  });
}

app.listen(PORT, () => console.log(`Unit converter running at http://localhost:${PORT}`));
