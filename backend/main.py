from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from chatbot.server import router as chatbot_router
import uvicorn

app = FastAPI(title="Sheherly Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "Sheherly backend is running 🚀"}

app.include_router(chatbot_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)