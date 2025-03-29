from enum import Enum

class TrainingIntensityLevels(Enum):
    AMATEUR = "Amateur"
    EXPERIENCED = "Experienced"
    PROFESSIONAL = "Professional"

class GenderChoices(Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

class TrainingGoals(Enum):
    DEFICIT = "Deficit"
    SURPLUS = "Surplus"
    MAINTAIN = "Maintain"

class WeightUnits(Enum):
    KG = "kg"
    LB = "lb"

class HeightUnits(Enum):
    SI = "SI"
    US = "US"