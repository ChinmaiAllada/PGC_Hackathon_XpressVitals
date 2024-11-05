from flask import Flask, request, jsonify, send_from_directory
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
from flask_cors import CORS
import pandas as pd
import requests
import json
import re
 
# Replace with your Azure OpenAI resource information
api_key = "C2dkqWsvNkoRRryZWoCeIMD22GTXlg9cOTaOhW4TK5BvyqPeJ9MMJQQJ99AJACYeBjFXJ3w3AAABACOGBZOS"  # Your Azure OpenAI API key
endpoint = "https://xpressvitals.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-08-01-preview"  # Your Azure OpenAI endpoint (e.g., https://your-resource-name.openai.azure.com/)
model = "gpt-4o-mini"  
 
# Set the headers for the API request
headers = {
    "Content-Type": "application/json",
    "api-key": api_key,
}
 
 
# Set the body for the API request
# data = {
#     "model": model,
#     "messages": [{"role": "user", "content": prompt}],
#     "temperature": 0.7,  # Control randomness in the output
#     "max_tokens": 100,    # Limit the length of the output
# }
 
# Make the API request
# response = requests.post(f"{endpoint}/chat/completions?api-version=2023-05-15", headers=headers, json=data)
 
# Check for errors in the response
# if response.status_code == 200:
#     # Parse the JSON response
#     response_data = response.json()
#     print("Response from OpenAI:", response_data['choices'][0]['message']['content'])
# else:
#     print("Error:", response.status_code, response.text)

account_sid = 'AC1614886bad304db756acc9987a8b8a9e'
auth_token = 'd1a4113e47ee281075e32b98df570e16'
client = Client(account_sid, auth_token)
app = Flask(__name__)
CORS(app) 
# ===================================================== OPEN AI ===============================================
 # Replace with your Azure OpenAI resource information
api_key = "C2dkqWsvNkoRRryZWoCeIMD22GTXlg9cOTaOhW4TK5BvyqPeJ9MMJQQJ99AJACYeBjFXJ3w3AAABACOGBZOS"  # Your Azure OpenAI API key
endpoint = "https://xpressvitals.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-08-01-preview"  # Your Azure OpenAI endpoint (e.g., https://your-resource-name.openai.azure.com/)
model = "gpt-4o-mini"  # Use the appropriate model name (e.g., gpt-35-turbo or any other model you have access to)
    
# Set the headers for the API request
headers = {
    "Content-Type": "application/json",
    "api-key": api_key,
}

systemPromptToOpenAI = "You are a medical assistant trained to validate symptoms based on provided health parameters. When a user describes their symptoms and specifies abnormal or critical health parameters, your task is to respond with 'YES' if the symptoms match the parameters and 'NO' if they do not. Do not provide any additional information or explanations."
# Save the text in a separate file and read it
with open("system-prompt.txt", "r") as file:
    long_string = file.read()


# # Define the prompt for the model
# prompt = "What is the capital of France?"
# ===================================================== OPEN AI ===================================================


@app.route('/')
def home():
    return send_from_directory('.', 'index.html')


def get_duration(openai, level, patient_name):
    # Define the message template based on the level
    message_templates = {
        "24 hours": (
            "Hello {patient_name}, we have reviewed your blood report and your reported symptoms. "
            "Based on your reports and symptoms, it’s vital to schedule an appointment with us immediately. "
            "Please expect a call within the next **{duration}** to arrange this."
        ),
        "1 week": (
            "Hello {patient_name}, we have reviewed your blood report and your reported symptoms. "
            "Based on your reports and symptoms, it’s important that you schedule an appointment with us as soon as possible. "
            "Please expect a call within the next **{duration}** to arrange this."
        ),
        "2 weeks": (
            "Hello {patient_name}, we have reviewed your blood report and your reported symptoms. "
            "Based on your reports and symptoms, we recommend that you schedule an appointment with us as soon as possible.. "
            "Please expect a call within the next **{duration}** to arrange this."
        ),
        "1 month": (
            "Hello {patient_name}, we have reviewed your blood report and your reported symptoms. "
            "Based on your reports and symptoms, you are perfectly fine,but we recommend scheduling a routine check-up. "
            "Please expect a call within the next **{duration}** to arrange this."
        )
    }

    # Map durations based on the openai and level input
    duration_map = {
        ("YES", "C"): "24 hours",
        ("NO", "C"): "24 hours",
        ("SERIOUS", "C"): "24 hours",
        ("YES", "A"): "1 week",
        ("NO", "A"): "2 weeks",
        ("SERIOUS", "A"): "24 hours",
        ("YES", "N"): "2 weeks",
        ("NO", "N"): "1 month",
        ("SERIOUS", "N"): "24 hours",
    }

    duration = duration_map.get((openai, level), "2 weeks")
   
    if duration != "Condition not found":
        # Get the appropriate message template based on the level
        message_template = message_templates.get(duration)
        if message_template:
            return message_template.format(patient_name=patient_name, duration=duration)
        else:
            return "Invalid level provided."
        
    else:
        return duration



