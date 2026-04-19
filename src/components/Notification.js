import { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

export default function Notification({ show, message, type }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setExiting(false);
      setVisible(true);
    } else if (visible) {
      setExiting(true);
      const t = setTimeout(() => setVisible(false), 180);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border max-w-xs
        ${isSuccess
          ? 'bg-[#0e0e1a] border-emerald-500/30 shadow-emerald-500/10'
          : 'bg-[#0e0e1a] border-red-500/30 shadow-red-500/10'
        }
        ${exiting ? 'animate-toast-out' : 'animate-toast-in'}
      `}
    >
      {isSuccess
        ? <FaCheckCircle size={15} className="text-emerald-400 shrink-0" />
        : <FaTimesCircle size={15} className="text-red-400 shrink-0" />
      }
      <span className="text-sm font-semibold text-white">{message}</span>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl overflow-hidden">
        <div
          className={`h-full ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}
          style={{ animation: 'shrink 3s linear forwards' }}
        />
      </div>
      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
}
