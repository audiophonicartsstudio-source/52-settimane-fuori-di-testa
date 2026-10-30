import { ArrowUpRight, LockKeyhole } from "lucide-react";
import type { Snapshot } from "../types";
export function Footer({ meta }: { meta: Snapshot["meta"] }) {
  return (
    <footer>
      <div>
        <a className="brand" href="#inizio">
          <span className="brand-mark">52</span>settimane fuori di testa
          <ArrowUpRight size={18} />
        </a>
        <p>Un anno. Quattro amici. Un sacco di prime volte.</p>
      </div>
      <a
        className="admin-link"
        href={import.meta.env.BASE_URL + "gestione.html"}
      >
        <LockKeyhole size={15} /> Gestione
      </a>
      <div className="footer-meta">
        <span>
          Dati {meta.source === "local" ? "del calendario" : "da Google Sheets"}{" "}
          · aggiornati il{" "}
          {new Intl.DateTimeFormat("it-IT", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Europe/Rome",
          }).format(new Date(meta.last_successful_sync))}
        </span>
        <span>
          {meta.source === "local"
            ? "Gli aggiornamenti vengono gestiti dal pannello riservato."
            : "Gli aggiornamenti vengono gestiti nel calendario condiviso."}
        </span>
        <span>Le fonti descrivono proposte da riconfermare per il 2027.</span>
      </div>
    </footer>
  );
}
