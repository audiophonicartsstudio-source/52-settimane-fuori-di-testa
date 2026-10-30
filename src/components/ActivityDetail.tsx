import { useEffect, useRef } from "react";
import { X, ArrowUpRight, MapPin, CalendarDays, Info } from "lucide-react";
import type { Activity } from "../types";
import {
  cost,
  windowLabel,
  confirmedLabel,
  temporal,
  average,
  participants,
} from "../model";
import { proofLabels } from "../../scripts/data.mjs";
export function ActivityDetail({
  activity: a,
  onClose,
  today,
}: {
  activity: Activity;
  onClose: () => void;
  today: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, []);
  const price = cost(a),
    avg = average(a);
  return (
    <dialog
      ref={ref}
      aria-labelledby="detail-title"
      className="detail-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="detail-top">
        <span>SETTIMANA {String(a.settimana).padStart(2, "0")} / 52</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Chiudi dettagli"
          autoFocus
        >
          <X />
        </button>
      </div>
      <div className="detail-body">
        <span className="category">{a.categoria}</span>
        <h2 id="detail-title">{a.attivita}</h2>
        <p className="detail-location">
          <MapPin size={18} />
          {a.comune} · {a.centro}
        </p>
        <div className="detail-window">
          <CalendarDays size={22} />
          <div>
            <strong>Finestra prevista</strong>
            <p>{windowLabel(a)}</p>
            <small>Settimana indicativa, non un appuntamento.</small>
          </div>
        </div>
        <dl className="detail-facts">
          <div>
            <dt>Prenotazione</dt>
            <dd>{a.stato_prenotazione}</dd>
          </div>
          <div>
            <dt>Esito</dt>
            <dd>{a.esito}</dd>
          </div>
          <div>
            <dt>Stato temporale</dt>
            <dd>{temporal(a, today)}</dd>
          </div>
          <div>
            <dt>Data e ora confermata</dt>
            <dd>
              {a.data_ora_confermata
                ? confirmedLabel(a.data_ora_confermata)
                : "Non ancora concordata"}
            </dd>
          </div>
          <div>
            <dt>Sede</dt>
            <dd>{a.sede}</dd>
          </div>
          <div>
            <dt>Costo</dt>
            <dd>
              {price.person}
              {price.group && <small>{price.group}</small>}
            </dd>
          </div>
        </dl>
        <section className="detail-section">
          <h3>Che tipo di prova?</h3>
          <p>
            <span className="proof-code">{a.prova_codice}</span>{" "}
            {proofLabels[a.prova_codice]}
          </p>
          <p className="muted">
            Il codice descrive la formula documentata, non la disponibilità nel
            2027.
            {a.prezzo_persona_eur === 0
              ? " Gratuità indicata dalla fonte: da riconfermare per il 2027."
              : ""}
          </p>
        </section>
        <section className="verification">
          <Info size={20} />
          <div>
            <h3>Prima di partire</h3>
            <p>
              {a.cosa_verificare ||
                "Concordare disponibilità, formula di prova, sede e costo per quattro adulti."}
            </p>
          </div>
        </section>
        <section className="detail-section">
          <h3>Il nostro diario</h3>
          <p className={!a.note_diario ? "muted" : ""}>
            {a.note_diario || "La storia è ancora tutta da scrivere."}
          </p>
          {a.foto_url && (
            <img
              className="diary-photo"
              src={a.foto_url}
              alt={"Ricordo: " + a.attivita}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.hidden = true;
              }}
            />
          )}
        </section>
        <section className="detail-section">
          <h3>
            I nostri voti
            {avg !== null
              ? " · " +
                avg.toLocaleString("it-IT", { maximumFractionDigits: 1 }) +
                "/10 di media"
              : ""}
          </h3>
          <div className="votes">
            {participants.map((name, i) => (
              <div key={name}>
                <span>{name}</span>
                <strong>
                  {[a.voto_ale, a.voto_paco, a.voto_francesca, a.voto_clelia][
                    i
                  ] ?? "—"}
                  <small>/10</small>
                </strong>
              </div>
            ))}
          </div>
        </section>
        {a.fonte_url ? (
          <a
            className="primary-button school-button"
            href={a.fonte_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apri la scuola <ArrowUpRight size={18} />
          </a>
        ) : (
          <p className="muted">Scuola e fonte ancora da individuare.</p>
        )}
      </div>
    </dialog>
  );
}
