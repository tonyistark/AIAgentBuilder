from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.db.database import get_db
from app.models.models import Flow, User
from app.api.auth import get_current_user
from app.flows.executor import FlowExecutor
from app.schemas.flow import FlowCreate, FlowUpdate, FlowResponse, FlowExecuteRequest

router = APIRouter()


@router.get("/", response_model=List[FlowResponse])
async def list_flows(
    project_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all flows for the current user"""
    query = select(Flow).where(Flow.user_id == current_user.id)
    
    if project_id:
        query = query.where(Flow.project_id == uuid.UUID(project_id))
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    flows = result.scalars().all()
    
    return flows


@router.post("/", response_model=FlowResponse)
async def create_flow(
    flow: FlowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new flow"""
    db_flow = Flow(
        name=flow.name,
        description=flow.description,
        data=flow.data,
        user_id=current_user.id,
        project_id=flow.project_id
    )
    
    db.add(db_flow)
    await db.commit()
    await db.refresh(db_flow)
    
    return db_flow


@router.get("/{flow_id}", response_model=FlowResponse)
async def get_flow(
    flow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific flow"""
    query = select(Flow).where(
        Flow.id == uuid.UUID(flow_id),
        Flow.user_id == current_user.id
    )
    result = await db.execute(query)
    flow = result.scalar_one_or_none()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow not found"
        )
    
    return flow


@router.put("/{flow_id}", response_model=FlowResponse)
async def update_flow(
    flow_id: str,
    flow_update: FlowUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a flow"""
    query = select(Flow).where(
        Flow.id == uuid.UUID(flow_id),
        Flow.user_id == current_user.id
    )
    result = await db.execute(query)
    flow = result.scalar_one_or_none()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow not found"
        )
    
    # Update fields
    if flow_update.name is not None:
        flow.name = flow_update.name
    if flow_update.description is not None:
        flow.description = flow_update.description
    if flow_update.data is not None:
        flow.data = flow_update.data
    
    flow.version += 1
    
    await db.commit()
    await db.refresh(flow)
    
    return flow


@router.delete("/{flow_id}")
async def delete_flow(
    flow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a flow"""
    query = select(Flow).where(
        Flow.id == uuid.UUID(flow_id),
        Flow.user_id == current_user.id
    )
    result = await db.execute(query)
    flow = result.scalar_one_or_none()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow not found"
        )
    
    await db.delete(flow)
    await db.commit()
    
    return {"message": "Flow deleted successfully"}


@router.post("/{flow_id}/run")
async def run_flow(
    flow_id: str,
    request: FlowExecuteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Execute a flow"""
    # Get flow
    query = select(Flow).where(
        Flow.id == uuid.UUID(flow_id),
        Flow.user_id == current_user.id
    )
    result = await db.execute(query)
    flow = result.scalar_one_or_none()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow not found"
        )
    
    # Create executor
    context = {
        "user_id": str(current_user.id),
        "flow_id": flow_id,
        **request.context
    }
    
    executor = FlowExecutor(flow.data, context)
    
    try:
        # Execute flow
        results = await executor.execute()
        
        return {
            "execution_id": executor.execution_id,
            "status": executor.status,
            "results": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Flow execution failed: {str(e)}"
        )
