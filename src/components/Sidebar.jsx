import React from 'react';

const menu = [
  { key: 'today', label: '今日のミッション', icon: '🎯' },
  { key: 'moji', label: '文字・語彙', icon: '🔤' },
  { key: 'reading', label: '読解', icon: '📖' },
  { key: 'listening', label: '聴解', icon: '🎧' },
  { key: 'conversation', label: '会話トピック', icon: '💬' },
  { key: 'calendar', label: 'カレンダー・進みぐあい', icon: '📅' },
];

const Sidebar = ({ current, onChange }) => (
  <aside className="sidebar">
    <h1 className="logo">N2 勉強ルーム</h1>
    <nav>
      {menu.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`nav-item ${current === item.key ? 'active' : ''}`}
          onClick={() => onChange(item.key)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