# @app.route('/sms', methods=['POST'])
# def sms_reply():
#     incoming_msg = request.form.get('Body')
#     contact_number = str(request.form.get('From')).replace('whatsapp:', '')
    
#     resp = MessagingResponse()
#     msg = resp.message()
    
#     # Check if we have a stored OpenAI query that requires user input
#     if contact_number in response_storage and 'prompt' in response_storage[contact_number]:
#         # Combine initial OpenAI message with the user's reply
#         prompt_with_patient_params = response_storage[contact_number]['prompt']
#         abnormalParams = response_storage[contact_number]['abnormalParams']
#         criticalParams = response_storage[contact_number]['criticalParams']
#         patient_name = response_storage[contact_number]['name']
#         prompt = f"{prompt_with_patient_params}\nUser response: {incoming_msg}"
        
#         print(response_storage[contact_number],'response_storage')
#         print(prompt)
#         # Prepare data for OpenAI API call
#         data = {
#             "model": model,
#             # "messages": [{"role": "user", "content": prompt}],
#             "messages":[
#                 {"role": "system", "content": long_string},
#                 {"role": "user", "content": prompt}
#             ],
#             "temperature": 0.7,
#             "max_tokens": 20,
#         }
        
#         # Send combined data to OpenAI
#         openai_response = requests.post(f"{endpoint}", headers=headers, json=data)
#         if openai_response.status_code == 200:
#             openai_content = openai_response.json()['choices'][0]['message']['content']
             
#             if(len(criticalParams) != 0):
#                 level = "C"
#             elif(len(abnormalParams) != 0):
#                 level = "A"
#             else:
#                 level = "N"
            
#             # Respond with OpenAI's combined advice
#             # msg.body(openai_content)
#             template = get_duration(openai_content, level, patient_name)
#             msg.body(template)
#             # Clean up the session storage for this contact
#             del response_storage[contact_number]
#         else:
#             msg.body("Error: Unable to fetch further advice.")
#     else:
#         # Default response if no stored message is found
#         msg.body("I am sorry, I did not understand that. Please send the test results.")
    
#     return str(resp)


@app.route('/sms', methods=['POST'])
def sms_reply():
    incoming_msg = request.form.get('Body')
    contact_number = str(request.form.get('From')).replace('whatsapp:', '')
    
    resp = MessagingResponse()
    msg = resp.message()
    
    # Check if we have a stored OpenAI query that requires user input
    if contact_number in response_storage:
        response_storage[contact_number]['symptoms'] = incoming_msg
        
        
            
        
        print(response_storage)
        if response_storage[contact_number].get('replied', False):
            # If the user has already received a response, don't reply again
            # msg.body("You have already sent a response. Thank you!")
            return str(resp)

        # If there is a prompt stored
        if 'prompt' in response_storage[contact_number]:
            # Combine initial OpenAI message with the user's reply
            prompt_with_patient_params = response_storage[contact_number]['prompt']
            abnormalParams = response_storage[contact_number]['abnormalParams']
            criticalParams = response_storage[contact_number]['criticalParams']
            patient_name = response_storage[contact_number]['name']
            prompt = f"{prompt_with_patient_params}\nUser response: {incoming_msg}"
            
            print(response_storage[contact_number], 'response_storage')
            print(prompt)
            
            # Prepare data for OpenAI API call
            data = {
                "model": model,
                "messages": [
                    {"role": "system", "content": long_string},
                    {"role": "user", "content": prompt}
                ],
                # "temperature": 0.7,
                "temperature": 0.4,
                "max_tokens": 20,
            }
            
            # Send combined data to OpenAI
            openai_response = requests.post(f"{endpoint}", headers=headers, json=data)
            if openai_response.status_code == 200:
                openai_content = openai_response.json()['choices'][0]['message']['content']
                
                # Determine the level based on abnormal and critical parameters
                if len(criticalParams) != 0:
                    level = "C"
                elif len(abnormalParams) != 0:
                    level = "A"
                else:
                    level = "N"
                    
                response_storage[contact_number]['final_level'] = level
                
                # Respond with OpenAI's combined advice
                template = get_duration(openai_content, level, patient_name)
                msg.body(template)
                
                time_frames = ["1 week", "24 hours", "2 weeks", "1 month"]
                found_time_frame = None

                # Search for each time frame in the template
                for time_frame in time_frames:
                    if re.search(r'\b' + re.escape(time_frame) + r'\b', template):
                        found_time_frame = time_frame
                        break  #
                    
                if found_time_frame != None:
                    response_storage[contact_number]['duration'] = found_time_frame
                # Mark that we have replied to the user
                response_storage[contact_number]['replied'] = True
            else:
                msg.body("Error: Unable to fetch further advice because the response status was not 200-OK.")
        else:
            # Default response if no stored message is found
            msg.body("I am sorry, I did not understand that. Please send the test results.")
    else:
        # If the contact number is not found in response_storage
        msg.body("I am sorry, I did not understand that. Please send the test results.")
        
    print(str(resp))
    return str(resp)


