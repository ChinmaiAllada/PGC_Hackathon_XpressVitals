 **UI Setup:**
•	Fetched patient data on ngOnInit
from Excel using 
@app.route('/patients', methods=['GET']) 
•	Fetched parameter values, criticality level of each patient and on ngOnInit using
@app.route('/classify', methods=['GET'])
Defined constant ranges in the code for each parameter
 ![image](https://github.com/user-attachments/assets/6a778181-046b-4066-ba19-4b0a95d64216)

Used above rule based engine function to classify criticality of each parameter
![image](https://github.com/user-attachments/assets/cb4477c8-d402-43e0-bb6a-979343915c81)

• 	Based on classification of each parameter, final classification is done.
• 	Patient details and level from report is setup in UI.

**OpenAI Setup:**
•	Created a Resource grp – rg_xpress  and Azure OpenAI resource xpressvitals 
•	Deployed gpt-4o-mini model  
•	From Azure OpenAI Studio Service, fetched the API Key, endpoint
•	Created a text file for the prompt to train AI with.

**Twilio Setup:**
•	Configured AccountID and Auth token
•	created an instance of the Client class,  to setup an interaction with Twilio's API to send messages, make calls, and perform other communication tasks programmatically.

**Get Symptoms Button Click:**
•	Send critical and abnormal parameters to @app.route('/openAIWithParams', methods=['POST'])
to store them in response storage, to feed into user prompt.
 ![image](https://github.com/user-attachments/assets/a61fa5e5-3174-48b9-b23e-f7bc9a53ffe4)

•	Send message with critical and abnormal parameters to SendMessage function for each patient
•	SendMessage will call 'https://9f7f-203-200-15-250.ngrok-free.app/send' which has client.messages.create() sends the whatsapp message using Twilio's infrastructure(Twilio API).
•	We have a Conditional Interval Polling System that checks for updates repeatedly for every 5 sec, stopping the polling once all people have valid data.

**Twilio Sandbox Configuration:**
•	To integrate Twilio with our application and to allow incoming WhatsApp messages to be sent to your endpoint (/sms route) save this in sandbox configuration - ‘https://9f7f-203-200-15-250.ngrok-free.app/sms’


**/sms route:**
•	Collects the incoming message from user, stores them as symptoms in response storage and append them to user prompt 
 ![image](https://github.com/user-attachments/assets/5e53b240-664a-4eaa-a8a5-97464b245307)


•	Do an OpenAI API call using user prompt and system prompt(to train)
 
![image](https://github.com/user-attachments/assets/e9cd3634-b77c-4f9e-8554-0a6bc6acf79e)

•	OpenAI will respond with ‘YES/NO/SERIOUS’ 
•	With OpenAI response, level from report, we decide the duration in which appointment should be scheduled.
•	Using these templates 
 ![image](https://github.com/user-attachments/assets/7f7aa465-de57-47d9-964f-9866d75d28e3)




**STATIC FLOW**
•	Twilio Content Template Builder -  to build templates , quick reply template for questions and text template for final duration message and media template for the PDF.
•	Using Studio Flows created a static flow, that starts with a REST API trigger
•	Integrate the trigger Webhook URL with Twilio whatsapp sandbox

**Trigger Flow:**
•	On click on Trigger flow button, trigger flow route is called and triggers twilio flow.
 ![image](https://github.com/user-attachments/assets/8775625e-438f-41dd-bea3-ad39e0dc897c)



