export interface Activity {
  id: string;
  settimana: number;
  settimana_inizio: string;
  settimana_fine: string;
  attivita: string;
  categoria: string;
  comune: string;
  centro: string;
  sede: string;
  prezzo_persona_eur: number | null;
  prova_codice: "P" | "S" | "V" | "A" | "I";
  fonte_url: string;
  cosa_verificare: string;
  stato_prenotazione: string;
  data_ora_confermata: string;
  esito: "Da fare" | "Fatto" | "Saltato";
  note_diario: string;
  foto_url: string;
  voto_ale: number | null;
  voto_paco: number | null;
  voto_francesca: number | null;
  voto_clelia: number | null;
}
export interface Snapshot {
  activities: Activity[];
  meta: {
    source: "local" | "google-sheets";
    last_successful_sync: string;
    last_attempt: string;
    stale: boolean;
    sync_error: string | null;
  };
}
export interface FilterState {
  search: string;
  month: string;
  category: string;
  town: string;
  booking: string;
  outcome: string;
}
