
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

# Inside User class:
company_id = Column(Integer, ForeignKey("companies.id"))
company = relationship("Company")