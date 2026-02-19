from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database import Base

class NewsCategories(Base):
    __tablename__ = 'news_category'

    id = Column(Integer, index=True, primary_key=True)
    name = Column(String, nullable=False, unique=True, index=True)
    

class News(Base):
    __tablename__ = 'news'

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey('news_category.id'), nullable=False)
    saved_at = Column(DateTime, nullable=False)

class NewSummary(Base):
    __tablename__ = 'news_summary'

    id = Column(Integer, index=True, primary_key=True)
    summary = Column(String, nullable=False)
    new_id = Column(Integer, ForeignKey('news.id'), nullable=False)

