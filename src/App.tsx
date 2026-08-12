import { type CSSProperties, useMemo, useState } from "react";
import {
  argbFromHex,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  SchemeFidelity,
} from "@material/material-color-utilities";

const DEFAULT_SEED = "#456DB3";
const TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
const PRESETS = [
  { name: "nAI blue", value: "#456DB3" },
  { name: "Ember", value: "#B64A31" },
  { name: "Forest", value: "#2D6B57" },
  { name: "Plum", value: "#75558F" },
  { name: "Graphite", value: "#303640" },
];

const materialColors = new MaterialDynamicColors();

const ROLE_RESOLVERS = {
  primary: materialColors.primary(),
  onPrimary: materialColors.onPrimary(),
  primaryContainer: materialColors.primaryContainer(),
  onPrimaryContainer: materialColors.onPrimaryContainer(),
  secondary: materialColors.secondary(),
  onSecondary: materialColors.onSecondary(),
  secondaryContainer: materialColors.secondaryContainer(),
  onSecondaryContainer: materialColors.onSecondaryContainer(),
  tertiary: materialColors.tertiary(),
  onTertiary: materialColors.onTertiary(),
  tertiaryContainer: materialColors.tertiaryContainer(),
  onTertiaryContainer: materialColors.onTertiaryContainer(),
  error: materialColors.error(),
  onError: materialColors.onError(),
  errorContainer: materialColors.errorContainer(),
  onErrorContainer: materialColors.onErrorContainer(),
  surface: materialColors.surface(),
  onSurface: materialColors.onSurface(),
  surfaceVariant: materialColors.surfaceVariant(),
  onSurfaceVariant: materialColors.onSurfaceVariant(),
  surfaceContainerLowest: materialColors.surfaceContainerLowest(),
  surfaceContainerLow: materialColors.surfaceContainerLow(),
  surfaceContainer: materialColors.surfaceContainer(),
  surfaceContainerHigh: materialColors.surfaceContainerHigh(),
  surfaceContainerHighest: materialColors.surfaceContainerHighest(),
  outline: materialColors.outline(),
  outlineVariant: materialColors.outlineVariant(),
  inverseSurface: materialColors.inverseSurface(),
  inverseOnSurface: materialColors.inverseOnSurface(),
  inversePrimary: materialColors.inversePrimary(),
} as const;

type RoleName = keyof typeof ROLE_RESOLVERS;

function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return null;
}

