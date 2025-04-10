from enum import Enum


class TrainingIntensityLevels(Enum):
    AMATEUR = 'AMATEUR'
    EXPERIENCED = 'EXPERIENCED'
    PROFESSIONAL = 'PROFESSIONAL'


class GenderChoices(Enum):
    MALE = 'MALE'
    FEMALE = 'FEMALE'
    OTHER = 'OTHER'


class TrainingGoals(Enum):
    DEFICIT = 'DEFICIT'
    SURPLUS = 'SURPLUS'
    MAINTAIN = 'MAINTAIN'


class WeightUnits(Enum):
    KG = 'KG'
    LB = 'LB'


class HeightUnits(Enum):
    SI = 'SI'
    US = 'US'
