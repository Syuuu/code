import React from 'react';

const menuItems = [
  { key: 'today', label: 'ホーム / 今日のミッション', icon: '🏠' },
  { key: 'vocab', label: '単語', icon: '🔤' },
  { key: 'grammar', label: '文法', icon: '📘' },
  { key: 'reading', label: '読解', icon: '📖' },
  { key: 'listening', label: '聴解', icon: '🎧' },
  { key: 'conversation', label: '会話トピック', icon: '💬' },
  { key: 'calendar', label: 'カレンダー・進みぐあい', icon: '📅' },
];

const Sidebar = ({ current, onChange }) => (
  <nav className="sidebar card">
    <div className="sidebar-title">メニュー</div>
    <ul>
      {menuItems.map((item) => (
        <li key={item.key}>
          <button
            type="button"
            className={`sidebar-btn ${current === item.key ? 'active' : ''}`}
            onClick={() => onChange(item.key)}
          >
            <span className="menu-icon" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export default Sidebar;
