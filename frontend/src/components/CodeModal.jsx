import './css/Modal.css';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';

const Modal = ({ isOpen, onClose, code, language }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Code</h2>
                <div className="modal-editor-container">
                    <Editor
                        value={code}
                        highlight={code => highlight(code, languages.js)}
                        padding={10}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 12,
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            minHeight: '460px',
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Modal;
