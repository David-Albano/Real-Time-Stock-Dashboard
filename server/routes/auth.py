from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from database import get_db
from schemas.user import UserCreate, UserLogin, UserResponse, RefreshRequest
from services.user_service import create_user, authenticate_user, create_refresh_token_for_user, get_user_by_refresh_token, delete_refresh_token
from core.security import create_access_token, create_refresh_token
from core.dependencies import get_current_user, set_session_cookies
from models.user import User, RefreshToken

router = APIRouter()

# register
@router.post('/register', response_model = UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user, created = create_user(db, user.email, user.username, user.password)

    if not created:
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail=new_user)
    
    return new_user


# login
@router.post('/login')
def login(user: UserLogin, request: Request, response: Response, db: Session = Depends(get_db)):

    if request.cookies.get('access_token', None) and request.cookies.get('refresh_token', None):
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = 'A session already exist.')

    db_user = authenticate_user(db, user.email, user.password)

    if not db_user:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials")
    

    # create tokens
    access_token = create_access_token({'sub': db_user.email})
    refresh_token = create_refresh_token()

    # Save refresh token in db

    create_refresh_token_for_user(db, db_user.id, refresh_token)

    
    # set cookies (httpOnly)
    try:
        set_session_cookies(access_token, refresh_token, response)
    
    except:
        delete_refresh_token(db, refresh_token)

    return {
        'msg': 'login success',
        'user': {
            'id': db_user.id,
            'email': db_user.email,
            'username': db_user.username,
        }
    }


# logout

@router.post('/logout')
def logout(request: Request, response: Response, db: Session = Depends(get_db)):

    if not request.cookies.get('access_token', None) or not request.cookies.get('refresh_token', None):
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = "You're already logged out.")
    
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')

    refresh_token = request.cookies.get('refresh_token')

    token = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()

    if token:
        db.delete(token)
        db.commit()

    return {'message': 'Logged out'}



@router.get('/me')
def get_me(current_user: User = Depends(get_current_user)):
    return {
        'id': current_user.id,
        'email': current_user.email,
        'username': current_user.username,
    }


@router.post('/refresh')
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):

    refresh_token = request.cookies.get('refresh_token')

    if not refresh_token:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail = 'No refresh token')


    user = get_user_by_refresh_token(db, refresh_token)

    if not user:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail = 'Invalid refresh token')
    
    # Rotate refresh token (security)
    delete_refresh_token(db, refresh_token)

    new_refresh_token = create_refresh_token()
    create_refresh_token_for_user(db, user.id, new_refresh_token)

    # New access token
    new_access_token = create_access_token({'sub': user.email})

    # set cookies (httpOnly)
    try:
        set_session_cookies(new_access_token, new_refresh_token, response)
    
    except:
        delete_refresh_token(db, new_refresh_token)

    return {'msg': 'token refreshed'}

