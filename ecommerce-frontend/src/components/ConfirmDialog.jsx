import { useEffect, useId, useRef } from 'react';
import '../styles/confirmDialogStyle.css';

// Accessible confirmation modal built on the native <dialog> element
// (focus trap, Escape to close and backdrop handled by the browser).
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}) => {
  const ref = useRef(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="cdlg"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
      onClose={onCancel}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div className="cdlg__body">
        <h2 id={titleId} className="cdlg__title">{title}</h2>
        <p id={messageId} className="cdlg__message">{message}</p>
        <div className="cdlg__actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && <span className="spinner" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmDialog;
