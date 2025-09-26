from typing import Any, Dict, List
import csv
import io
from app.components.base import BaseComponent, PortSchema, DataType


class CSVLoaderComponent(BaseComponent):
    """CSV loader component for reading CSV data"""
    
    name = "csv_loader"
    display_name = "CSV Loader"
    description = "Load data from CSV format"
    category = "Data"
    icon = "FileSpreadsheet"
    version = "1.0.0"
    
    inputs = [
        PortSchema(
            name="csv_data",
            display_name="CSV Data",
            type=DataType.TEXT,
            description="CSV data as text",
            required=True
        ),
        PortSchema(
            name="has_header",
            display_name="Has Header",
            type=DataType.BOOLEAN,
            description="First row contains column names",
            default=True,
            required=False
        ),
    ]
    
    outputs = [
        PortSchema(
            name="data",
            display_name="Data",
            type=DataType.DATA,
            description="Parsed CSV data"
        ),
        PortSchema(
            name="columns",
            display_name="Columns",
            type=DataType.DATA,
            description="Column names"
        ),
    ]
    
    async def build(self, **inputs: Any) -> Dict[str, Any]:
        """Initialize the component"""
        return inputs
    
    async def run(self, **inputs: Any) -> Dict[str, Any]:
        """Run the component"""
        csv_data = inputs.get("csv_data", "")
        has_header = inputs.get("has_header", True)
        
        if not csv_data:
            return {"data": [], "columns": []}
        
        # Parse CSV
        reader = csv.reader(io.StringIO(csv_data))
        rows = list(reader)
        
        if not rows:
            return {"data": [], "columns": []}
        
        if has_header:
            columns = rows[0]
            data = [dict(zip(columns, row)) for row in rows[1:]]
        else:
            columns = [f"column_{i}" for i in range(len(rows[0]))]
            data = [dict(zip(columns, row)) for row in rows]
        
        return {
            "data": data,
            "columns": columns,
            "row_count": len(data)
        }
