import React, { useState } from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { FaHome, FaRegMoneyBillAlt, FaPiggyBank, FaChartLine, FaBullseye, FaFileExport, FaTimes, FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from './authcontext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: FaHome },
  { name: 'Transactions', path: '/transactions', icon: FaRegMoneyBillAlt },
  { name: 'Budget', path: '/budget', icon: FaPiggyBank },
  { name: 'Net Worth', path: '/net-worth', icon: FaChartLine },
  { name: 'Goals', path: '/goals', icon: FaBullseye },
  { name: 'Reports', path: '/reports', icon: FaFileExport },
];

const Sidebar = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { logout, user } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  const handleLinkClick = () => {
    if (isOpen) setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    if (isOpen) setIsOpen(false);
  };

  return (
    <aside className={classNames('sidebar', { 'sidebar--open': isOpen })}>
      <div className="sidebar__header">
        <h1 className="sidebar__logo">BudgetApp</h1>
        <button
          className="sidebar__toggle"
          onClick={toggleSidebar}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      <nav className="sidebar__nav" role="navigation">
        <ul className="sidebar__list">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="sidebar__item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    classNames('sidebar__link', {
                      'sidebar__link--active': isActive,
                    })
                  }
                  onClick={handleLinkClick}
                >
                  <Icon className="sidebar__icon" />
                  <span className="sidebar__label">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sidebar__footer">
        <NavLink to="/profile" className="sidebar__link" onClick={handleLinkClick}>
          <FaUserCircle className="sidebar__icon" />
          <span className="sidebar__label">{user?.displayName || 'Profile'}</span>
        </NavLink>
        <button
          type="button"
          className="sidebar__link sidebar__logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="sidebar__icon" />
          <span className="sidebar__label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;