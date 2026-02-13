from sqlalchemy.orm import Session
from models.user import User, RefreshToken
from core.security import hash_password, verify_password
from datetime import datetime, timedelta
from core.config import REFRESH_TOKEN_EXPIRE_DAYS
from settings import EXTENDED_REFRESH_TOKEN_EXPIRATION


def create_user(db: Session, email: str, username: str, password: str):
    # check if exist

    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email: return "Email already registered", False


    existing_username = db.query(User).filter(User.username == username).first()
    if existing_username: return "Username not available", False

    user = User(
        email = email,
        username = username,
        hashed_password = hash_password(password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user, True


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()

    if not user: return None

    if not verify_password(password, user.hashed_password): return None

    return user


def create_refresh_token_for_user(db: Session, user_id: int, token: str, old_token_expires_at: any):

    expires = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    refresh = RefreshToken(
        token = token,
        user_id = user_id,
        expires_at = expires if EXTENDED_REFRESH_TOKEN_EXPIRATION else old_token_expires_at if old_token_expires_at else expires
    )

    db.add(refresh)
    db.commit()
    db.refresh(refresh)

    return refresh


def get_user_by_refresh_token(db: Session, token: str):

    refresh_token = db.query(RefreshToken).filter(RefreshToken.token == token).first()

    if not refresh_token: return None

    # expired?

    if refresh_token.expires_at < datetime.utcnow():
        db.delete(refresh_token)
        db.commit()

        return None

    user = db.query(User).filter(User.id == refresh_token.user_id).first()
    return user


def delete_refresh_token(db: Session, token: str):

    refresh_token = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    token_expiration = refresh_token.expires_at if not EXTENDED_REFRESH_TOKEN_EXPIRATION else None

    if refresh_token:
        db.delete(refresh_token)
        db.commit()

        return token_expiration
        
