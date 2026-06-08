import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';

interface Props {
  name: string;
}

export default function UserName({ name }: Props) {
  const [showPop, setShowPop] = useState(false);
  const [copied, setCopied] = useState(false);
  const { getPhone } = useUsers();
  const phone = getPhone(name);

  const copy = () => {
    if (!phone) return;
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <span className="relative inline-block">
      <span
        onClick={(e) => { e.stopPropagation(); if (phone) setShowPop(!showPop); }}
        style={{
          cursor: phone ? 'pointer' : 'default',
          color: '#2563eb',
          textDecoration: phone ? 'underline' : 'none',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '2px',
        }}
        className="hover:text-blue-800 transition-colors"
      >
        {name}
      </span>
      {showPop && phone && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[999]" onClick={(e) => e.stopPropagation()} style={{ zIndex: 9999 }}>
          <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl whitespace-nowrap flex items-center gap-2">
            <span>📞 {phone}</span>
            <button onClick={copy} className="text-blue-300 hover:text-blue-100 text-[11px] underline transition-colors">
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
}
