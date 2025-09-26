from typing import List
from fastapi import APIRouter
# from app.components.registry import ComponentRegistry

router = APIRouter()


@router.get("/")
async def list_components():
    """List all available components"""
    # return {"components": ComponentRegistry.list_all()}
    return {"components": []}


@router.get("/by-category")
async def list_components_by_category():
    """List components grouped by category"""
    # return ComponentRegistry.get_by_category()
    return {}
