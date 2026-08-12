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
  const [activeTab, setActiveTab] = useState("Overview");
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [radioValue, setRadioValue] = useState("Daily");
  const [sliderValue, setSliderValue] = useState(64);
  const [selectedSegment, setSelectedSegment] = useState("Week");
  const [menuOpen, setMenuOpen] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(true);
  const [notice, setNotice] = useState("Ready to explore components");
  const [density, setDensity] = useState("Comfort");
  const [favorite, setFavorite] = useState(false);
  const [filterActive, setFilterActive] = useState(true);
  const [inputChipVisible, setInputChipVisible] = useState(true);
  const [activeDestination, setActiveDestination] = useState("Home");
  const [selectedDate, setSelectedDate] = useState(12);
  const [timePeriod, setTimePeriod] = useState("AM");
  const [selectedCard, setSelectedCard] = useState("Safety briefing");
  const [selectedPerson, setSelectedPerson] = useState("Piyush Arora");
  const [carouselSlide, setCarouselSlide] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [sideSheetOpen, setSideSheetOpen] = useState(true);

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

  function showNotice(message: string) {
    setNotice(message);
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
                <button className="primary-button" onClick={() => showNotice("Task draft created")} type="button">Create task</button>
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
                    <button className="text-button" onClick={() => showNotice("Showing all priority tasks")} type="button">View all</button>
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
                  <button className="tonal-button" onClick={() => showNotice("Walkthrough started")} type="button">Begin walkthrough</button>
                  <button className="outline-button" onClick={() => showNotice("Checklist opened")} type="button">Open checklist</button>
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

      <section className="component-gallery" aria-labelledby="component-gallery-title">
        <div className="gallery-heading">
          <div className="section-heading">
            <div>
              <span>05</span>
              <div>
                <h2 id="component-gallery-title">Material 3 component gallery</h2>
                <p>Every current component family, rendered from this generated color scheme.</p>
              </div>
            </div>
            <span className="mode-badge">35 component families</span>
          </div>
          <p className="gallery-intro">
            Use this catalog as a visual regression surface: change the backend seed,
            mode, or contrast above and inspect how each semantic role behaves.
          </p>
        </div>

        <div className="component-catalog">
          <article className="component-family">
            <header>
              <span className="family-index">A</span>
              <div><h3>Actions</h3><p>Buttons, groups, and floating actions.</p></div>
            </header>
            <div className="specimen-grid">
              <div className="specimen specimen-wide">
                <span className="specimen-label">Buttons</span>
                <div className="button-showcase">
                  <button className="m3-button filled" onClick={() => showNotice("Filled button pressed")} type="button">Filled</button>
                  <button className="m3-button elevated" onClick={() => showNotice("Elevated button pressed")} type="button">Elevated</button>
                  <button className="m3-button tonal" onClick={() => showNotice("Tonal button pressed")} type="button">Tonal</button>
                  <button className="m3-button outlined" onClick={() => showNotice("Outlined button pressed")} type="button">Outlined</button>
                  <button className="m3-button text" onClick={() => showNotice("Text button pressed")} type="button">Text</button>
                </div>
              </div>
              <div className="specimen">
                <span className="specimen-label">Icon buttons</span>
                <div className="icon-button-row">
                  <button className="m3-icon-button standard" aria-label="Favorite" aria-pressed={favorite} onClick={() => { setFavorite((value) => !value); showNotice(favorite ? "Removed from favorites" : "Added to favorites"); }} type="button">{favorite ? "♥" : "♡"}</button>
                  <button className="m3-icon-button filled" aria-label="Favorite selected" onClick={() => { setFavorite(true); showNotice("Added to favorites"); }} type="button">♥</button>
                  <button className="m3-icon-button tonal" aria-label="Edit" onClick={() => showNotice("Edit mode enabled")} type="button">✎</button>
                  <button className="m3-icon-button outlined" aria-label="More options" onClick={() => setMenuOpen(true)} type="button">•••</button>
                </div>
              </div>
              <div className="specimen">
                <span className="specimen-label">Button groups</span>
                <div className="button-group" role="group" aria-label="View density">
                  {["Compact", "Comfort", "Wide"].map((option) => <button className={density === option ? "active" : ""} onClick={() => { setDensity(option); showNotice(`${option} density selected`); }} key={option} type="button">{option}</button>)}
                </div>
              </div>
              <div className="specimen">
                <span className="specimen-label">Split buttons</span>
                <div className="split-button">
                  <button onClick={() => showNotice("Task draft created")} type="button">Create task</button>
                  <button aria-label="More create options" onClick={() => setMenuOpen((value) => !value)} type="button">⌄</button>
                </div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Floating action buttons</span>
                <div className="fab-row">
                  <button className="fab small" aria-label="Add" onClick={() => showNotice("New item created")} type="button">+</button>
                  <button className="fab" aria-label="Edit" onClick={() => showNotice("Edit mode enabled")} type="button">✎</button>
                  <button className="fab extended" onClick={() => showNotice("New inspection started")} type="button"><span>＋</span> New inspection</button>
                </div>
              </div>
            </div>
          </article>

          <article className="component-family">
            <header>
              <span className="family-index">B</span>
              <div><h3>Inputs & selection</h3><p>Capture values and make choices.</p></div>
            </header>
            <div className="specimen-grid">
              <div className="specimen specimen-wide">
                <span className="specimen-label">Text fields</span>
                <div className="textfield-row">
                  <label className="m3-field filled-field"><span>Project name</span><input defaultValue="Safety review" /></label>
                  <label className="m3-field outlined-field"><span>Email address</span><input defaultValue="team@example.com" /></label>
                </div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Search</span>
                <label className="search-bar"><span aria-hidden="true">⌕</span><input aria-label="Search components" onChange={(event) => showNotice(event.target.value ? `Searching for ${event.target.value}` : "Search cleared")} placeholder="Search components" /><button aria-label="Voice search" onClick={() => showNotice("Voice search activated")} type="button">◉</button></label>
              </div>
              <div className="specimen">
                <span className="specimen-label">Checkbox</span>
                <label className="selection-row"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><span className="checkbox-control" aria-hidden="true">✓</span><span>Include archived</span></label>
              </div>
              <div className="specimen">
                <span className="specimen-label">Radio buttons</span>
                <div className="selection-stack">
                  {["Daily", "Weekly"].map((option) => <label className="selection-row" key={option}><input type="radio" name="frequency" checked={radioValue === option} onChange={() => setRadioValue(option)} /><span className="radio-control" aria-hidden="true" /><span>{option}</span></label>)}
                </div>
              </div>
              <div className="specimen">
                <span className="specimen-label">Switches</span>
                <label className="switch-row"><span>Live sync</span><input type="checkbox" checked={switchOn} onChange={(event) => setSwitchOn(event.target.checked)} /><span className="switch-control" aria-hidden="true"><span /></span></label>
              </div>
              <div className="specimen">
                <span className="specimen-label">Sliders</span>
                <div className="slider-wrap"><input type="range" min="0" max="100" value={sliderValue} onChange={(event) => setSliderValue(Number(event.target.value))} aria-label="Completion" /><output>{sliderValue}%</output></div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Chips</span>
                <div className="chip-row">
                  <button className="m3-chip assist" onClick={() => showNotice("Assistant suggestion applied")} type="button">✦ Assist</button>
                  <button className={`m3-chip filter ${filterActive ? "selected" : ""}`} aria-pressed={filterActive} onClick={() => { setFilterActive((value) => !value); showNotice(filterActive ? "Active filter removed" : "Active filter applied"); }} type="button">{filterActive && "✓ "}Active</button>
                  {inputChipVisible && <button className="m3-chip input" onClick={() => { setInputChipVisible(false); showNotice("Sector 4 removed"); }} type="button">Sector 4 <span>×</span></button>}
                  <button className="m3-chip suggestion" onClick={() => showNotice("Suggested filter added")} type="button">Suggested</button>
                </div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Segmented buttons</span>
                <div className="segmented-showcase" role="group" aria-label="Time range">
                  {["Day", "Week", "Month"].map((option) => <button className={selectedSegment === option ? "selected" : ""} onClick={() => setSelectedSegment(option)} key={option} type="button">{selectedSegment === option && <span>✓</span>}{option}</button>)}
                </div>
              </div>
            </div>
          </article>

          <article className="component-family family-span-two">
            <header>
              <span className="family-index">C</span>
              <div><h3>Navigation</h3><p>Move across destinations and content views.</p></div>
            </header>
            <div className="specimen-grid navigation-specimens">
              <div className="specimen specimen-wide">
                <span className="specimen-label">Top app bars</span>
                <div className="demo-topbar"><button aria-label="Open navigation" onClick={() => setSideSheetOpen(true)} type="button">☰</button><strong>Inspections</strong><span /><button aria-label="Search" onClick={() => showNotice("Search opened")} type="button">⌕</button><button aria-label="More" onClick={() => setMenuOpen((value) => !value)} type="button">⋮</button></div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Tabs</span>
                <div className="tabs" role="tablist">{["Overview", "Tasks", "Activity"].map((tab) => <button role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)} key={tab} type="button">{tab}</button>)}</div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Navigation bar</span>
                <nav className="navigation-bar" aria-label="Bottom navigation">{[["⌂", "Home"], ["✓", "Tasks"], ["♙", "People"], ["⚙", "Settings"]].map(([icon, destination]) => <button className={activeDestination === destination ? "active" : ""} onClick={() => { setActiveDestination(destination); showNotice(`${destination} selected`); }} key={destination} type="button"><span>{icon}</span>{destination}</button>)}</nav>
              </div>
              <div className="specimen">
                <span className="specimen-label">Navigation rail</span>
                <nav className="navigation-rail" aria-label="Rail navigation"><button className="rail-fab" aria-label="Create" onClick={() => showNotice("New item created")} type="button">＋</button>{[["⌂", "Home"], ["□", "Tasks"], ["⚙", "Settings"]].map(([icon, destination]) => <button className={activeDestination === destination ? "active" : ""} onClick={() => { setActiveDestination(destination); showNotice(`${destination} selected`); }} key={destination} type="button"><span>{icon}</span>{destination}</button>)}</nav>
              </div>
              <div className="specimen">
                <span className="specimen-label">Navigation drawer</span>
                <nav className="navigation-drawer" aria-label="Drawer navigation"><strong>Theme Lab</strong>{[["⌂", "Overview"], ["◫", "Components"], ["◉", "Tokens"]].map(([icon, destination]) => <button className={activeDestination === destination ? "active" : ""} onClick={() => { setActiveDestination(destination); showNotice(`${destination} selected`); }} key={destination} type="button"><span>{icon}</span>{destination}</button>)}</nav>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Bottom app bars</span>
                <div className="demo-bottom-bar"><button aria-label="Attach" onClick={() => showNotice("Attachment picker opened")} type="button">⌕</button><button aria-label="Delete" onClick={() => showNotice("Item moved to trash")} type="button">⌫</button><button aria-label="Archive" onClick={() => showNotice("Item archived")} type="button">□</button><span /><button className="fab small" aria-label="Add" onClick={() => showNotice("New item created")} type="button">＋</button></div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Toolbars</span>
                <div className="toolbar"><button onClick={() => showNotice("Undo complete")} type="button">↶ Undo</button><button onClick={() => showNotice("Redo complete")} type="button">↷ Redo</button><span /><button onClick={() => showNotice("Bold toggled")} type="button">B</button><button onClick={() => showNotice("Italic toggled")} type="button"><i>I</i></button><button onClick={() => showNotice("Alignment changed")} type="button">≡</button></div>
              </div>
            </div>
          </article>

          <article className="component-family">
            <header>
              <span className="family-index">D</span>
              <div><h3>Menus & cues</h3><p>Context, status, and lightweight guidance.</p></div>
            </header>
            <div className="specimen-grid">
              <div className="specimen specimen-wide menu-specimen">
                <span className="specimen-label">Menus</span>
                <button className="menu-trigger" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} type="button">Actions <span>⌄</span></button>
                {menuOpen && <div className="menu-popover"><button onClick={() => { showNotice("Edit selected"); setMenuOpen(false); }} type="button"><span>✎</span>Edit</button><button onClick={() => { showNotice("Duplicate created"); setMenuOpen(false); }} type="button"><span>□</span>Duplicate</button><div /><button className="danger" onClick={() => { showNotice("Delete selected"); setMenuOpen(false); }} type="button"><span>⌫</span>Delete</button></div>}
                {!menuOpen && <p className="specimen-hint">Select to preview the menu.</p>}
              </div>
              <div className="specimen">
                <span className="specimen-label">Badges</span>
                <div className="badge-row"><span className="badge-anchor">♢<i /></span><span className="badge-anchor">♧<b>8</b></span><span className="badge-anchor">✉<b>99+</b></span></div>
              </div>
              <div className="specimen">
                <span className="specimen-label">Tooltips</span>
                <div className="tooltip-demo"><button aria-describedby="favorite-tooltip" onClick={() => { setFavorite((value) => !value); showNotice(favorite ? "Removed from favorites" : "Added to favorites"); }} type="button">{favorite ? "♥" : "♡"}</button><span role="tooltip" id="favorite-tooltip">{favorite ? "Saved to favorites" : "Add to favorites"}</span></div>
              </div>
            </div>
          </article>

          <article className="component-family">
            <header>
              <span className="family-index">E</span>
              <div><h3>Pickers</h3><p>Date and time selection surfaces.</p></div>
            </header>
            <div className="specimen-grid picker-grid">
              <div className="specimen specimen-wide">
                <span className="specimen-label">Date pickers</span>
                <div className="date-picker">
                  <div className="picker-title"><span>Select date</span><strong>Wed, Aug 12</strong></div>
                  <div className="calendar-heading"><button aria-label="Previous month" onClick={() => showNotice("Previous month selected")} type="button">‹</button><strong>August 2026</strong><button aria-label="Next month" onClick={() => showNotice("Next month selected")} type="button">›</button></div>
                  <div className="calendar-grid"><b>S</b><b>M</b><b>T</b><b>W</b><b>T</b><b>F</b><b>S</b>{[9,10,11,12,13,14,15,16,17,18,19,20,21,22].map((day) => <button className={day === selectedDate ? "selected" : ""} onClick={() => { setSelectedDate(day); showNotice(`August ${day} selected`); }} key={day} type="button">{day}</button>)}</div>
                  <div className="picker-actions"><button onClick={() => { setSelectedDate(12); showNotice("Date selection cancelled"); }} type="button">Cancel</button><button onClick={() => showNotice(`August ${selectedDate} confirmed`)} type="button">OK</button></div>
                </div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Time pickers</span>
                <div className="time-picker"><span>Select time</span><div className="time-input"><strong>09</strong><b>:</b><strong>30</strong><div>{["AM", "PM"].map((period) => <button className={timePeriod === period ? "active" : ""} onClick={() => { setTimePeriod(period); showNotice(`${period} selected`); }} key={period} type="button">{period}</button>)}</div></div><button className="clock-face" aria-label="Set time to 9:30" onClick={() => showNotice(`09:30 ${timePeriod} selected`)} type="button"><i>12</i><i>3</i><i>6</i><i>9</i><span /></button><div className="picker-actions"><button onClick={() => showNotice("Time selection cancelled")} type="button">Cancel</button><button onClick={() => showNotice(`09:30 ${timePeriod} confirmed`)} type="button">OK</button></div></div>
              </div>
            </div>
          </article>

          <article className="component-family family-span-two">
            <header>
              <span className="family-index">F</span>
              <div><h3>Surfaces & content</h3><p>Structured information, collections, and containers.</p></div>
            </header>
            <div className="specimen-grid surfaces-grid">
              <div className="specimen specimen-wide">
                <span className="specimen-label">Cards</span>
                <div className="card-showcase">{[["elevated", "Elevated", "Safety briefing", "12 participants"], ["filled", "Filled", "Site checklist", "8 of 10 complete"], ["outlined", "Outlined", "Equipment audit", "Due Friday"]].map(([style, label, title, detail]) => <button className={`demo-card ${style} ${selectedCard === title ? "selected" : ""}`} onClick={() => { setSelectedCard(title); showNotice(`${title} selected`); }} key={title} type="button"><span>{label}</span><strong>{title}</strong><p>{detail}</p></button>)}</div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Lists & divider</span>
                <div className="demo-list">{[["PA", "Piyush Arora", "Inspector · Sector 4", ""], ["SK", "Sarah Khan", "Supervisor · Workshop", "alternate"]].map(([initials, person, detail, alternate], index) => <div className={selectedPerson === person ? "selected" : ""} key={person}><button className={`list-avatar ${alternate}`} aria-label={`Select ${person}`} onClick={() => { setSelectedPerson(person); showNotice(`${person} selected`); }} type="button">{initials}</button><button className="list-person" onClick={() => { setSelectedPerson(person); showNotice(`${person} selected`); }} type="button"><strong>{person}</strong><small>{detail}</small></button><button aria-label={`More options for ${person}`} onClick={() => { setSelectedPerson(person); setMenuOpen(true); }} type="button">⋮</button>{index === 0 && <hr />}</div>)}</div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Carousel</span>
                <div className="carousel">{[["Weekly safety pulse", "Explore trends across every active site."], ["24", "Open tasks"], ["87%", "Completion"]].map(([title, detail], index) => <button className={`${index === 0 ? "carousel-feature" : ""} ${carouselSlide === index ? "selected" : ""}`} onClick={() => { setCarouselSlide(index); showNotice(`${title} carousel card selected`); }} key={title} type="button">{index === 0 && <span>Featured</span>}<strong>{title}</strong><p>{detail}</p></button>)}</div>
              </div>
            </div>
          </article>

          <article className="component-family">
            <header>
              <span className="family-index">G</span>
              <div><h3>Feedback</h3><p>System status, progress, and messages.</p></div>
            </header>
            <div className="specimen-grid">
              <div className="specimen specimen-wide">
                <span className="specimen-label">Banners</span>
                {bannerVisible ? <div className="banner"><span aria-hidden="true">!</span><p><strong>Connection restored</strong>Your changes are syncing again.</p><button onClick={() => { setBannerVisible(false); showNotice("Banner dismissed"); }} type="button">Dismiss</button></div> : <button className="m3-button tonal" onClick={() => setBannerVisible(true)} type="button">Show banner</button>}
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Progress indicators</span>
                <div className="progress-showcase"><div><span className="linear-progress"><i /></span><small>Linear · 72%</small></div><div><span className="circular-progress" /><small>Circular</small></div><div><span className="expressive-loader"><i /><i /><i /></span><small>Loading</small></div></div>
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Snackbars</span>
                {snackbarVisible ? <div className="snackbar"><span>{notice}</span><button onClick={() => showNotice("Action undone")} type="button">Undo</button><button aria-label="Dismiss" onClick={() => setSnackbarVisible(false)} type="button">×</button></div> : <button className="m3-button tonal" onClick={() => setSnackbarVisible(true)} type="button">Show snackbar</button>}
              </div>
            </div>
          </article>

          <article className="component-family">
            <header>
              <span className="family-index">H</span>
              <div><h3>Overlays</h3><p>Focused tasks and supplemental content.</p></div>
            </header>
            <div className="specimen-grid overlay-grid">
              <div className="specimen specimen-wide">
                <span className="specimen-label">Dialogs</span>
                {dialogOpen ? <div className="dialog"><span className="dialog-icon">✓</span><h4>Publish theme?</h4><p>This color scheme will become available to your team.</p><div><button onClick={() => { setDialogOpen(false); showNotice("Publish cancelled"); }} type="button">Cancel</button><button onClick={() => { setDialogOpen(false); showNotice("Theme published"); }} type="button">Publish</button></div></div> : <button className="m3-button tonal" onClick={() => setDialogOpen(true)} type="button">Open dialog</button>}
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Bottom sheets</span>
                {sheetOpen ? <div className="bottom-sheet"><button className="sheet-drag-handle" aria-label="Close share sheet" onClick={() => setSheetOpen(false)} type="button"><i /></button><strong>Share theme</strong><p>Choose where to send this generated color scheme.</p><div><button onClick={() => showNotice("Share email opened")} type="button"><span>✉</span>Email</button><button onClick={() => showNotice("Share link copied")} type="button"><span>↗</span>Copy link</button><button onClick={() => showNotice("Theme exported")} type="button"><span>↓</span>Export</button></div></div> : <button className="m3-button tonal" onClick={() => setSheetOpen(true)} type="button">Open bottom sheet</button>}
              </div>
              <div className="specimen specimen-wide">
                <span className="specimen-label">Side sheets</span>
                {sideSheetOpen ? <div className="side-sheet"><div className="sheet-canvas"><span>Workspace</span></div><aside><button aria-label="Close" onClick={() => setSideSheetOpen(false)} type="button">×</button><strong>Theme details</strong><p>Fidelity scheme<br />Contrast {contrast.toFixed(1)}</p><button className="m3-button filled" onClick={() => showNotice("Theme applied to workspace")} type="button">Apply theme</button></aside></div> : <button className="m3-button tonal" onClick={() => setSideSheetOpen(true)} type="button">Open side sheet</button>}
              </div>
            </div>
          </article>
        </div>
      </section>

      <footer>
        <p>Theme Color Lab</p>
        <p>Backend seed → Material Color Utilities → semantic UI roles</p>
      </footer>
    </main>
  );
}