@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    contact = request.args.get('contact')
    formatted_contact = '+' + contact.lstrip('0') 
    # Check if the contact is in response_storage
    if formatted_contact in response_storage:
        # Retrieve symptoms for the given contact
        symptoms = response_storage[formatted_contact].get('symptoms', 'N/A')
        duration = response_storage[formatted_contact].get('duration', 'N/A')
        final_level = response_storage[formatted_contact].get('final_level', 'N/A')
        return jsonify({'contact': formatted_contact, 'symptoms': symptoms, 'duration': duration,'final_level':final_level}), 200
    else:
        # Return an empty response if no symptoms are found
        return jsonify({'contact': formatted_contact, 'symptoms': 'No symptoms recorded', 'duration': 'Not yet finalized','final_level': 'Not yet finalized'}), 404

# @app.route('/sms-responses/<contact_number>', methods=['GET'])
# def get_symptoms(contact_number):
#     # Prepend '+' to the contact number
#     formatted_contact_number = f"+{contact_number.lstrip('+')}"
    
#     # Check if the formatted_contact_number exists in response_storage
#     if formatted_contact_number in response_storage:
#         # Get the user response (symptoms)
#         user_response = response_storage[formatted_contact_number].get('user_response', 'No symptoms reported yet.')
#         return jsonify({'symptoms': user_response}), 200
#     else:
#         return jsonify({'symptoms': 'No symptoms reported yet.'}), 404


# # ======================================================================================================================


response_storage = {}
 
@app.route('/openAIWithParams', methods=['POST'])
def send_openAI_with_params():
    request_data = request.get_json()
    critical_params = request_data.get("criticalParams", [])
    abnormal_params = request_data.get("abnormalParams", [])
    contact_number = request_data.get("contact")  # The recipient's contact number
    name = request_data.get("name")  
    # Format prompt using critical and abnormal parameters
    prompt = (
        f"Patient's test results:\n"
        f"Critical: {', '.join(critical_params)}\n"
        f"Abnormal: {', '.join(abnormal_params)}\n"
        # f"Provide advice based on these results."
    )
    response_storage[f'+{contact_number}'] = {
        'prompt': prompt,
        'criticalParams': critical_params,
        'abnormalParams': abnormal_params,
        'name': name
    }
    return response_storage
    # data = {
    #     "model": model,
    #     "messages": [{"role": "user", "content": prompt}],
    #     "temperature": 0.7,
    #     "max_tokens": 20,
    # }

    # # OpenAI API request
    # response = requests.post(f"{endpoint}", headers=headers, json=data)
    
    # if response.status_code == 200:
    #     response_data = response.json()
    #     openai_message = response_data['choices'][0]['message']['content']
        
    #     # Store the response mapped to the user's contact
    #     # response_storage[f'+{contact_number}'] = openai_message
    #       # Store initial response in response storage
    #     response_storage[f'+{contact_number}'] = {'initial_response': openai_message}
    #     return jsonify({"message": openai_message})
    # else:
    #     return jsonify({"error": "Failed to get response from OpenAI"}), response.status_code

@app.route('/send', methods=['POST'])
def send_message():
    to_number = request.json.get('to')
    message_body = request.json.get('body')

    message = client.messages.create(
        from_='whatsapp:+14155238886',
        body=message_body,
        to=f'whatsapp:{to_number}'
    )
    return jsonify({"message_sid": message.sid}), 200

#======================================= PATIENT CLASSIFICATION =============================================

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

# @app.route('/patients_level', methods=['POST'])
# def classify_patients():
#     request_data = request.get_json()
#     patients = request_data.get("patients")
#     classifications = []
    
#     for patient in patients:
#         status = patient['Classifications']
#         if any(value == "Critical High" or value == "Critical Low" for value in status.values()):
#             classifications.append({"PatientID": patient["ID"], "Classification": "Critical"})
#         elif all(value == "Normal" for value in status.values()):
#             classifications.append({"PatientID": patient["ID"], "Classification": "Normal"})
#         else:
#             classifications.append({"PatientID": patient["ID"], "Classification": "Abnormal"})
    
#     return classifications

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


