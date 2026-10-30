import { useEffect, useState } from "react";
import {
  CalendarDays,
  Rows3,
  List,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import initial from "../data/esperienze_2027.json";
import { validateSnapshot } from "../scripts/data.mjs";
import type { Activity, Snapshot, FilterState } from "./types";
import {
  emptyFilters,
  filterActivities,
  romeToday,
  shiftMonth,
  calendarDays,
  eventDay,
} from "./model";
import { Dashboard } from "./components/Dashboard";
import { Filters } from "./components/Filters";
import { Timeline } from "./components/Timeline";
import { Calendar } from "./components/Calendar";
import { ActivityDetail } from "./components/ActivityDetail";
import { Adventures } from "./components/Adventures";
import { Footer } from "./components/Footer";
export default function App() {
  const [data, setData] = useState<Snapshot>(initial as Snapshot),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState<FilterState>({ ...emptyFilters }),
    [view, setView] = useState<"timeline" | "compact" | "calendar">("timeline"),
    [selected, setSelected] = useState<Activity | null>(null),
    [calendarMonth, setCalendarMonth] = useState("2027-01"),
    [today, setToday] = useState(romeToday());
  useEffect(() => {
    const timer = setInterval(() => setToday(romeToday()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    setLoading(true);
    fetch(import.meta.env.BASE_URL + "data/esperienze.json", {
      signal: controller.signal,
      cache: "no-cache",
    })
      .then((r) => {
        if (!r.ok) throw Error("HTTP " + r.status);
        return r.json();
      })
      .then((v) => {
        setData(validateSnapshot(v) as Snapshot);
        setError(false);
      })
      .catch(() => {
        if (!controller.signal.aborted || !cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    let cancelled = false;
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);
  const visible = filterActivities(data.activities, filters);
  const calendarItems = filterActivities(data.activities, {
    ...filters,
    month: "",
  });
  const displayedDays = new Set(calendarDays(calendarMonth).map((d) => d.day));
  const resultCount =
    view === "calendar"
      ? calendarItems.filter((a) => displayedDays.has(eventDay(a))).length
      : visible.length;
  const changeFilters = (f: FilterState) => {
    setFilters(f);
    if (f.month) setCalendarMonth(f.month);
  };
  return (
    <>
      <a className="skip-link" href="#calendario">
        Vai al calendario
      </a>
      <header id="inizio">
        <a href="#inizio" className="brand">
          <span className="brand-mark">52</span>
          <span>
            settimane
            <br />
            fuori di testa
          </span>
        </a>
        <nav aria-label="Navigazione principale">
          <a href="#calendario">Il calendario</a>
          <a href="#avventure">Le avventure</a>
        </nav>
        <span className="year-label">
          EDIZIONE 2027 <ArrowUpRight size={15} />
        </span>
      </header>
      <main>
        <Dashboard items={data.activities} onOpen={setSelected} today={today} />
        <section
          className="calendar-section"
          id="calendario"
          aria-labelledby="calendar-title"
        >
          <div className="section-intro">
            <div>
              <h2 id="calendar-title">Il nostro anno, una prova alla volta.</h2>
              <p>Dal «non l’ho mai fatto» al «lo rifacciamo?».</p>
            </div>
            <span className="section-count">2027 → 2028</span>
          </div>
          {loading && (
            <p role="status" className="loading">
              Aggiornamento del calendario…
            </p>
          )}
          {(error || data.meta.stale) && (
            <div className="sync-warning" role="status">
              <AlertCircle size={21} />
              <p>
                {error
                  ? "Il calendario aggiornato non è raggiungibile. Mostriamo l’ultimo snapshot valido disponibile."
                  : data.meta.sync_error}{" "}
                I dati potrebbero non essere aggiornati.
              </p>
              <button
                className="outline-button"
                onClick={() => setAttempt((n) => n + 1)}
                disabled={loading}
              >
                <RefreshCw size={16} />
                Riprova
              </button>
            </div>
          )}
          <Filters
            items={data.activities}
            value={filters}
            onChange={changeFilters}
          />
          <div className="results-toolbar">
            <p aria-live="polite">
              <strong>{resultCount}</strong> di {data.activities.length}{" "}
              esperienze
              {view === "calendar"
                ? " nella griglia"
                : filters.month
                  ? " nel mese selezionato"
                  : ""}
            </p>
            <div
              className="view-switch"
              role="group"
              aria-label="Vista calendario"
            >
              {(
                [
                  ["timeline", Rows3, "Timeline"],
                  ["compact", List, "Compatta"],
                  ["calendar", CalendarDays, "Calendario"],
                ] as const
              ).map(([key, Icon, label]) => (
                <button
                  key={key}
                  aria-label={label}
                  title={label}
                  aria-pressed={view === key}
                  className={view === key ? "active" : ""}
                  onClick={() => setView(key)}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          {view === "calendar" ? (
            <Calendar
              items={calendarItems}
              month={calendarMonth}
              onMonth={(d) => {
                const m = shiftMonth(calendarMonth, d);
                setCalendarMonth(m);
                setFilters((f) => ({ ...f, month: m }));
              }}
              onOpen={setSelected}
            />
          ) : visible.length ? (
            <Timeline
              items={visible}
              compact={view === "compact"}
              onOpen={setSelected}
              today={today}
            />
          ) : (
            <div className="empty-state">
              <h3>Nessuna esperienza con questi filtri.</h3>
              <p>
                Prova a cercare qualcosa di diverso o torna all’anno completo.
              </p>
              <button
                className="outline-button"
                onClick={() => changeFilters({ ...emptyFilters })}
              >
                Mostra tutte le 52 esperienze
              </button>
            </div>
          )}
          <details className="legend">
            <summary>Come leggere il calendario</summary>
            <p>
              Le finestre settimanali sono proposte. Prenotazione ed esito sono
              aggiornati manualmente; una data passata non significa esperienza
              completata. “Da verificare” conta le attività da fare senza
              prenotazione; “Future” conta quelle da fare con data o settimana
              d’inizio non precedente a oggi, a Roma.
            </p>
            <dl>
              <div>
                <dt>P · Prova pubblicata</dt>
                <dd>Formula documentata dalla fonte.</dd>
              </div>
              <div>
                <dt>S · Stagionale da riconfermare</dt>
                <dd>Prova pubblicata per una stagione precedente.</dd>
              </div>
              <div>
                <dt>V · Da verificare</dt>
                <dd>La formula per quattro persone va concordata.</dd>
              </div>
              <div>
                <dt>A · Accesso singolo</dt>
                <dd>Non una prova formalmente indicata.</dd>
              </div>
              <div>
                <dt>I · Idea da trovare</dt>
                <dd>Scuola e formula ancora da individuare.</dd>
              </div>
            </dl>
            <p>
              Nessun codice garantisce disponibilità nel 2027. Prezzo vuoto:
              sconosciuto. Prezzo zero: gratuità riportata dalla fonte, da
              riconfermare.
            </p>
          </details>
        </section>
        <Adventures items={data.activities} onOpen={setSelected} />
      </main>
      <Footer meta={data.meta} />
      {selected && (
        <ActivityDetail
          activity={selected}
          onClose={() => setSelected(null)}
          today={today}
        />
      )}
    </>
  );
}
