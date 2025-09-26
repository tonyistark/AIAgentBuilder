"""
API endpoints for managing variables
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.db.database import get_db
from app.models.models import Variable, User
from app.api.deps import get_current_user
from app.core.security import encrypt_value, decrypt_value

router = APIRouter()


class VariableCreate(BaseModel):
    name: str
    value: str
    type: str = "string"  # string, number, boolean, secret
    is_encrypted: bool = False
    description: Optional[str] = None
    scope: str = "global"  # global, project, user
    project_id: Optional[str] = None


class VariableUpdate(BaseModel):
    name: Optional[str] = None
    value: Optional[str] = None
    type: Optional[str] = None
    is_encrypted: Optional[bool] = None
    description: Optional[str] = None


class VariableResponse(BaseModel):
    id: str
    name: str
    type: str
    is_encrypted: bool
    description: Optional[str]
    scope: str
    project_id: Optional[str]
    value: Optional[str] = None  # Only included if not encrypted or explicitly requested

    class Config:
        orm_mode = True


@router.get("/", response_model=List[VariableResponse])
async def list_variables(
    scope: Optional[str] = Query(None, description="Filter by scope (global, project, user)"),
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    include_values: bool = Query(False, description="Include decrypted values"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all variables accessible to the current user"""
    query = db.query(Variable).filter(Variable.user_id == current_user.id)
    
    if scope:
        query = query.filter(Variable.scope == scope)
    
    if project_id:
        query = query.filter(Variable.project_id == project_id)
    
    variables = query.all()
    
    # Convert to response format
    response = []
    for var in variables:
        var_dict = {
            "id": str(var.id),
            "name": var.name,
            "type": var.type,
            "is_encrypted": var.is_encrypted,
            "description": var.description,
            "scope": var.scope,
            "project_id": str(var.project_id) if var.project_id else None,
        }
        
        # Include value if requested and not encrypted
        if include_values and not var.is_encrypted:
            var_dict["value"] = var.value
        elif include_values and var.is_encrypted:
            var_dict["value"] = "***ENCRYPTED***"
        
        response.append(var_dict)
    
    return response


@router.get("/{variable_id}", response_model=VariableResponse)
async def get_variable(
    variable_id: str,
    include_value: bool = Query(False, description="Include decrypted value"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific variable"""
    variable = db.query(Variable).filter(
        Variable.id == variable_id,
        Variable.user_id == current_user.id
    ).first()
    
    if not variable:
        raise HTTPException(status_code=404, detail="Variable not found")
    
    response = {
        "id": str(variable.id),
        "name": variable.name,
        "type": variable.type,
        "is_encrypted": variable.is_encrypted,
        "description": variable.description,
        "scope": variable.scope,
        "project_id": str(variable.project_id) if variable.project_id else None,
    }
    
    if include_value:
        if variable.is_encrypted:
            response["value"] = decrypt_value(variable.value)
        else:
            response["value"] = variable.value
    
    return response


@router.post("/", response_model=VariableResponse)
async def create_variable(
    variable: VariableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new variable"""
    # Check if variable with same name exists for user
    existing = db.query(Variable).filter(
        Variable.name == variable.name,
        Variable.user_id == current_user.id,
        Variable.scope == variable.scope
    )
    
    if variable.project_id:
        existing = existing.filter(Variable.project_id == variable.project_id)
    
    if existing.first():
        raise HTTPException(status_code=400, detail="Variable with this name already exists")
    
    # Create new variable
    db_variable = Variable(
        id=uuid.uuid4(),
        name=variable.name,
        value=encrypt_value(variable.value) if variable.is_encrypted else variable.value,
        type=variable.type,
        is_encrypted=variable.is_encrypted,
        description=variable.description,
        scope=variable.scope,
        project_id=uuid.UUID(variable.project_id) if variable.project_id else None,
        user_id=current_user.id
    )
    
    db.add(db_variable)
    db.commit()
    db.refresh(db_variable)
    
    return {
        "id": str(db_variable.id),
        "name": db_variable.name,
        "type": db_variable.type,
        "is_encrypted": db_variable.is_encrypted,
        "description": db_variable.description,
        "scope": db_variable.scope,
        "project_id": str(db_variable.project_id) if db_variable.project_id else None,
    }


@router.put("/{variable_id}", response_model=VariableResponse)
async def update_variable(
    variable_id: str,
    variable: VariableUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a variable"""
    db_variable = db.query(Variable).filter(
        Variable.id == variable_id,
        Variable.user_id == current_user.id
    ).first()
    
    if not db_variable:
        raise HTTPException(status_code=404, detail="Variable not found")
    
    # Update fields
    if variable.name is not None:
        db_variable.name = variable.name
    
    if variable.value is not None:
        if variable.is_encrypted or db_variable.is_encrypted:
            db_variable.value = encrypt_value(variable.value)
        else:
            db_variable.value = variable.value
    
    if variable.type is not None:
        db_variable.type = variable.type
    
    if variable.is_encrypted is not None:
        db_variable.is_encrypted = variable.is_encrypted
        # Re-encrypt/decrypt value if encryption status changed
        if variable.is_encrypted and not db_variable.is_encrypted:
            db_variable.value = encrypt_value(db_variable.value)
        elif not variable.is_encrypted and db_variable.is_encrypted:
            db_variable.value = decrypt_value(db_variable.value)
    
    if variable.description is not None:
        db_variable.description = variable.description
    
    db.commit()
    db.refresh(db_variable)
    
    return {
        "id": str(db_variable.id),
        "name": db_variable.name,
        "type": db_variable.type,
        "is_encrypted": db_variable.is_encrypted,
        "description": db_variable.description,
        "scope": db_variable.scope,
        "project_id": str(db_variable.project_id) if db_variable.project_id else None,
    }


@router.delete("/{variable_id}")
async def delete_variable(
    variable_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a variable"""
    db_variable = db.query(Variable).filter(
        Variable.id == variable_id,
        Variable.user_id == current_user.id
    ).first()
    
    if not db_variable:
        raise HTTPException(status_code=404, detail="Variable not found")
    
    db.delete(db_variable)
    db.commit()
    
    return {"message": "Variable deleted successfully"}
