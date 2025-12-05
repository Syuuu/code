import React from 'react';

const menuItems = [
  { key: 'today', label: '今日のミッション' },
  { key: 'questions', label: '問題（単語・文法・読解）' },
  { key: 'listening', label: '聴解' },
  { key: 'conversation', label: '会話トピック' },
  { key: 'calendar', label: 'カレンダー・進みぐあい' },
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
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export default Sidebar;
