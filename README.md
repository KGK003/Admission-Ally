## Project Overview ##

Admission Ally is a web-based platform designed to streamline the college application process. It provides:

Personalized college recommendations based on academic interests and location preferences.

Application tracking to monitor submission statuses.

Interactive geolocation features to discover nearby institutions.

User profiles to save preferences and applications.

Built for students, by students—eliminating the stress of college applications.

## Key Features ##
1. User Authentication
Secure login/signup with Firebase Authentication.

Session persistence for returning users.

2. College Search & Recommendations
Filter by:

Field of Study (e.g., Engineering, Business)

Location (U.S. states)

Real-time data from the College Scorecard API.

3. Application Tracker
CRUD Operations:

Add new applications

Update status (Not Started → In Progress → Submitted)

Delete applications

Firestore Database: Syncs across devices.

4. Interactive Map
Leaflet.js integration.

Displays:

User’s location (geolocation).

Nearby colleges (with custom markers).

5. Responsive UI
Clean, intuitive dashboard.

Mobile-friendly design (via CSS Flexbox/Grid).

## Technical Stack ##
Category	Technologies
Frontend	HTML5, CSS3, JavaScript (ES6+)
Mapping	Leaflet.js
Icons	Font Awesome
Fonts	Google Fonts (Poppins)
Backend	Firebase (Auth, Firestore)
Data API	College Scorecard (U.S. Dept of Education)

## Setup Guide ##
1. Clone the Repository
git clone https://github.com/your-username/admission-ally.git
cd admission-ally

3. Configure Firebase
Create a project at Firebase Console.
Replace the placeholder in script.js:

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

3. Set Up College Scorecard API
Get an API key from api.data.gov.

Update in script.js:
const COLLEGE_API_KEY = "YOUR_KEY_HERE";

4. Run the App

## File Structure ##

admission-ally/
├── index.html          # Main HTML file
├── style.css           # Global styles
├── script.js           # All JavaScript logic
├── assets/             # (Optional) Images/icons
└── README.md           # This file
🔌 API Integration
College Scorecard API
Endpoint: https://api.data.gov/ed/collegescorecard/v1/schools

Sample Query:
fetch(`${COLLEGE_API_URL}?api_key=${COLLEGE_API_KEY}&fields=school.name,school.state&per_page=10`)
Data Used:

School names, locations, URLs.

Latitude/longitude for mapping.

## Firebase Configuration ##
Authentication

Email/password auth via firebase.auth().

Listens for state changes:

onAuthStateChanged(auth, (user) => { ... });
Firestore
Stores:

{
  email: string,
  applications: [{
    name: string,
    
    status: "not_started" | "in_progress" | "submitted"
  }],
  profile: {
    interest: string,  // e.g., "Computer Science"
    locationPref: string
  }
}

## Video link ## 
https://drive.google.com/drive/folders/1rt7Pv8VVFLX5cajeRUTO3fm7W7ithNsy?usp=sharing
