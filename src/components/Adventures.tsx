import { Camera, ArrowUpRight } from "lucide-react";
import type { Activity } from "../types";
import { average, dateLabel } from "../model";
export function Adventures({
  items,
  onOpen,
}: {
  items: Activity[];
  onOpen: (a: Activity) => void;
}) {
  const done = items.filter((a) => a.esito === "Fatto");
  return (
    <section className="adventures" id="avventure">
      <div className="section-intro">
        <div>
          <h2>Le nostre avventure</h2>
          <p>Qui raccoglieremo quelle che diventano storie.</p>
        </div>
        <span className="section-count">{done.length} vissute</span>
      </div>
      {done.length ? (
        <div className="adventure-grid">
          {done.map((a) => (
            <article className="adventure" key={a.id}>
              {a.foto_url && (
                <img
                  src={a.foto_url}
                  alt={"Ricordo: " + a.attivita}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.hidden = true;
                  }}
                />
              )}
              <span>
                {a.categoria} ·{" "}
                {dateLabel(a.data_ora_confermata || a.settimana_inizio, true)}
              </span>
              <h3>
                <button onClick={() => onOpen(a)}>
                  {a.attivita}
                  <ArrowUpRight size={18} />
                </button>
              </h3>
              {a.note_diario && <p>{a.note_diario}</p>}
              <p>
                {average(a) !== null
                  ? "Voto medio: " +
                    average(a)!.toLocaleString("it-IT", {
                      maximumFractionDigits: 1,
                    }) +
                    "/10"
                  : "Voti ancora da raccogliere"}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="adventure-empty">
          <Camera size={35} strokeWidth={1.5} />
          <h3>Le prime volte non si dimenticano.</h3>
          <p>
            Per ora, il bello deve ancora cominciare.
            <br />
            Le esperienze appariranno qui solo dopo averle fatte davvero.
          </p>
          <a href="#calendario">
            Intanto, scegliamo da dove iniziare <ArrowUpRight size={16} />
          </a>
        </div>
      )}
    </section>
  );
}
