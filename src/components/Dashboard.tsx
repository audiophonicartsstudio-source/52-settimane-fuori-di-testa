import { ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";
import type { Activity } from "../types";
import {
  stats,
  nextActivity,
  windowLabel,
  confirmedLabel,
  cost,
  participants,
} from "../model";
export function Dashboard({
  items,
  onOpen,
  today,
}: {
  items: Activity[];
  onOpen: (a: Activity) => void;
  today: string;
}) {
  const s = stats(items, today),
    next = nextActivity(items, today);
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            52 settimane
            <br />
            fuori di <span>testa.</span>
            <Sparkles className="hero-spark" aria-hidden="true" />
          </h1>
          <p>
            Un anno per dire: <strong>«Perché no?»</strong>
            <br />
            Quattro amici, una disciplina nuova ogni settimana.
          </p>
          <div className="friends">
            <div className="avatars" aria-hidden="true">
              {participants.map((p, i) => (
                <span className={"avatar avatar-" + i} key={p}>
                  {p[0]}
                </span>
              ))}
            </div>
            <span>Ale, Paco, Francesca e Clelia</span>
          </div>
          <a className="primary-button" href="#calendario">
            Scopri il nostro anno <ArrowRight size={18} />
          </a>
        </div>
        <div
          className="year-poster"
          aria-label="2027: 52 settimane, 4 amici, zero corsi interi"
        >
          <div className="poster-top">
            <span>IL NOSTRO ANNO DI PRIME VOLTE</span>
            <ArrowUpRight size={25} />
          </div>
          <div className="poster-year">
            20<span>27</span>
            <span className="poster-star" aria-hidden="true">
              ✳
            </span>
          </div>
          <div className="poster-bottom">
            <span>
              52 settimane.
              <br />4 amici. Zero corsi interi.
            </span>
            <span className="poster-stamp">
              SI PROVA.
              <br />
              POI SI VEDE.
            </span>
          </div>
        </div>
      </section>
      <section className="dashboard" aria-label="Il nostro anno in numeri">
        <div className="progress-stat">
          <div>
            <strong>{s.percent}%</strong>
            <span>di nuove storie</span>
          </div>
          <progress
            max="100"
            value={s.percent}
            aria-label="Completamento esperienze"
          />
          <span>
            {s.done} di {s.total} esperienze vissute
          </span>
        </div>
        <div className="stat">
          <strong>{s.total}</strong>
          <span>Esperienze</span>
        </div>
        <div className="stat">
          <strong>{s.done}</strong>
          <span>Completate</span>
        </div>
        <div className="stat">
          <strong>{s.future}</strong>
          <span>Future</span>
        </div>
        <div className="stat">
          <strong>{s.booked}</strong>
          <span>Prenotate</span>
        </div>
        <div className="stat">
          <strong>{s.verify}</strong>
          <span>Da verificare</span>
        </div>
      </section>
      <div className="planning-note">
        <span className="status-dot" aria-hidden="true" />
        <p>
          <strong>Un piano, tutto da vivere.</strong> Le settimane sono
          indicative: date, disponibilità e prezzi vanno confermati con le
          scuole. Solo lezioni di prova, nessun corso intero.
        </p>
      </div>
      <section className="next-experience" aria-labelledby="next-title">
        <div className="next-label">
          <span className="small-arrow" aria-hidden="true">
            <ArrowUpRight size={22} />
          </span>
          <h2 id="next-title">Prossima esperienza</h2>
        </div>
        {next ? (
          <>
            <div className="next-description">
              <span>
                SETTIMANA {String(next.settimana).padStart(2, "0")} ·{" "}
                {next.categoria}
              </span>
              <h3>{next.attivita}</h3>
              <p>
                {next.data_ora_confermata
                  ? "Data confermata: " +
                    confirmedLabel(next.data_ora_confermata)
                  : "Finestra prevista: " + windowLabel(next)}
                <br />
                {next.centro} · {next.comune}
              </p>
            </div>
            <div className="next-action">
              <span>{cost(next).person}</span>
              <button className="outline-button" onClick={() => onOpen(next)}>
                Organizziamoci <ArrowRight size={17} />
              </button>
              <small>{next.stato_prenotazione}</small>
            </div>
          </>
        ) : (
          <p>
            Nessuna esperienza futura da fare. Le settimane trascorse restano da
            aggiornare manualmente.
          </p>
        )}
      </section>
    </>
  );
}
