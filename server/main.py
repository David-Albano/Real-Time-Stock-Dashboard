from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, market_dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router, prefix='/auth', tags=['auth'])
app.include_router(market_dashboard.router, prefix='/market', tags=['market'])

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:4200', 'http://localhost:8000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/')
def root():
    return {'msg': "Auth server running"}
