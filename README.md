# IIITNR Faculty Attendance Portal

Faculty attendance management system with QR code generation, geofencing, and comprehensive analytics.

## Features
- QR Code Generation for Attendance
- Geofencing Validation
- Manual Attendance Marking
- Real-time Analytics Dashboard
- Firebase Integration

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun
- Firebase account

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_API_BASE_URL=https://your-backend-url.com
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Documentation

- **[Flutter Student App Integration](docs/FLUTTER_INTEGRATION.md)** - Complete guide for integrating the student mobile app with the backend, including API specifications, authentication flow, QR code format, geofencing implementation, and data models.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS
- **Authentication**: Firebase Auth
- **State Management**: React Query
- **Routing**: React Router
- **QR Code**: qrcode.react

## Project Structure

```
src/
├── components/        # Reusable UI components
├── context/          # React context providers
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── services/         # API and Firebase services
└── lib/              # Utility functions
```

## Authentication

Faculty members must sign in with their institutional email (`@iiitnr.edu.in`) using Google authentication.

## License

This project is for educational purposes at IIIT Naya Raya.
