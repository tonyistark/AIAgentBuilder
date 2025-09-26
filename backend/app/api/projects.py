from fastapi import APIRouter, Depends
from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter()


@router.get("/")
async def list_projects(
    current_user: User = Depends(get_current_user)
):
    """List all projects"""
    # TODO: Implement project management
    return {"projects": []}
