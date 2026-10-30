import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Activity } from "../types";
import {
  calendarDays,
  eventDay,
  monthLabel,
  windowLabel,
  dateLabel,
} from "../model";
export function Calendar({
  items,
  month,
  onMonth,
  onOpen,
}: {
  items: Activity[];
  month: string;
  onMonth: (delta: number) => void;
  onOpen: (a: Activity) => void;
}) {
  const days = calendarDays(month);
  const weeks = Array.from({ length: days.length / 7 }, (_, i) =>
    days.slice(i * 7, i * 7 + 7),
  );
  return (
    <section className="calendar" aria-label="Calendario mensile">
      <div className="calendar-heading">
        <h3>{monthLabel(month)}</h3>
        <div>
          <button
            className="icon-button"
            onClick={() => onMonth(-1)}
            aria-label="Mese precedente"
          >
            <ChevronLeft />
          </button>
          <button
            className="icon-button"
            onClick={() => onMonth(1)}
            aria-label="Mese successivo"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      <p className="calendar-hint">
        Le esperienze indicative appaiono il lunedì d’inizio settimana, senza
        orario. Le date confermate sostituiscono la posizione indicativa.
      </p>
      <div className="calendar-grid">
        {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
          <div className="weekday" key={d}>
            {d}
          </div>
        ))}
        {calendarDays(month).map(({ day, number, inside }) => (
          <div
            className={"calendar-day " + (!inside ? "outside" : "")}
            key={day}
          >
            <time dateTime={day}>{number}</time>
            {items
              .filter((a) => eventDay(a) === day)
              .map((a) => (
                <button
                  className="calendar-event"
                  key={a.id}
                  onClick={() => onOpen(a)}
                  title={
                    a.attivita +
                    " · " +
                    (a.data_ora_confermata
                      ? "Data confermata"
                      : "Finestra prevista: " + windowLabel(a))
                  }
                >
                  <span>
                    W{String(a.settimana).padStart(2, "0")} ·{" "}
                    {a.data_ora_confermata
                      ? a.data_ora_confermata.slice(11)
                      : "Indicativa"}
                  </span>
                  <strong>{a.attivita}</strong>
                </button>
              ))}
          </div>
        ))}
      </div>
      <div className="calendar-mobile">
        <div className="mobile-weekdays">
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        {weeks.map((week) => {
          const events = items.filter((a) =>
            week.some((d) => d.day === eventDay(a)),
          );
          return (
            <div className="mobile-week" key={week[0].day}>
              <div className="mobile-week-dates">
                {week.map((d) => (
                  <time
                    key={d.day}
                    dateTime={d.day}
                    className={d.inside ? "" : "outside"}
                  >
                    {d.number}
                  </time>
                ))}
              </div>
              <div className="mobile-week-events">
                {events.length ? (
                  events.map((a) => (
                    <button
                      className="calendar-event"
                      key={a.id}
                      onClick={() => onOpen(a)}
                    >
                      <span>
                        W{String(a.settimana).padStart(2, "0")} ·{" "}
                        {a.data_ora_confermata
                          ? dateLabel(eventDay(a)) +
                            " · " +
                            a.data_ora_confermata.slice(11) +
                            " (Roma)"
                          : "Indicativa · " + windowLabel(a)}
                      </span>
                      <strong>{a.attivita}</strong>
                    </button>
                  ))
                ) : (
                  <p>
                    Nessuna esperienza prevista in questa settimana con i filtri
                    attivi.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
