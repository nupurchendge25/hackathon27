# Compliance KYC & AML Frontend

A modern, feature-rich compliance management system built with React, Vite, and Tailwind CSS. This frontend application provides comprehensive KYC (Know Your Customer) verification, AML (Anti-Money Laundering) monitoring, and compliance management capabilities.

## 🚀 Features

### User Features
- **KYC Upload & Management**: Submit and track KYC documents
- **Document Recognition**: AI-powered document verification
- **Face Matching**: Biometric identity verification
- **OCR Processing**: Automated text extraction from documents
- **Text Field Extraction**: Intelligent form data extraction
- **Risk Scoring**: Real-time compliance risk assessment

### Admin Features
- **Admin Dashboard**: Comprehensive oversight and analytics
- **KYC Review System**: Review and approve/reject KYC submissions
- **AML Alerts**: Monitor suspicious activities and transactions
- **Rules Management**: Configure compliance rules and thresholds
- **Reports Generation**: Detailed compliance and audit reports
- **Audit Logs**: Complete activity tracking and monitoring
- **Transaction Clustering**: Pattern recognition in financial transactions
- **Network Fraud Detection**: Graph-based fraud analysis

## 🛠️ Tech Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.10.1
- **Styling**: Tailwind CSS 3.4.18
- **Animations**: Framer Motion 12.23.25
- **Charts**: Recharts 3.5.1
- **Icons**: Lucide React 0.556.0
- **Linting**: ESLint 9.39.1

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Auth/       # Authentication pages
│   │   │   └── Login.jsx
│   │   ├── user/       # User dashboard pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── KycUpload.jsx
│   │   │   └── KycDetail.jsx
│   │   ├── admin/      # Admin dashboard pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── KycList.jsx
│   │   │   ├── KycReview.jsx
│   │   │   ├── AMLAlerts.jsx
│   │   │   ├── Rules.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── AuditLogs.jsx
│   │   ├── Features/   # AI/ML Feature pages
│   │   │   ├── DocumentRecognition.jsx
│   │   │   ├── OCR.jsx
│   │   │   ├── TextFieldExtraction.jsx
│   │   │   ├── FaceMatch.jsx
│   │   │   ├── AMLAnomaly.jsx
│   │   │   ├── TxnClustering.jsx
│   │   │   ├── NetworkFraud.jsx
│   │   │   └── RiskScoring.jsx
│   │   ├── Home.jsx
│   │   └── About.jsx
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   ├── App.css
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.cjs
├── eslint.config.js
├── package.json
└── README.md
```

## 🔌 API Integration

The application is configured to proxy API requests to the backend server:

- **Backend URL**: `http://localhost:5000`
- **API Prefix**: `/api`

All API calls should be made to endpoints starting with `/api`, which will be automatically proxied to the backend.

## 🎨 Styling

This project uses **Tailwind CSS** for styling with a custom configuration. The design system includes:

- Custom color palette
- Responsive breakpoints
- Custom animations
- Dark mode support (if configured)

## 🔐 Authentication

The application includes a login system for both users and administrators. Protected routes require authentication to access.

## 🚦 Routing Structure

- `/` - Home page
- `/about` - About page
- `/login` - Login page
- `/user/dashboard` - User dashboard
- `/user/kyc-upload` - KYC document upload
- `/user/kyc-detail/:id` - KYC submission details
- `/admin/dashboard` - Admin dashboard
- `/admin/kyc-list` - All KYC submissions
- `/admin/kyc-review/:id` - Review specific KYC
- `/admin/aml-alerts` - AML monitoring
- `/admin/rules` - Rules configuration
- `/admin/reports` - Compliance reports
- `/admin/audit-logs` - System audit logs
- `/features/*` - Various AI/ML feature pages

## 🔧 Configuration

### Vite Configuration
The Vite configuration includes:
- React plugin for JSX support
- Development server proxy to backend API
- Hot Module Replacement (HMR)

### Tailwind Configuration
Customized Tailwind setup with:
- Custom theme extensions
- PurgeCSS for production optimization
- PostCSS processing

## 🐛 Development

### Running Linter
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## 📦 Dependencies

### Core Dependencies
- React & React DOM - UI framework
- React Router DOM - Routing
- Framer Motion - Animations
- Recharts - Data visualization
- Lucide React - Icons

### Development Dependencies
- Vite - Build tool
- Tailwind CSS - Styling
- ESLint - Code linting
- Autoprefixer - CSS vendor prefixing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and confidential.

## 👥 Team

TechFiesta - Compliance Management System

## 📧 Support

For support, please contact the development team.

---

**Built with ❤️ using React + Vite + Tailwind CSS**
