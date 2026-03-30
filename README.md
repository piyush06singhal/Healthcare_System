# MediFlow AI - Modern Healthcare Platform

MediFlow AI is a cutting-edge, professional healthcare application designed to bridge the gap between advanced computational intelligence and clinical practice. It provides a seamless, secure, and interactive experience for patients, doctors, and administrators.

## 🚀 Features

### For Patients
- **AI Symptom Predictor:** Get instant insights into your health symptoms using our advanced AI engine.
- **Online Appointments:** Book and manage consultations with top specialists.
- **Digital Medical Records:** Securely store and access your medical history, reports, and prescriptions.
- **Health Calculators:** Track your BMI, BMR, and daily calorie needs with interactive tools.
- **Interactive Dashboard:** Monitor your health metrics with real-time data visualization.

### For Doctors
- **Patient Management:** Efficiently manage your patient directory and clinical history.
- **Appointment Queue:** Real-time tracking of inbound patient queues.
- **Clinical Analytics:** Visualize clinical throughput and patient outcomes.

### General Features
- **Dark Mode Support:** A beautiful, consistent dark theme across the entire platform.
- **Premium UI/UX:** Modern, vibrant design with smooth animations and interactive elements.
- **Global Reach:** Multi-language support (EN/HI) and global service availability.
- **Secure Infrastructure:** Enterprise-grade encryption and role-based access control.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, Framer Motion (Animations)
- **Icons:** Lucide React
- **Charts:** Recharts
- **State Management:** Redux Toolkit
- **Backend (Simulated):** Supabase (Auth & Database)
- **AI Integration:** Google Gemini AI

## 📦 Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `VITE_SUPABASE_URL`: Your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `src/components/`: Reusable UI components (Navbar, Footer, ThemeToggle, etc.)
- `src/pages/`: Main application pages (Landing, Dashboards, Services, etc.)
- `src/store/`: Redux state management logic.
- `src/services/`: API and third-party service integrations.
- `src/types.ts`: Global TypeScript definitions.
- `src/index.css`: Global styles and Tailwind configuration.

## 🛡️ Security

MediFlow AI prioritizes data privacy and security. We implement:
- End-to-end encryption for sensitive medical data.
- Strict Role-Based Access Control (RBAC).
- Secure authentication via Supabase.

## 📄 License

This project is licensed under the MIT License.
