# app.py
from flask import Flask, request, jsonify ,render_template
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv # Import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for cross-origin requests from your frontend

# IMPORTANT: Retrieve your Gemini API Key from environment variables.
# It will now be loaded from the .env file if it exists.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
print("DEBUG: GEMINI_API_KEY loaded:", GEMINI_API_KEY[:10], "..." if GEMINI_API_KEY else "EMPTY")

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in environment variables or .env file.")
    print("Please ensure you have a .env file with GEMINI_API_KEY='YOUR_API_KEY_HERE'")
    print("Or set it as an environment variable directly.")

@app.route('/')
def index():
    return render_template('index.html')
@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Prepare the payload for the Gemini API
    # Using gemini-2.0-flash as per instructions
    chat_history = []
    chat_history.append({"role": "user", "parts": [{"text": user_message}]})

    payload = {
        "contents": chat_history
    }

    # Gemini API endpoint
    # Note: The API key is passed as a query parameter as per the instructions
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

    try:
        response = requests.post(api_url, json=payload, headers={'Content-Type': 'application/json'})
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        result = response.json()

        # Extract the bot's response
        if result.get("candidates") and len(result["candidates"]) > 0 and \
           result["candidates"][0].get("content") and \
           result["candidates"][0]["content"].get("parts") and \
           len(result["candidates"][0]["content"]["parts"]) > 0:
            bot_response = result["candidates"][0]["content"]["parts"][0]["text"]
        else:
            bot_response = "I'm sorry, I couldn't generate a response."
            print(f"Unexpected API response structure: {result}")

        return jsonify({"response": bot_response})

    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({"error": "Failed to connect to the AI service."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

# if __name__ == '__main__':
#     # Run the Flask app
#     # It will be accessible at http://127.0.0.1:5000
#     app.run(debug=True) # debug=True enables auto-reloading and better error messages
if __name__ == '__main__':
    import os
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
