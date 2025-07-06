# vibesheet_budget

A responsive, mobile-first React TypeScript single-page application for budgeting, transaction tracking, net-worth monitoring, and goal management, featuring secure authentication, real-time charts, offline support, and exportable reports.

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Features](#features)  
3. [Architecture](#architecture)  
4. [Installation](#installation)  
5. [Usage](#usage)  
6. [Components](#components)  
7. [Dependencies](#dependencies)  
8. [Scripts](#scripts)  
9. [Contributing](#contributing)  
10. [License](#license)  

---

## Project Overview

vibesheet_budget is a React 18+ & TypeScript application that helps users plan and track budgets, record transactions, monitor net worth, set and track financial goals, and generate exportable reports. It supports:

- Secure authentication via JWT or Firebase Auth  
- Onboarding wizard for template selection/customization  
- Real-time interactive charts (via Chart.js)  
- CRUD transactions with instant dashboard updates  
- Goal management with milestone alerts  
- CSV & PDF report export  
- Dark/light theming, offline support, and accessibility compliance  

For detailed requirements and design, see the [Project Specification](https://docs.google.com/document/d/1dZHdTaFIR7df8iQp0qGm4NGwsTkvIgw7oibC8kPW3rQ/).

---

## Features

- Mobile-first, responsive UI (Material-UI v5 & styled-components)  
- Email/password (JWT) or Firebase authentication  
- Multi-step onboarding wizard  
- Interactive, drill-down charts (react-chartjs-2)  
- Transaction list: sorting, filtering, pagination  
- Goal creation, tracking & alerts  
- Monthly/annual CSV & PDF exports  
- User settings: profile, theme, notifications  
- Dark/light theme switcher  
- Offline cache & synchronization  
- Protected routes & role-based access  
- Error boundaries & loading states  
- Performance optimizations: code-splitting, lazy loading, memoization  
- Accessibility (WCAG 2.1 AA)  
- CI/CD pipeline (GitHub Actions) & automated tests (Jest, RTL, Cypress)  

---

## Architecture

- **Frontend**  
  - React 18+ with TypeScript, functional components & Hooks  
  - Global state: Context API & React Query  
  - Routing: React Router v6  
  - UI: Material-UI v5 & styled-components  
  - Charts: react-chartjs-2  
  - HTTP: axios?based apiClient with JWT / Firebase Auth  
  - Offline: Service Workers (Workbox)  
- **Backend** (optional)  
  - Node.js/Express REST API + PostgreSQL (TypeORM)  
  - or Firebase Functions & Firestore  
- **CI/CD & Hosting**  
  - GitHub Actions  
  - Frontend: Vercel / Netlify  
  - Backend: AWS / GCP / Azure / Firebase  

---

## Installation

### Prerequisites

- Node.js v16+ & npm or Yarn  
- (Optional) PostgreSQL database or Firebase project  
- Git

### Setup

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-org/vibesheet_budget.git
   cd vibesheet_budget
   ```

2. **Install dependencies**  
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables**  
   Create a `.env` in the project root:
   ```ini
   REACT_APP_API_BASE_URL=https://api.yourdomain.com
   REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
   # ...other keys
   ```

4. **Run in development**  
   ```bash
   npm start
   # or
   yarn start
   ```
   App will be available at `http://localhost:3000`.

5. **Build for production**  
   ```bash
   npm run build
   # or
   yarn build
   ```

---

## Usage

- **Authentication**: Sign up / log in with email & password or via OAuth.  
- **Onboarding**: Choose a budget template or customize your own.  
- **Dashboard**: View summary cards, pie charts, and trends.  
- **Transactions**: Add/edit/delete items; sort, filter & paginate.  
- **Goals**: Create goals, track milestones & receive alerts.  
- **Reports**: Generate CSV or PDF reports by date range & filters.  
- **Settings**: Update profile, toggle themes, configure notifications.  
- **Offline**: Work offline; changes sync when back online.  

---

## Components

Below is a list of core components and their purposes:

? **index.tsx**  
  Entry point: renders `<App />` within `React.StrictMode` and `BrowserRouter`.  

? **app.tsx**  
  Root component: wraps providers (Auth, Budget, Theme) and defines routes.  

? **apiClient.ts**  
  Axios instance with base URL, auth interceptors, and error handling.  

? **authContext.tsx**  
  Manages authentication state and methods (`login`, `logout`, `register`).  

? **budgetContext.tsx**  
  Handles budgets, categories, and transaction state.  

? **appShell.tsx**  
  Layout component with sidebar, topbar, and footer wrapper.  

? **dashboard.tsx**  
  Displays summary cards, pie charts, and trend visualizations.  

? **transactionForm.tsx**  
  Form for creating/editing transactions with validation (react-hook-form).  

? **pieChart.tsx**  
  Reusable pie chart component using react-chartjs-2.  

? **templateGallery.tsx**  
  Lists pre-built budget templates for selection/customization.  

? **sidebar.tsx**  
  Navigation links: Dashboard, Transactions, Goals, Reports, Settings.  

? **topbar.tsx**  
  Header with logo, theme switcher, notifications, and user menu.  

? **onboardingWizard.tsx**  
  Multi-step wizard for initial template setup.  

? **transactionList.tsx**  
  Table of transactions with sorting, filtering, and pagination.  

? **reportsPage.tsx**  
  Configure and generate CSV/PDF reports by date range & filters.  

? **settingsPage.tsx**  
  Manage profile, theming, and notification preferences.  

? **themeSwitcher.tsx**  
  Toggle between dark and light themes.  

? **protectedRoute.tsx**  
  Route wrapper that restricts access to authenticated users (and roles).  

? **themeContext.tsx**  
  Provides theme state and toggling via Context API.  

? **loadingSpinner.tsx**  
  Global loading indicator.  

? **errorBoundary.tsx**  
  Catches errors in the component tree and displays fallback UI.  

? **goalsPage.tsx** & **goalForm.tsx**  
  Manage financial goals and milestones.  

? **profilePage.tsx**  
  View & edit user profile.  

? **notificationSettings.tsx**  
  Configure notification preferences.  

---

## Dependencies

Key dependencies used in this project:

- react, react-dom  
- typescript  
- react-router-dom v6  
- @mui/material & @mui/icons-material  
- styled-components  
- axios  
- react-query  
- react-chartjs-2 & chart.js  
- react-hook-form & yup  
- workbox-webpack-plugin (offline support)  
- jwt-decode  
- firebase (optional)  
- date-fns  
- classnames  

Dev & CI:

- Jest, React Testing Library, Cypress  
- ESLint, Prettier  
- GitHub Actions  

---

## Scripts

```bash
npm start         # Start dev server
npm run build     # Create production build
npm test          # Run unit tests (Jest)
npm run cypress   # Run end-to-end tests
npm run lint      # Lint code
npm run format    # Prettier format
```

---

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/xyz`)  
3. Commit your changes (`git commit -m "feat: add xyz"`)  
4. Push to your fork (`git push origin feature/xyz`)  
5. Open a Pull Request  

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing Guide](CONTRIBUTING.md).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.