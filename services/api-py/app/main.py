from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base

# Import all models so they're registered with SQLAlchemy
from app.models import *  # noqa

# Import routers
from app.api.v1 import auth, users, shops, products, orders, services as services_router
from app.api.v1 import delivery, payments, reviews, notifications, admin, conversations, zatca


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.is_dev:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title='MUFASAL API',
    version='1.0.0',
    description='Marketplace platform for Saudi tailoring and fabric industry',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
async def health():
    return {'success': True, 'message': 'MUFASAL API is running'}


API_PREFIX = '/api/v1'
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(shops.router, prefix=API_PREFIX)
app.include_router(services_router.router, prefix=API_PREFIX)
app.include_router(products.router, prefix=API_PREFIX)
app.include_router(orders.router, prefix=API_PREFIX)
app.include_router(delivery.router, prefix=API_PREFIX)
app.include_router(payments.router, prefix=API_PREFIX)
app.include_router(reviews.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(conversations.router, prefix=API_PREFIX)
app.include_router(zatca.router, prefix=API_PREFIX)
