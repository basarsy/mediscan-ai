# MediScan AI - Cancer Cell Detection System

AI-powered cancer cell detection system for medical image analysis. Upload medical images for instant, accurate cancer detection using advanced machine learning.

## Project Overview

MediScan AI is a web application designed to assist medical professionals in detecting cancer cells in medical images using advanced AI technology. The system provides fast, accurate analysis of medical images to aid in early diagnosis and treatment planning.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Python 3.8 or higher
- npm or yarn package manager
- `skin_cancer_model.h5` file in the project root (for AI predictions)

### Quick Start

**Option 1: Use the startup script (Recommended)**
```sh
chmod +x start.sh
./start.sh
```

This will automatically start both the backend and frontend servers.

**Option 2: Manual setup**

1. Clone the repository:
```sh
git clone https://github.com/basarsy/medAI.git
cd mediview-ai-detect
```

2. Install frontend dependencies:
```sh
npm install
```

3. Setup backend (first time only):
```sh
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

4. Start the servers:

**Terminal 1 - Backend:**
```sh
cd backend
source venv/bin/activate
python server.py
```

**Terminal 2 - Frontend:**
```sh
npm run dev
```

The application will be available at:
- **Frontend:** `http://localhost:8080`
- **Backend API:** `http://localhost:5000`

## Available Scripts

### Frontend
- `npm run dev` - Start the frontend development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

### Backend
- `./start_backend.sh` - Start only the backend server
- `python backend/server.py` - Run backend server directly (requires venv activation)

### Full Stack
- `./start.sh` - Start both backend and frontend servers (recommended)

## Technologies Used

### Frontend
- **Vite** - Next generation frontend tooling
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - High-quality component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching

### Backend
- **Flask** - Python web framework
- **TensorFlow/Keras** - Deep learning framework for model inference
- **NumPy** - Numerical computing
- **Pillow** - Image processing
- **Flask-CORS** - Cross-origin resource sharing

## Features

- **AI-Powered Detection** - Uses HAM10000-trained deep learning model for skin cancer detection
- **Real-time Analysis** - Upload images and get instant predictions with confidence scores
- **7-Class Classification** - Detects multiple skin lesion types (melanoma, basal cell carcinoma, benign lesions, etc.)
- **Detailed Results** - Shows detection status, confidence scores, and lesion type classification
- **Modern UI** - Clean, responsive interface optimized for medical professionals
- **Secure Processing** - Images processed locally through backend API

## Architecture

The application consists of two main components:

1. **Frontend (React)** - User interface for uploading images and viewing results
2. **Backend (Flask + TensorFlow)** - API server that loads the ML model and processes images

The backend receives uploaded images, preprocesses them (resize to 224x224, normalize), runs them through the trained model, and returns predictions with confidence scores.

## API Endpoints

### Health Check
```
GET http://localhost:5000/health
```

### Predict
```
POST http://localhost:5000/predict
Content-Type: multipart/form-data

Form data:
- image: [image file]
```

**Response:**
```json
{
  "detected": true,
  "confidence": 89.5,
  "class_index": 4,
  "class_name": "Melanoma",
  "all_predictions": {
    "Actinic keratoses": 1.2,
    "Basal cell carcinoma": 5.3,
    "Benign keratosis": 1.0,
    "Dermatofibroma": 0.8,
    "Melanoma": 89.5,
    "Melanocytic nevi": 1.5,
    "Vascular lesions": 0.7
  }
}
```

## Building for Production

To create a production build:

```sh
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to any static hosting service.

**Note:** For production deployment, you'll also need to deploy the backend server separately or use a serverless function for the ML model inference.

## License

This project is proprietary software. All rights reserved.
