const setGoalsPrompts = [
    {label: "Deficit", value: "Losing fat while maintaining muscle"},
    {label: "Maintain", value: "Maintaining body weight and muscle"},
    {label: "Surplus", value: "Gaining fat and muscle"}
]

function getValueByLabel(object, labelName, defaultValue = null) {
    return Object.values(object).find(level => level.label === labelName)?.value ?? defaultValue;
}


export { getValueByLabel, setGoalsPrompts };