function titleCase(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function cssVariable(value: string) {
  return `--${value.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
}

function readableText(hex: string) {
  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.6 ? "#101318" : "#FFFFFF";
}

export default function Home() {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [seedInput, setSeedInput] = useState(DEFAULT_SEED);
  const [dark, setDark] = useState(false);
  const [contrast, setContrast] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const generated = useMemo(() => {
    const source = argbFromHex(seed);
    const scheme = new SchemeFidelity(
      Hct.fromInt(source),
      dark,
      contrast,
    );

    const roles = Object.fromEntries(
      Object.entries(ROLE_RESOLVERS).map(([name, resolver]) => [
        name,
        hexFromArgb(resolver.getArgb(scheme)).toUpperCase(),
      ]),
    ) as Record<RoleName, string>;

    const palettes = [
      { name: "Primary", palette: scheme.primaryPalette },
      { name: "Secondary", palette: scheme.secondaryPalette },
      { name: "Tertiary", palette: scheme.tertiaryPalette },
      { name: "Neutral", palette: scheme.neutralPalette },
      { name: "Neutral variant", palette: scheme.neutralVariantPalette },
    ].map(({ name, palette }) => ({
      name,
      colors: TONES.map((tone) => ({
        tone,
        hex: hexFromArgb(palette.tone(tone)).toUpperCase(),
      })),
    }));

    return { roles, palettes };
  }, [seed, dark, contrast]);

  const themeStyle = {
    ...Object.fromEntries(
      Object.entries(generated.roles).map(([name, value]) => [
        cssVariable(name),
        value,
      ]),
    ),
    "--seed": seed,
  } as CSSProperties;

  const inputError = normalizeHex(seedInput) === null;

  function updateSeed(value: string) {
    setSeedInput(value);
    const normalized = normalizeHex(value);
    if (normalized) setSeed(normalized);
  }

  async function copyColor(name: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(name);
    window.setTimeout(() => setCopied(null), 1200);
  }

  return (
    <main className="theme-lab" style={themeStyle}>
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">TL</span>
          <div>
            <p>nAI Design Systems</p>
            <strong>Theme Color Lab</strong>
          </div>
        </div>
        <div className="topbar-meta">
          <span className="status-dot" />
          Material 3 · Fidelity
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Seed in. System out.</p>
          <h1>See what the SDK does with your backend color.</h1>
          <p className="hero-description">
            Enter the exact primary color sent by the backend. This lab generates
            the semantic roles used by a Material 3 interface and makes the
            transformation visible.
          </p>
        </div>

        <div className="seed-comparison" aria-label="Seed and generated primary comparison">
          <div className="comparison-swatch source-swatch">
            <span>Backend seed</span>
            <strong>{seed}</strong>
          </div>
          <div className="comparison-arrow" aria-hidden="true">→</div>
          <div className="comparison-swatch primary-swatch">
            <span>SDK primary</span>
            <strong>{generated.roles.primary}</strong>
          </div>
        </div>
      </section>

      <div className="workspace">
        <aside className="control-panel">
          <div className="panel-heading">
            <span>01</span>
            <div>
              <h2>Theme input</h2>
              <p>Adjust the source and environment.</p>
            </div>
          </div>

          <label className="field-label" htmlFor="seed-value">Backend primary</label>
          <div className={`color-field ${inputError ? "field-error" : ""}`}>
            <input
              type="color"
              value={seed}
              onChange={(event) => updateSeed(event.target.value)}
              aria-label="Choose backend primary color"
            />
            <input
              id="seed-value"
              value={seedInput}
              onChange={(event) => updateSeed(event.target.value)}
              spellCheck={false}
              aria-invalid={inputError}
              aria-describedby={inputError ? "seed-error" : undefined}
            />
          </div>
          {inputError && <p className="error-message" id="seed-error">Enter a 3 or 6 digit HEX color.</p>}

          <div className="preset-list" aria-label="Seed color presets">
            {PRESETS.map((preset) => (
              <button
                className={seed === preset.value ? "preset active" : "preset"}
                key={preset.value}
                onClick={() => updateSeed(preset.value)}
                type="button"
              >
                <span style={{ background: preset.value }} />
                {preset.name}
              </button>
            ))}
          </div>

          <div className="control-divider" />

          <div className="mode-control">
            <div>
              <span className="field-label">Brightness</span>
              <p>Generate role tones for the selected mode.</p>
            </div>
            <div className="segmented" role="group" aria-label="Theme brightness">
              <button className={!dark ? "selected" : ""} onClick={() => setDark(false)} type="button">Light</button>
              <button className={dark ? "selected" : ""} onClick={() => setDark(true)} type="button">Dark</button>
            </div>
          </div>

          <div className="contrast-control">
            <span>
              <span className="field-label" id="contrast-label">Contrast</span>
              <strong>{contrast.toFixed(1)}</strong>
            </span>
            <input
              id="contrast"
              type="range"
              aria-labelledby="contrast-label"
              min="-1"
              max="1"
              step="0.1"
              value={contrast}
              onChange={(event) => setContrast(Number(event.target.value))}
            />
            <span className="range-labels"><small>Lower</small><small>Flutter default</small><small>Higher</small></span>
          </div>

          <div className="method-note">
            <span aria-hidden="true">i</span>
            <p><strong>What matches Flutter?</strong> Fidelity variant, light or dark brightness, and contrast 0.0 mirror the current Theme V2 inputs.</p>
          </div>
        </aside>

        <section className="preview-column">
          <div className="section-heading">
            <div>
              <span>02</span>
              <div>
                <h2>Interface preview</h2>
                <p>Generated roles applied to realistic components.</p>
              </div>
            </div>
            <span className="mode-badge">{dark ? "Dark scheme" : "Light scheme"}</span>
          </div>

          <div className="app-preview">
            <div className="app-bar">
              <div>
                <span className="app-logo">nAI</span>
                <strong>Operations hub</strong>
              </div>
              <div className="avatar">PA</div>
            </div>
            <div className="app-body">
              <div className="app-intro">
                <div>
                  <p className="preview-eyebrow">Wednesday, 12 August</p>
                  <h3>Good afternoon</h3>
                  <p>Your safety overview is ready.</p>
                </div>
                <button className="primary-button" type="button">Create task</button>
              </div>

              <div className="metric-grid">
                <article className="metric-card accent-card">
                  <span>Open tasks</span>
                  <strong>24</strong>
                  <small>4 need attention</small>
                </article>
                <article className="metric-card">
                  <span>Completed</span>
                  <strong>87%</strong>
                  <small>+6% this week</small>
                </article>
                <article className="metric-card">
                  <span>Inspections</span>
                  <strong>12</strong>
                  <small>3 scheduled today</small>
                </article>
              </div>

              <div className="preview-content-grid">
                <article className="task-panel">
                  <div className="card-title-row">
                    <div>
                      <p className="preview-eyebrow">Priority queue</p>
                      <h4>Recent tasks</h4>
                    </div>
                    <button className="text-button" type="button">View all</button>
                  </div>
                  <div className="task-row">
                    <span className="task-icon">IN</span>
                    <div><strong>Site access inspection</strong><small>Due today · Sector 4</small></div>
                    <span className="chip">Open</span>
                  </div>
                  <div className="task-row">
                    <span className="task-icon secondary-icon">OB</span>
                    <div><strong>Equipment observation</strong><small>Due tomorrow · Workshop</small></div>
                    <span className="chip secondary-chip">Review</span>
                  </div>
                </article>

                <article className="action-panel">
                  <p className="preview-eyebrow">Quick action</p>
                  <h4>Ready for a walkthrough?</h4>
                  <p>Start a guided inspection and capture findings as you move.</p>
                  <button className="tonal-button" type="button">Begin walkthrough</button>
                  <button className="outline-button" type="button">Open checklist</button>
                </article>
              </div>
            </div>
          </div>

          <div className="section-heading roles-heading">
            <div>
              <span>03</span>
              <div>
                <h2>Semantic roles</h2>
                <p>Select a tile to copy its HEX value.</p>
              </div>
            </div>
          </div>
          <div className="role-grid">
            {(Object.entries(generated.roles) as [RoleName, string][]).map(([name, value]) => (
              <button
                className="role-card"
                key={name}
                onClick={() => copyColor(name, value)}
                style={{ background: value, color: readableText(value) }}
                type="button"
                aria-label={`Copy ${titleCase(name)} ${value}`}
              >
                <span>{titleCase(name)}</span>
                <strong>{copied === name ? "Copied" : value}</strong>
              </button>
            ))}
          </div>

          <div className="section-heading ramp-heading">
            <div>
              <span>04</span>
              <div>
                <h2>Tonal palettes</h2>
                <p>The generated tone ramps behind the semantic roles.</p>
              </div>
            </div>
          </div>
          <div className="palette-list">
            {generated.palettes.map((palette) => (
              <div className="palette-row" key={palette.name}>
                <strong>{palette.name}</strong>
                <div className="tone-ramp">
                  {palette.colors.map(({ tone, hex }) => (
                    <button
                      key={tone}
                      onClick={() => copyColor(`${palette.name}-${tone}`, hex)}
                      style={{ background: hex, color: readableText(hex) }}
                      type="button"
                      aria-label={`Copy ${palette.name} tone ${tone}, ${hex}`}
                    >
                      <span>{tone}</span>
                      <small>{copied === `${palette.name}-${tone}` ? "Copied" : hex.slice(1)}</small>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer>
        <p>Theme Color Lab</p>
        <p>Backend seed → Material Color Utilities → semantic UI roles</p>
      </footer>
    </main>
  );
}
