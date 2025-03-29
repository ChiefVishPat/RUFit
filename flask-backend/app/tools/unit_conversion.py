pound_multiplier = 2.205
cm_to_in_multiplier = 0.394

"""
    Converts SI weight unit (kg) to US weight unit (lb)
"""
def SI_to_US_weight(kg):
    return kg * 2.205


def SI_to_US_height(m, cm):
    total_cm = (m * 100) + cm
    total_inches = int(total_cm * cm_to_in_multiplier)
    feet = int(total_inches / 12)
    inches = total_inches % 12
    return (feet, inches)