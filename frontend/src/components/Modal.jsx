import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-luxury-gold/10 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-luxury-black transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="p-10">
                    <h2 className="text-3xl font-luxury font-black mb-8 gold-text">{title}</h2>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
