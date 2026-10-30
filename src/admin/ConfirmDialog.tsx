import { useEffect, useRef } from "react";
export function ConfirmDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      className="admin-confirm"
      ref={ref}
      aria-labelledby="discard-title"
      onCancel={onCancel}
    >
      <h2 id="discard-title">Hai modifiche non salvate.</h2>
      <p>
        Se prosegui, le modifiche a questa esperienza verranno scartate. I dati
        già salvati rimangono intatti.
      </p>
      <div>
        <button className="primary-button" onClick={onCancel} autoFocus>
          Continua a modificare
        </button>
        <button className="outline-button" onClick={onConfirm}>
          Scarta e prosegui
        </button>
      </div>
    </dialog>
  );
}
