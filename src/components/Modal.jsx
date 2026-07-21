export default function Modal({ show, title, children, onClose, footer }) {
  if (!show) return null;

  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
