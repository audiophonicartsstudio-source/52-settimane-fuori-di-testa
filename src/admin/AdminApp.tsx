import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  RefreshCw,
  Search,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  LockKeyhole,
} from "lucide-react";
import type { Activity } from "../types";
import { months } from "../model";
import { columns, validateSnapshot } from "../../scripts/data.mjs";
import {
  GitHubClient,
  GitHubError,
  ConflictError,
  sameActivity,
  repositoryURL,
} from "./github";
import type { Records } from "./github";
import { Login } from "./Login";
import { ActivityEditor, fieldLabels } from "./ActivityEditor";
import { ConfirmDialog } from "./ConfirmDialog";
interface Session {
  client: GitHubClient;
  login: string;
}
interface Publication {
  activity: Activity;
  commit: string | null;
  online: boolean;
}
export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null),
    [records, setRecords] = useState<Records | null>(null),
    [draft, setDraft] = useState<Activity | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [message, setMessage] = useState("");
  const [query, setQuery] = useState(""),
    [month, setMonth] = useState(""),
    [pending, setPending] = useState<(() => void) | null>(null),
    [conflict, setConflict] = useState<Records | null>(null),
    [publication, setPublication] = useState<Publication | null>(null),
    [checking, setChecking] = useState(false);
  const base = records?.activities.find((a) => a.id === draft?.id) || null;
  const dirty = !!base && !!draft && !sameActivity(base, draft);
  const filtered = (records?.activities || []).filter(
    (a) =>
      (!month || a.settimana_inizio.slice(5, 7) === month) &&
      (!query ||
        [a.id, a.attivita, a.centro, a.comune, a.categoria]
          .join(" ")
          .toLocaleLowerCase("it")
          .includes(query.toLocaleLowerCase("it").trim())),
  );
  const ask = (action: () => void) => {
    if (dirty) setPending(() => action);
    else action();
  };
  useEffect(() => {
    if (!dirty && !busy) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty, busy]);
  useEffect(() => {
    if (!session) return;
    const clear = () => {
      session.client.clear();
      setSession(null);
      setMessage("Sessione terminata. Accedi di nuovo per continuare.");
    };
    window.addEventListener("pagehide", clear);
    return () => {
      window.removeEventListener("pagehide", clear);
      session.client.clear();
    };
  }, [session]);
  const publicationTarget = publication?.activity;
  async function checkPublication(target = publicationTarget) {
    if (!target) return;
    setChecking(true);
    try {
      const response = await fetch(
        import.meta.env.BASE_URL +
          "data/esperienze.json?verifica=" +
          Date.now(),
        {
          cache: "no-store",
          credentials: "omit",
          referrerPolicy: "no-referrer",
          signal: AbortSignal.timeout(12000),
        },
      );
      if (!response.ok) return;
      const snapshot = validateSnapshot(await response.json());
      const published = snapshot.activities.find(
        (a: Activity) => a.id === target.id,
      ) as Activity | undefined;
      if (published && sameActivity(published, target))
        setPublication((current) =>
          current && sameActivity(current.activity, target)
            ? { ...current, online: true }
            : current,
        );
    } catch {
      /* A publication delay or network issue must not undo a successful GitHub save. */
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    if (!publicationTarget) return;
    let attempts = 0;
    void checkPublication(publicationTarget);
    const timer = setInterval(() => {
      attempts++;
      if (attempts >= 20) {
        clearInterval(timer);
        return;
      }
      if (document.visibilityState === "visible")
        void checkPublication(publicationTarget);
    }, 30000);
    return () => clearInterval(timer);
  }, [publicationTarget]);
  function adopted(next: Records) {
    setRecords(next);
    setDraft({
      ...(next.activities.find((a) => a.id === draft?.id) ||
        next.activities[0]),
    });
    setConflict(null);
    setError("");
    setNotice("Dati aggiornati caricati dall’archivio condiviso.");
  }
  function handleFailure(e: unknown) {
    if (e instanceof GitHubError && e.status === 401 && session) {
      session.client.clear();
      setSession(null);
      setMessage(
        "Il token non è più valido. Accedi con un nuovo token; le modifiche non salvate restano in questa pagina finché non la chiudi.",
      );
    } else
      setError(
        e instanceof Error ? e.message : "Operazione non riuscita. Riprova.",
      );
  }
  async function reload() {
    if (!session || busy) return;
    setBusy(true);
    setError("");
    try {
      const latest = await session.client.load();
      const a = latest.activities.find((a) => a.id === draft?.id);
      if (dirty && a && draft && !sameActivity(a, draft))
        setPending(() => () => adopted(latest));
      else adopted(latest);
    } catch (e) {
      handleFailure(e);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!session || !base || !draft || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    setConflict(null);
    try {
      const saved = await session.client.save(base, draft);
      setRecords(saved);
      const a = saved.activities.find((a) => a.id === draft.id)!;
      setDraft({ ...a });
      setNotice(
        saved.alreadySaved
          ? "Questi dati risultano già salvati nell’archivio."
          : "Esperienza salvata nell’archivio condiviso.",
      );
      setPublication({ activity: a, commit: saved.commit, online: false });
    } catch (e) {
      if (e instanceof ConflictError) setConflict(e.latest || null);
      handleFailure(e);
    } finally {
      setBusy(false);
    }
  }
  function rebase() {
    if (!conflict || !draft || !base) return;
    const current = conflict.activities.find((a) => a.id === draft.id)!;
    const mine = Object.fromEntries(
      columns
        .filter(
          (key) => draft[key as keyof Activity] !== base[key as keyof Activity],
        )
        .map((key) => [key, draft[key as keyof Activity]]),
    );
    setRecords(conflict);
    setDraft({ ...current, ...mine });
    setConflict(null);
    setError("");
    setNotice(
      "Le tue modifiche sono state riportate sulla versione aggiornata. Controlla i campi prima di premere Salva: non è stato ancora salvato nulla.",
    );
  }
  function logout() {
    ask(() => {
      session?.client.clear();
      setSession(null);
      setRecords(null);
      setDraft(null);
      setError("");
      setNotice("");
      setConflict(null);
      setPublication(null);
      setMessage(
        "Sei uscito dalla gestione. Il token è stato rimosso dalla memoria della pagina.",
      );
    });
  }
  const currentConflict = conflict?.activities.find((a) => a.id === draft?.id);
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a className="brand" href={import.meta.env.BASE_URL}>
          <span className="brand-mark">52</span>
          <span>
            settimane
            <br />
            fuori di testa
          </span>
        </a>
        <a className="admin-back" href={import.meta.env.BASE_URL}>
          <ArrowLeft size={16} />
          Torna al sito
        </a>
        {session && (
          <div className="admin-account">
            <span>
              <LockKeyhole size={13} />
              {session.login}
            </span>
            <button className="outline-button" onClick={logout} disabled={busy}>
              <LogOut size={15} />
              Esci
            </button>
          </div>
        )}
      </header>
      {!session ? (
        <Login
          message={message}
          onLogin={(client, login, loaded) => {
            setSession({ client, login });
            if (!records || !draft) {
              setRecords(loaded);
              setDraft({ ...loaded.activities[0] });
            }
            setError("");
            setMessage("");
          }}
        />
      ) : (
        <main className="admin-workspace">
          <div className="admin-title">
            <div>
              <h1>Gestione esperienze</h1>
              <p>Un piano che cambia. Un diario che cresce.</p>
            </div>
            <button className="outline-button" disabled={busy} onClick={reload}>
              <RefreshCw size={16} />
              Ricarica dati
            </button>
          </div>
          <p className="admin-public-note">
            Tutti i dati salvati — note e voti compresi — vengono pubblicati sul
            sito. L’accesso protegge le modifiche, non la lettura.
          </p>
          {error && (
            <div className="admin-error" role="alert">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}
          {notice && (
            <p className="admin-notice" role="status">
              {notice}
            </p>
          )}
          {publication && (
            <div
              className={
                "publication-status " + (publication.online ? "is-online" : "")
              }
              role="status"
            >
              {publication.online ? (
                <CheckCircle2 size={21} />
              ) : (
                <Clock3 size={21} />
              )}
              <div>
                <strong>
                  {publication.online
                    ? publication.activity.id + " è aggiornato sul sito."
                    : "Salvato. Il sito si aggiornerà dopo la pubblicazione automatica."}
                </strong>
                <p>
                  {publication.online
                    ? "I dati pubblici corrispondono al tuo ultimo salvataggio."
                    : "Può richiedere alcuni minuti. Non devi salvare di nuovo o modificare il CSV."}
                </p>
                <div>
                  {publication.commit && (
                    <a
                      href={repositoryURL + "/commit/" + publication.commit}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Vedi salvataggio <ArrowUpRight size={13} />
                    </a>
                  )}
                  <a
                    href={repositoryURL + "/actions"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Stato pubblicazione <ArrowUpRight size={13} />
                  </a>
                  {!publication.online && (
                    <button
                      type="button"
                      onClick={() => void checkPublication()}
                      disabled={checking}
                    >
                      {checking ? "Verifica…" : "Controlla sito"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {conflict && draft && base && currentConflict && (
            <section
              className="conflict-panel"
              aria-labelledby="conflict-title"
            >
              <h2 id="conflict-title">Confronta le versioni</h2>
              <p>
                Nessun dato è stato sovrascritto. Questi campi sono cambiati
                nell’archivio dopo la tua apertura:
              </p>
              <dl>
                {columns
                  .filter(
                    (key) =>
                      base[key as keyof Activity] !==
                      currentConflict[key as keyof Activity],
                  )
                  .map((key) => (
                    <div key={key}>
                      <dt>{fieldLabels[key] || key}</dt>
                      <dd>
                        <span>
                          Ora salvato:{" "}
                          {String(
                            currentConflict[key as keyof Activity] ?? "—",
                          ) || "—"}
                        </span>
                        <span>
                          Nel tuo modulo:{" "}
                          {String(draft[key as keyof Activity] ?? "—") || "—"}
                        </span>
                      </dd>
                    </div>
                  ))}
              </dl>
              <button className="outline-button" onClick={rebase}>
                Riporta le mie modifiche sulla versione aggiornata
              </button>
              <p className="admin-help">
                Le tue modifiche restano da controllare e salvare. I campi che
                non hai modificato vengono aggiornati dall’archivio.
              </p>
            </section>
          )}
          <div className="admin-grid">
            <aside className="admin-chooser" aria-label="Seleziona esperienza">
              <h2>Le nostre 52 settimane</h2>
              <label className="admin-search">
                <Search size={17} />
                <span className="sr-only">Cerca esperienza da modificare</span>
                <input
                  type="search"
                  placeholder="Cerca nome, settimana, scuola…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label className="admin-field">
                <span>Mese previsto</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={busy}
                >
                  <option value="">Tutto l’anno</option>
                  {months.map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, "0")}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <p className="chooser-count" aria-live="polite">
                {filtered.length} esperienze trovate
              </p>
              <label className="admin-field mobile-activity-select">
                <span>Esperienza da modificare</span>
                <select
                  value={
                    filtered.some((a) => a.id === draft?.id) ? draft?.id : ""
                  }
                  onChange={(e) => {
                    const a = records?.activities.find(
                      (a) => a.id === e.target.value,
                    );
                    if (a)
                      ask(() => {
                        setDraft({ ...a });
                        setError("");
                        setNotice("");
                        setConflict(null);
                      });
                  }}
                  disabled={busy}
                >
                  <option value="" disabled>
                    Seleziona un’esperienza
                  </option>
                  {filtered.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} · {a.attivita}
                    </option>
                  ))}
                </select>
              </label>
              <div className="admin-activity-list">
                {filtered.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={a.id === draft?.id}
                    className={a.id === draft?.id ? "selected" : ""}
                    disabled={busy}
                    onClick={() => {
                      if (a.id !== draft?.id)
                        ask(() => {
                          setDraft({ ...a });
                          setError("");
                          setNotice("");
                          setConflict(null);
                        });
                    }}
                  >
                    <span>{a.id}</span>
                    <div>
                      <strong>{a.attivita}</strong>
                      <small>
                        {a.stato_prenotazione} · {a.esito}
                      </small>
                    </div>
                  </button>
                ))}
              </div>
              {!filtered.length && (
                <p className="admin-help">
                  Nessuna corrispondenza. Cambia ricerca o mese.
                </p>
              )}
            </aside>
            {draft && (
              <ActivityEditor
                draft={draft}
                onChange={setDraft}
                onSave={() => void save()}
                onReset={() =>
                  ask(() => {
                    if (base) setDraft({ ...base });
                    setError("");
                    setNotice("");
                    setConflict(null);
                  })
                }
                busy={busy}
                dirty={dirty}
              />
            )}
          </div>
        </main>
      )}
      <footer className="admin-footer">
        <span>52 settimane fuori di testa · Gestione riservata</span>
        <span>
          Una sola versione condivisa. Ogni salvataggio è tracciato su GitHub.
        </span>
      </footer>
      {pending && (
        <ConfirmDialog
          onCancel={() => setPending(null)}
          onConfirm={() => {
            const action = pending;
            setPending(null);
            action();
          }}
        />
      )}
    </div>
  );
}
