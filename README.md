Build and run instructions

System Configuration
    Frontend: React Native (using Expo)
    Backend: Flask
    Data Storage: SQLAlchemy with SQLite (for development/testing) and MariaDB (for production)
    Authorization: JWT-based authentication
    API Testing: Postman
    Dependencies:
    Frontend: listed in package.json
    Backend: listed in Pipfile

External APIs
    Open Food Facts API
    Endpoint: https://world.openfoodfacts.org/api/v0/product/{barcode}.json
    Purpose: Retrieves macronutrient data (calories, protein, carbs, fats, and fiber) for food items based on barcodes
 
Deploying and Running the Application
To run the application locally, you will need two terminal windows: one for the backend and one for the frontend.

Backend Setup:
    Ensure Python 3.10 and pipenv are installed
    Install with pip install pipenv, or on macOS with Homebrew: brew install pipenv
    Navigate to the backend directory and run:
    pipenv shell  
    flask run
Frontend Setup:
    Ensure Node.js, npm, and expo-cli are installed
Run:
    npm install  
    npm install --global expo-cli
    In the frontend directory, start the app with:
    npx expo start

Or: Use the QR code or a simulator to run the application on a mobile device or emulator.
