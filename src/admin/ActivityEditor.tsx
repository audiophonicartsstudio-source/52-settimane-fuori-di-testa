import type { Activity } from "../types";
import { bookingStates, outcomes, proofLabels } from "../../scripts/data.mjs";
import { participants, windowLabel } from "../model";
import { Save, RotateCcw } from "lucide-react";
export const fieldLabels: Record<string, string> = {
  attivita: "Esperienza",
  categoria: "Categoria",
  comune: "Comune",
  centro: "Scuola o centro",
  sede: "Sede",
  prezzo_persona_eur: "Prezzo per persona",
  prova_codice: "Formula di prova",
  fonte_url: "Fonte",
  cosa_verificare: "Cosa verificare",
  stato_prenotazione: "Prenotazione",
  data_ora_confermata: "Data e ora confermata",
  esito: "Esito",
  note_diario: "Diario",
  foto_url: "Foto",
  voto_ale: "Voto Ale",
  voto_paco: "Voto Paco",
  voto_francesca: "Voto Francesca",
  voto_clelia: "Voto Clelia",
};
export function ActivityEditor({
  draft: a,
  onChange,
  onSave,
  onReset,
  busy,
  dirty,
}: {
  draft: Activity;
  onChange: (a: Activity) => void;
  onSave: () => void;
  onReset: () => void;
  busy: boolean;
  dirty: boolean;
}) {
  const set = (key: keyof Activity, value: unknown) =>
    onChange({ ...a, [key]: value });
  const text = (
    key: keyof Activity,
    label: string,
    opts: {
      required?: boolean;
      type?: string;
      hint?: string;
      wide?: boolean;
    } = {},
  ) => (
    <label className={"admin-field " + (opts.wide ? "admin-wide" : "")}>
      <span>{label}</span>
      <input
        aria-label={label}
        type={opts.type || "text"}
        value={String(a[key] ?? "")}
        onChange={(e) => set(key, e.target.value)}
        required={opts.required}
        aria-describedby={opts.hint ? "hint-" + key : undefined}
      />
      {opts.hint && <small id={"hint-" + key}>{opts.hint}</small>}
    </label>
  );
  const area = (key: keyof Activity, label: string, hint?: string) => (
    <label className="admin-field admin-wide">
      <span>{label}</span>
      <textarea
        aria-label={label}
        value={String(a[key] ?? "")}
        onChange={(e) => set(key, e.target.value)}
        rows={4}
      />
      {hint && <small>{hint}</small>}
    </label>
  );
  return (
    <form
      className="activity-editor"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="editor-heading">
        <div>
          <span className="admin-week">{a.id} · Finestra prevista</span>
          <h2>{a.attivita}</h2>
          <p>{windowLabel(a)} · settimana indicativa</p>
        </div>
        <span className={"edit-status " + (dirty ? "unsaved" : "")}>
          {dirty ? "Modifiche da salvare" : "Nessuna modifica pendente"}
        </span>
      </div>
      <div className="editor-save-bar">
        <div>
          <strong>
            {dirty
              ? "Hai modifiche da salvare."
              : "Tutto salvato nell’archivio."}
          </strong>
          <small>
            Dopo il salvataggio, il sito si aggiorna con la pubblicazione
            automatica.
          </small>
        </div>
        <div>
          <button
            type="button"
            className="outline-button"
            onClick={onReset}
            disabled={busy || !dirty}
          >
            <RotateCcw size={16} />
            Annulla modifiche
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={busy || !dirty}
          >
            <Save size={17} />
            {busy ? "Salvataggio…" : "Salva esperienza"}
          </button>
        </div>
      </div>
      <fieldset disabled={busy}>
        <legend>Esperienza e scuola</legend>
        <div className="editor-fields">
          {text("attivita", "Nome dell’esperienza", {
            required: true,
            wide: true,
          })}
          {text("categoria", "Categoria", { required: true })}
          {text("comune", "Comune", { required: true })}
          {text("centro", "Scuola o centro", { required: true })}
          {text("sede", "Sede o indirizzo", { required: true })}
          <label className="admin-field">
            <span>Prezzo per persona (€)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={a.prezzo_persona_eur ?? ""}
              onChange={(e) =>
                set(
                  "prezzo_persona_eur",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
            <small>
              Vuoto: da verificare. Zero: gratuità documentata, da riconfermare.
            </small>
          </label>
          <label className="admin-field">
            <span>Formula di prova</span>
            <select
              value={a.prova_codice}
              onChange={(e) => set("prova_codice", e.target.value)}
            >
              {Object.entries(proofLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {key} · {label}
                </option>
              ))}
            </select>
            <small>
              Descrive la formula, non la disponibilità per il 2027.
            </small>
          </label>
          {text("fonte_url", "Link della fonte", { type: "url", wide: true })}
          {area("cosa_verificare", "Cosa verificare con la scuola")}
        </div>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>Prenotazione e risultato</legend>
        <div className="editor-fields">
          <label className="admin-field">
            <span>Stato della prenotazione</span>
            <select
              value={a.stato_prenotazione}
              onChange={(e) => set("stato_prenotazione", e.target.value)}
            >
              {bookingStates.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          {text("data_ora_confermata", "Data e ora confermata", {
            type: "datetime-local",
            hint: "Ora locale di Roma. Può essere diversa dalla finestra prevista.",
          })}
          <label className="admin-field admin-wide">
            <span>Esito dell’esperienza</span>
            <select
              value={a.esito}
              onChange={(e) => set("esito", e.target.value)}
            >
              {outcomes.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <small>
              Solo “Fatto” la aggiunge alle avventure e alle esperienze
              completate.
            </small>
          </label>
        </div>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>Diario e ricordi</legend>
        <div className="editor-fields">
          {area(
            "note_diario",
            "Note del diario",
            "Queste note appariranno sul sito pubblico.",
          )}
          {text("foto_url", "URL pubblico della foto", {
            type: "url",
            wide: true,
            hint: "Incolla il link di un’immagine pubblica. Nessun caricamento di file o foto private.",
          })}
        </div>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>I nostri voti</legend>
        <p className="fieldset-help">
          Da 1 a 10. Lascia vuoto il voto di chi non ha ancora votato.
        </p>
        <div className="editor-votes">
          {(
            ["voto_ale", "voto_paco", "voto_francesca", "voto_clelia"] as const
          ).map((key, i) => (
            <label className="admin-field" key={key}>
              <span>{participants[i]}</span>
              <input
                aria-label={"Voto " + participants[i]}
                type="number"
                inputMode="decimal"
                min="1"
                max="10"
                step="any"
                value={a[key] ?? ""}
                onChange={(e) =>
                  set(
                    key,
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
              />
            </label>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
