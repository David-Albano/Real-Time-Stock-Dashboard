from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from database import get_db
from datetime import datetime
from models.news import News, NewsCategories, NewSummary
from services.news.ws_manager_news import news_manager
from services.news.openai_model import get_news_summary
import uuid, time


router = APIRouter()


@router.websocket("/ws/{client_id}")
async def news_ws(websocket: WebSocket, client_id: str):
    await news_manager.connect(client_id, websocket)

    try:
        while True:
            await websocket.receive_text() # keep alive

    except WebSocketDisconnect:
        news_manager.disconnect(client_id)


def my_sleep(seconds):
    time.sleep(seconds)
    return

@router.post("/fetch/{category}/{client_id}")
async def fetch_news(category: str, client_id: str, db: Session = Depends(get_db)):
    print('\n\n ===== passed category: ', category)

    # =========  1 Checking Category
    await news_manager.send_step(client_id, "Checking Category")
    my_sleep(1) # «« ------ sleep block

    related_category = db.query(NewsCategories).filter_by(name = category).first()

    if not related_category:
        await news_manager.send_step(client_id, "Creating Category")

        related_category = NewsCategories(name=category.lower())
        db.add(related_category)
        db.commit()
        db.refresh(related_category)

    else:
        await news_manager.send_step(client_id, "Category Retrieved")

    my_sleep(1) # «« ------ sleep block

    # =========  2 Fetch news
    await news_manager.send_step(client_id, "Fetching Recent News")
    my_sleep(1) # «« ------ sleep block

    news_content = f"Breaking {category} market moves happening now...".strip()
    # news_content = get_real_news(category) # ======> TODO

    # =========  3 Store news
    await news_manager.send_step(client_id, "Storing News")
    my_sleep(1) # «« ------ sleep block

    news_to_create = News(
        content = news_content,
        category_id = related_category.id,
        saved_at = datetime.now()
    )

    db.add(news_to_create)
    db.commit()
    db.refresh(news_to_create)

    # =========  4 Send to AI
    await news_manager.send_step(client_id, "Sending content to model")
    my_sleep(1) # «« ------ sleep block

    summary_content = get_news_summary(news_content)

    await news_manager.send_step(client_id, "Got Summary From Model")
    my_sleep(1) # «« ------ sleep block

    # =========  5 Save summary
    await news_manager.send_step(client_id, "Saving Summarized Content")
    my_sleep(1) # «« ------ sleep block

    new_summary = NewSummary(
        summary = summary_content,
        new_id = news_to_create.id
    )

    db.add(new_summary)
    db.commit()
    db.refresh(new_summary)

    await news_manager.send_step(client_id, "Process Done")
    my_sleep(1) # «« ------ sleep block

    return { 'summary': summary_content }
