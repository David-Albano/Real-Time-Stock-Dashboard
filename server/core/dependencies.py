from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from core.security import decode_token
from models.user import User
from settings import DEBUG

security = HTTPBearer()

def get_current_user(
        request: Request,
        db: Session = Depends(get_db)
    ):
    
    token = request.cookies.get('access_token')

    if not token:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail = 'Not authenticated')
    
    email = decode_token(token)

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail = 'User not found')
    
    return user


SAMESITE = 'lax' if DEBUG else 'none'
SECURE = True if SAMESITE == 'none' else False


def set_session_cookies(access_token: str, refresh_token: str, response: Response):

    response.set_cookie(
        key = 'access_token',
        value = access_token,
        httponly = True, 
        samesite = SAMESITE,
        secure = SECURE
    )

    response.set_cookie(
        key = 'refresh_token',
        value = refresh_token, 
        httponly = True,
        samesite = SAMESITE,
        secure = SECURE
    )



