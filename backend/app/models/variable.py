from sqlalchemy import Column, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.core.security import encrypt_value, decrypt_value
import uuid


class Variable(Base):
    __tablename__ = "variables"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    value = Column(Text, nullable=False)  # Encrypted value
    type = Column(String, nullable=False, default="string")  # string, number, boolean, json
    is_secret = Column(Boolean, default=False)
    description = Column(Text)
    scope = Column(String, default="global")  # global, project, user
    
    # Relationships
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="variables")
    project = relationship("Project", back_populates="variables")
    
    def set_value(self, value: str, encrypt: bool = None):
        """Set the value, encrypting if necessary"""
        if encrypt is None:
            encrypt = self.is_secret
        
        if encrypt:
            self.value = encrypt_value(value)
        else:
            self.value = value
    
    def get_value(self, decrypt: bool = None):
        """Get the value, decrypting if necessary"""
        if decrypt is None:
            decrypt = self.is_secret
        
        if decrypt:
            return decrypt_value(self.value)
        else:
            return self.value
    
    def to_dict(self, include_value: bool = False):
        """Convert to dictionary, optionally including the value"""
        data = {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "is_secret": self.is_secret,
            "description": self.description,
            "scope": self.scope,
            "user_id": self.user_id,
            "project_id": self.project_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_value and not self.is_secret:
            data["value"] = self.get_value()
        elif include_value and self.is_secret:
            data["value"] = "***ENCRYPTED***"
        
        return data
