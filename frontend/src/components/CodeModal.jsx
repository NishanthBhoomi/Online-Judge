import './css/Modal.css';

const Modal = ({ isOpen, onClose, code, language }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Code</h2>
                <pre><code>{code}</code></pre>
            </div>
        </div>
    );
};

export default Modal;