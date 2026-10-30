import { useState } from "react";
import { LockKeyhole, ArrowUpRight, ArrowRight, KeyRound } from "lucide-react";
import { createTokenURL, GitHubClient, repositoryURL } from "./github";
import type { Records } from "./github";
export function Login({
  onLogin,
  message,
}: {
  onLogin: (client: GitHubClient, login: string, records: Records) => void;
  message: string;
}) {
  const [token, setToken] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    let client: GitHubClient | undefined;
    try {
      client = new GitHubClient(token);
      const session = await client.login();
      onLogin(client, session.login, session.records);
    } catch (e) {
      client?.clear();
      setError(
        e instanceof Error ? e.message : "Accesso non riuscito. Riprova.",
      );
    } finally {
      setToken("");
      setBusy(false);
    }
  }
  return (
    <main className="admin-login">
      <section className="admin-welcome">
        <LockKeyhole size={34} strokeWidth={1.5} />
        <h1>
          Il dietro
          <br />
          le quinte.
        </h1>
        <p>
          Le prossime prove, gli appuntamenti presi e i voti delle nostre
          avventure. Tutto da un unico posto.
        </p>
        <ul>
          <li>Modifica le 52 esperienze.</li>
          <li>Aggiorna prenotazioni e diario.</li>
          <li>Raccogli i voti di tutti e quattro.</li>
        </ul>
        <p className="admin-login-note">
          L’accesso è riservato a chi può modificare il nostro archivio GitHub.
          Il sito pubblico rimane consultabile da tutti.
        </p>
      </section>
      <section className="admin-login-panel" aria-labelledby="login-title">
        <KeyRound size={25} />
        <h2 id="login-title">Entra nella gestione</h2>
        <p>
          Usa la tua chiave GitHub riservata a questo progetto. Non è la
          password del tuo account.
        </p>
        {message && (
          <p className="admin-notice" role="status">
            {message}
          </p>
        )}
        <form onSubmit={submit}>
          <label className="admin-field">
            <span>Token di accesso GitHub</span>
            <input
              type="password"
              name="access-key"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="none"
              required
              disabled={busy}
              maxLength={512}
              aria-describedby="token-help"
              placeholder="github_pat_…"
            />
          </label>
          <p id="token-help" className="admin-help">
            Viene inviato soltanto a GitHub. Rimane in memoria fino all’uscita o
            alla chiusura della pagina, senza essere salvato nel browser.
          </p>
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="primary-button"
            disabled={busy || !token.trim()}
          >
            {busy ? "Verifica accesso…" : "Accedi"}
            <ArrowRight size={18} />
          </button>
        </form>
        <details className="token-instructions">
          <summary>Non hai ancora una chiave di accesso?</summary>
          <ol>
            <li>
              Apri{" "}
              <a
                href={createTokenURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Crea token su GitHub <ArrowUpRight size={13} />
              </a>{" "}
              con l’account proprietario del progetto.
            </li>
            <li>
              In <strong>Repository access</strong>, scegli{" "}
              <strong>Only select repositories</strong> e seleziona soltanto{" "}
              <strong>52-settimane-fuori-di-testa</strong>.
            </li>
            <li>
              Controlla il permesso <strong>Contents: Read and write</strong> e
              una scadenza, per esempio 30 giorni. Non servono permessi di
              amministrazione o workflow.
            </li>
            <li>
              Genera il token, copialo e incollalo nel campo qui sopra.
              Conservane una copia nel tuo gestore di password se vuoi
              riutilizzarlo.
            </li>
          </ol>
          <p>
            Non inviarlo in chat e non inserirlo nelle note delle esperienze.
            Puoi revocarlo dalle impostazioni GitHub in qualsiasi momento.
          </p>
          <a href={repositoryURL} target="_blank" rel="noopener noreferrer">
            Apri il repository <ArrowUpRight size={13} />
          </a>
        </details>
      </section>
    </main>
  );
}
