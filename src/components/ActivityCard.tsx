import { ArrowUpRight, MapPin, ArrowRight } from "lucide-react";
import type { Activity } from "../types";
import { cost, temporal, windowLabel } from "../model";
import { proofLabels } from "../../scripts/data.mjs";
export function ActivityCard({
  activity: a,
  compact = false,
  onOpen,
  today,
}: {
  activity: Activity;
  compact?: boolean;
  onOpen: (a: Activity) => void;
  today: string;
}) {
  const price = cost(a);
  return (
    <article
      className={"activity-card " + (compact ? "compact" : "")}
      data-testid="activity-card"
    >
      <div className="week-number">
        <span>SETT.</span>
        <strong>{String(a.settimana).padStart(2, "0")}</strong>
      </div>
      <div className="activity-content">
        <div className="card-top">
          <span className={"category cat-" + a.prova_codice}>
            {a.categoria}
          </span>
          <span className="date-window">{windowLabel(a)}</span>
        </div>
        <h3>
          <button className="title-button" onClick={() => onOpen(a)}>
            {a.attivita}
          </button>
        </h3>
        <p className="location">
          <MapPin size={14} />
          {a.comune} <span aria-hidden="true">·</span> {a.centro}
        </p>
        {!compact && (
          <>
            <div className="card-status">
              <span>{a.stato_prenotazione}</span>
              <span>{a.esito}</span>
              <span>{temporal(a, today)}</span>
            </div>
            <p className="proof">
              <span className="proof-code">{a.prova_codice}</span>
              {proofLabels[a.prova_codice]}
            </p>
          </>
        )}
        <div className="card-bottom">
          <div className="cost">
            <strong>{price.person}</strong>
            {price.group && <span>{price.group}</span>}
          </div>
          <div className="card-actions">
            {!compact && a.fonte_url && (
              <a
                href={a.fonte_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={"Apri la scuola: " + a.centro}
              >
                Scuola <ArrowUpRight size={15} />
              </a>
            )}
            <button
              onClick={() => onOpen(a)}
              aria-label={"Dettagli: " + a.attivita}
            >
              Dettagli <ArrowRight size={16} />
            </button>
          </div>
        </div>
        {a.prezzo_persona_eur === 0 && !compact && (
          <p className="price-note">
            Gratuità indicata dalla fonte · da riconfermare per il 2027
          </p>
        )}
      </div>
    </article>
  );
}
