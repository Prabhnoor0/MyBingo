# SageWillow

SageWillow is a comprehensive web application designed to promote wellness, mindfulness, and gratitude. Built with a modern tech stack, it provides users with tools for mood tracking, gratitude journaling, meditations, and AI-powered interactions.

##  Features

- **Mood Tracking & Selector:** Track your daily emotions and see how you progress over time.
- **Gratitude Journaling:** Add daily gratitude entries to foster a positive mindset.
- **Breathing Meditations:** Guided breathing exercises to help you relax and focus.
- **AI-Powered Chat:** Interact with an intelligent assistant powered by Google's Gemini API.
- **Secure Authentication:** Robust user authentication built with Firebase and JWT.
- **Media Uploads:** Seamless image uploads for your memories and gratitude entries, powered by Cloudinary.

##  Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Radix UI Primitives
- **Icons:** Lucide React
- **Routing:** React Router DOM
- **Authentication:** Firebase

### Backend
- **Framework:** Express.js (Node.js)
- **Database:** MongoDB (Mongoose)
- **AI Integration:** Google GenAI SDK (`@google/genai`)
- **Media Storage:** Cloudinary + Multer
- **Security:** Helmet, CORS, bcryptjs, jsonwebtoken

##  Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Firebase Project setup
- Cloudinary Account
- Google Gemini API Key

##  Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Prabhnoor0/MyBingo.git
   cd MyBingo
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with your required credentials (MongoDB URI, JWT Secret, Cloudinary keys, Gemini API key, etc.).
   
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory based on `.env.example` with your Firebase config.

   Start the frontend development server:
   ```bash
   npm run dev
   ```

##  Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## 📝 License

Distributed under the ISC License. See `LICENSE` for more information.
