from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Define the classification ranges
RANGES = {
    "Platelets": {
        "normal": (150000, 400000),
        "critical_low": (None, 50000),
        "critical_high": (1000000, None)
    },
    "Hemoglobin (Male)": {
        "normal": (13.5, 17.5),
        "critical_low": (None, 7),
        "critical_high": (20, None)
    },
    "Hemoglobin (Female)": {
        "normal": (12.0, 16.0),
        "critical_low": (None, 7),
        "critical_high": (20, None)
    },
    "BUN": {
        "normal": (7, 20),
        "critical_high": (50, None)
    },
    "Bilirubin": {
        "normal": (0.1, 1.2),
        "critical_high": (3.0, None)
    },
    "Creatinine": {
        "normal": (0.6, 1.3),
        "critical_high": (2.0, None)
    },
    "TSH": {
        "normal": (0.4, 4.0),
        "critical_high": (10, None),
        "critical_low": (None, 0.01)
    },
    "HbA1c": {
        "normal": (4, 5.7),
        "critical_high": (10, None)
    },
    "Sodium": {
        "normal": (135, 145),
        "critical_low": (None, 120),
        "critical_high": (160, None)
    },
    "Potassium": {
        "normal": (3.5, 5.0),
        "critical_low": (None, 2.5),
        "critical_high": (6.0, None)
    }
}

def classify_patients(patients):
    classifications = []
    
    for patient in patients:
        status = patient['Classifications']
        if any(value == "Critical High" or value == "Critical Low" for value in status.values()):
            classifications.append({"PatientID": patient["PatientID"], "Classification": "Critical"})
        elif all(value == "Normal" for value in status.values()):
            classifications.append({"PatientID": patient["PatientID"], "Classification": "Normal"})
        else:
            classifications.append({"PatientID": patient["PatientID"], "Classification": "Abnormal"})
    
    return classifications

def classify_value(value, ranges):
    """Classify the value based on the given ranges."""
    if ranges.get("critical_low") and value < ranges["critical_low"][1]:
        return "Critical Low"
    if ranges.get("critical_high") and value > ranges["critical_high"][0]:
        return "Critical High"
    if ranges["normal"][0] <= value <= ranges["normal"][1]:
        return "Normal"
    return "Abnormal"

 

@app.route('/patients', methods=['GET'])
def get_patients():
    # Load Excel file
    excel_path = "./patient_data_with_abnormals.xlsx"  # Use forward slashes for compatibility
    patients_data = pd.read_excel(excel_path)
    
    # Convert DataFrame to JSON
    return jsonify(patients_data.to_dict(orient='records'))


@app.route('/classify', methods=['POST'])
def classify_patients_route():
    # Load Excel file
    excel_path = "./patient_data_with_abnormals.xlsx"  # Use forward slashes for compatibility
    df = pd.read_excel(excel_path)

    results = []

    for index, row in df.iterrows():
        patient_result = {"PatientID": row["ID"], "Classifications": {}}
        for param in RANGES.keys():
            # Assuming the parameters are named as in the RANGES dictionary in the Excel file
            if param in row:
                value = row[param]
                if pd.notnull(value):  # Check if the value is not NaN
                    # Special handling for Hemoglobin based on gender
                    if param == "Hemoglobin":
                        gender = row.get("Gender", "Male")  # Default to Male if Gender column missing
                        param_name = f"{param} ({gender})"
                    else:
                        param_name = param
                    patient_result["Classifications"][param] = classify_value(value, RANGES[param_name])

        results.append(patient_result)

    return jsonify(classify_patients(results))

# Run Flask app
if __name__ == '__main__':
    app.run(debug=True)
