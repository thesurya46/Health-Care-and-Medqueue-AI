# Health Care and Medqueue AI

A comprehensive AI-powered platform combining **MedQueue AI** for intelligent hospital queue and bed management with **EduMatch AI** for personalized career counseling and student guidance.

## 🚀 Features

### MedQueue AI (Patient & Hospital Management)
- Real-time hospital wait time predictions using ML
- City-wide live bed availability and allocation
- Virtual queue booking and ambulance routing
- AI symptom checker
- Admin dashboard for staffing and analytics

### EduMatch AI (Career Counseling)
- AI-driven aptitude and personality assessments
- Personalized career roadmaps and college matching
- Success probability predictions
- 24/7 AI mentor chatbot
- Scholarship recommendations

## 🛠 Tech Stack

| Component | Technologies |
|-----------|--------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **Backend** | Node.js, Express, Python (FastAPI for ML) |
| **Database** | Firebase Firestore & Realtime Database |
| **ML/AI** | TensorFlow, scikit-learn, XGBoost, Prophet |
| **LLM** | GPT-4 / Claude via LangChain |
| **Testing** | Testsprite automated tests |
| **Deployment** | Render, Firebase Hosting |

## 📋 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.10+
- Firebase project (see `firebase.json`)

### 1. Frontend
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### 2. Backend
```bash
cd backend
npm install
node server.js
```

### 3. ML Service
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```

## 🌐 Deployment
- **Frontend**: `npm run build` → Firebase Hosting or Render
- **Backend**: Render (see `render.yaml`)
- **Firebase**: Run `firebase deploy`

## 📁 Project Structure
```
.
├── src/              # React frontend
├── backend/          # Node.js API
├── ml-service/       # Python ML models
├── testsprite_tests/ # Automated UI tests
├── public/           # Static assets
└── configs/          # Tailwind, Vite, TS
```

## 🤝 Contributing
1. Fork the repo
2. Create feature branch `git checkout -b feature/AmazingFeature`
3. Commit changes `git commit -m 'Add AmazingFeature'`
4. Push `git push origin feature/AmazingFeature`
5. Open PR

## 📄 License
MIT License - see [LICENSE](LICENSE) (create if needed)

## 👥 Contact
- GitHub: [thesurya46](https://github.com/thesurya46)
- Project Link: [Health-Care-and-Medqueue-AI](https://github.com/thesurya46/Health-Care-and-Medqueue-AI)

---

⭐ Star this repo if you find it useful!

