from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MedQueue & EduMatch ML Core", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueueData(BaseModel):
    current_length: int
    avg_consult_time: float
    doctors_available: int
    hour_of_day: int

class CareerProfile(BaseModel):
    aptitude_scores: dict
    interests: List[str]
    skills: List[str]

@app.get("/")
async def root():
    return {"status": "ML service is online", "models": ["wait_time_lstm", "career_matcher_xgb"]}

@app.post("/predict/wait-time")
async def predict_wait_time(data: QueueData):
    # Simulated LSTM Logic
    # In production: model.predict([[current_length, avg_consult_time, ...]])
    base_wait = (data.current_length * data.avg_consult_time) / max(data.doctors_available, 1)
    noise = random.uniform(-2, 5)
    
    # Peak hour multiplier
    if 17 <= data.hour_of_day <= 20:
        base_wait *= 1.3
        
    return {
        "estimated_wait_minutes": round(base_wait + noise, 1),
        "confidence": 0.92,
        "surge_detected": base_wait > 30
    }

@app.post("/predict/career-match")
async def predict_career_match(profile: CareerProfile):
    # Simulated Career Matching Logic
    # In production: vector_db.search(profile_embedding)
    careers = [
        {"title": "Software Architect", "score": random.uniform(85, 98)},
        {"title": "Data Scientist", "score": random.uniform(80, 95)},
        {"title": "AI Researcher", "score": random.uniform(75, 92)}
    ]
    return {
        "matches": sorted(careers, key=lambda x: x["score"], reverse=True),
        "success_probability": round(random.uniform(0.7, 0.95), 2)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
