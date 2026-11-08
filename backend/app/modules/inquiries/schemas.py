from pydantic import BaseModel, Field


class InquiryCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    contact_info: str = Field(..., min_length=5, max_length=150)
    role: str = Field(default="Farmer", max_length=50)
    message: str = Field(..., min_length=5, max_length=3000)
    consent: bool = Field(default=True)


class InquiryResponse(BaseModel):
    status: str
    message: str
