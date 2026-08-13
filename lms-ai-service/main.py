from fastapi import FastAPI
from Router import ingest, query,summarize

app = FastAPI()
app.include_router(ingest.router)
app.include_router(query.router)
app.include_router(summarize.router)