import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { Activity, FilterState } from "../types";
import { months, emptyFilters, activityTowns } from "../model";
import { bookingStates, outcomes } from "../../scripts/data.mjs";
export function Filters({
  items,
  value,
  onChange,
}: {
  items: Activity[];
  value: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const set = (key: keyof FilterState, v: string) =>
    onChange({ ...value, [key]: v });
  const categories = [...new Set(items.map((a) => a.categoria))].sort();
  const towns = [...new Set(items.flatMap(activityTowns))].sort();
  const active = Object.values(value).some(Boolean);
  return (
    <div className="filters">
      <div className="search-row">
        <label className="search-field">
          <Search size={20} />
          <span className="sr-only">Cerca un'esperienza</span>
          <input
            value={value.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Cosa ti va di provare? Cerca un’esperienza…"
            type="search"
          />
        </label>
        <button
          className="reset-button"
          onClick={() => onChange({ ...emptyFilters })}
          disabled={!active}
        >
          <RotateCcw size={16} />
          Azzera filtri
        </button>
      </div>
      <div className="filter-row">
        <SlidersHorizontal
          className="filter-icon"
          size={18}
          aria-hidden="true"
        />
        {(
          [
            ["category", "Categoria", categories],
            ["town", "Comune", towns],
            ["booking", "Prenotazione", bookingStates],
            ["outcome", "Esito", outcomes],
          ] as [keyof FilterState, string, string[]][]
        ).map(([key, label, opts]) => (
          <label className="select-field" key={key}>
            <span>{label}</span>
            <select
              aria-label={label}
              value={value[key]}
              onChange={(e) => set(key, e.target.value)}
            >
              <option value="">
                Tutti{key === "category" ? " i tipi" : ""}
              </option>
              {opts.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <nav className="month-tabs" aria-label="Filtra per mese">
        <button
          aria-pressed={!value.month}
          className={!value.month ? "selected" : ""}
          onClick={() => set("month", "")}
        >
          Tutto l’anno
        </button>
        {months.map((m, i) => {
          const key = "2027-" + String(i + 1).padStart(2, "0");
          return (
            <button
              key={m}
              aria-pressed={value.month === key}
              className={value.month === key ? "selected" : ""}
              onClick={() => set("month", key)}
            >
              {m.slice(0, 3)}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