# @app.route('/classify', methods=['GET'])
# def classify_patients_route():
    # Load Excel file
    # excel_path = "./patient_data_with_abnormals.xlsx"  # Use forward slashes for compatibility
    # df = pd.read_excel(excel_path)

    # results = []

    # for index, row in df.iterrows():
    #     patient_result = {"ID": row["ID"],"Name":row["Name"],"Contact":row["Contact"], "Classifications": {}}
    #     for param in RANGES.keys():
    #         # Assuming the parameters are named as in the RANGES dictionary in the Excel file
    #         if param in row:
    #             print(param)
    #             value = row[param]
    #             if pd.notnull(value):  # Check if the value is not NaN
    #                 # Special handling for Hemoglobin based on gender
    #                 if param == "Hemoglobin (Male)" or param == "Hemoglobin (Female)":
    #                     gender = row.get("Gender", "Male")  # Default to Male if Gender column missing
    #                     param_name = f"Hemoglobin ({gender})"
    #                     if param_name not in RANGES:  # Ensure param_name is in RANGES
    #                         continue
    #                 else:
    #                     param_name = param

    #                 classification = classify_value(value, RANGES[param_name])
    #                 patient_result["Classifications"][param] = classification
    #                 # patient_result["Classifications"][param] = classify_value(value, RANGES[param_name])
    #                 # Debug statement to check if Hemoglobin classification is reached
    #                 if param_name.startswith("Hemoglobin"):
    #                     print(f"Classifying Hemoglobin for {patient_result['Name']} as {classification}")

    #     results.append(patient_result)

    # return jsonify((results))


@app.route('/classify', methods=['GET'])
def classify_patients_route():
    # Load Excel file
    excel_path = "./patient_data_with_abnormals.xlsx"  # Use forward slashes for compatibility
    df = pd.read_excel(excel_path)

    # Print the column names for debugging
    print("Columns in DataFrame:", df.columns.tolist())

    results = []

    for index, row in df.iterrows():
        patient_result = {
            "ID": row["ID"],
            "Name": row["Name"],
            "Contact": row["Contact"],
            "Classifications": {}
        }
        
        # Check Hemoglobin based on Gender first
        gender = row.get("Gender", "Male")
        hemoglobin_key = f"Hemoglobin ({'Male' if gender == 'Male' else 'Female'})"

        # Classify Hemoglobin if the key exists in the DataFrame
        hemoglobin_value = row.get("Hemoglobin")
        if hemoglobin_key in RANGES and pd.notnull(hemoglobin_value):
            patient_result["Classifications"][hemoglobin_key] = classify_value(hemoglobin_value, RANGES[hemoglobin_key])

        # Iterate through other parameters
        for param in RANGES.keys():
            # Skip Hemoglobin since it's already classified
            if param == hemoglobin_key:
                continue
            
            if param in row:
                value = row[param]
                if pd.notnull(value):  # Check if the value is not NaN
                    classification = classify_value(value, RANGES[param])
                    patient_result["Classifications"][param] = classification

        # results.append(patient_result)
        
         # Determine final classification based on the classifications
        status = patient_result["Classifications"]
        if any(value in ["Critical High", "Critical Low"] for value in status.values()):
            final_classification = "Critical"
        elif all(value == "Normal" for value in status.values()):
            final_classification = "Normal"
        else:
            final_classification = "Abnormal"

        patient_result["FinalClassification"] = final_classification
        results.append(patient_result)


    return jsonify(results)


# =========================================== OPEN AI ===============================================================

 # Replace with your Azure OpenAI resource information
api_key = "C2dkqWsvNkoRRryZWoCeIMD22GTXlg9cOTaOhW4TK5BvyqPeJ9MMJQQJ99AJACYeBjFXJ3w3AAABACOGBZOS"  # Your Azure OpenAI API key
endpoint = "https://xpressvitals.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-08-01-preview"  # Your Azure OpenAI endpoint (e.g., https://your-resource-name.openai.azure.com/)
model = "gpt-4o-mini"  # Use the appropriate model name (e.g., gpt-35-turbo or any other model you have access to)
    
# Set the headers for the API request
headers = {
    "Content-Type": "application/json",
    "api-key": api_key,
}
    
# Define the prompt for the model
prompt = "What is the capital of France?"

def open_AI():

    # Set the body for the API request
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,  # Control randomness in the output
        "max_tokens": 100,    # Limit the length of the output
    }
    
    # Make the API request
    response = requests.post(f"{endpoint}/chat/completions?api-version=2023-05-15", headers=headers, json=data)
    
    # Check for errors in the response
    if response.status_code == 200:
        # Parse the JSON response
        response_data = response.json()
        print("Response from OpenAI:", response_data['choices'][0]['message']['content'])
    else:
        print("Error:", response.status_code, response.text)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)