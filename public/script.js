import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { 
    getFirestore,
    doc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDXIiUx5kUv9kVesuRDrDEG_5jeYg9AKIk",
    authDomain: "admission-ally.firebaseapp.com",
    projectId: "admission-ally",
    storageBucket: "admission-ally.appspot.com",
    messagingSenderId: "353955471864",
    appId: "1:353955471864:web:94f6d36abf34e87bb4f60d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const COLLEGE_API_KEY = "gdmJDymULNmhsj3iAEwXYPvXhzGPkDF8UrerB1Ou";
const COLLEGE_API_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";

const elements = {
    landingLoginBtn: document.getElementById("landingLoginBtn"),
    landingSignupLink: document.getElementById("landingSignupLink"),
    landingPage: document.getElementById("landing-page"),
    authContainer: document.getElementById("authContainer"),
    loginForm: document.getElementById("loginForm"),
    signupForm: document.getElementById("signupForm"),
    dashboard: document.getElementById("dashboard"),
    userEmail: document.getElementById("userEmail"),
    logoutBtn: document.getElementById("logoutBtn"),
    applicationsList: document.getElementById("applicationsList"),
    newAppName: document.getElementById("newAppName"),
    newAppStatus: document.getElementById("newAppStatus"),
    addAppBtn: document.getElementById("addAppBtn"),
    studyField: document.getElementById("studyField"),
    searchLocation: document.getElementById("searchLocation"),
    searchCollegesBtn: document.getElementById("searchCollegesBtn"),
    recommendedColleges: document.getElementById("recommendedColleges"),
    map: document.getElementById("map"),
    locationStatus: document.getElementById("locationStatus"),
    userInterest: document.getElementById("userInterest"),
    saveProfileBtn: document.getElementById("saveProfileBtn"),
    locationPreference: document.getElementById("locationPreference")
};

const STATE_CODES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

function initMap(lat, lng) {
    // 1. Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error("ERROR: #map element not found in HTML!");
        return;
    }

    // 2. Ensure container is visible
    mapContainer.style.display = 'block';
    mapContainer.style.height = '400px';

    // 3. Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error("ERROR: Leaflet not loaded!");
        return;
    }

    // 4. Remove old map if exists
    if (window.map) {
        window.map.remove();
    }

    // 5. Create new map
    window.map = L.map('map').setView([lat, lng], 13);
    
    // 6. Add map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(window.map);

    // 7. Add user marker
    window.userMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'user-marker',
            html: '<i class="fas fa-user"></i>',
            iconSize: [30, 30]
        })
    }).addTo(window.map).bindPopup("Your location").openPopup();

    console.log("Map initialized successfully!");
}

let map;
let userMarker;


init();

function init() {
    setupEventListeners();
    checkAuthState();
}

function setupEventListeners() {
    elements.landingLoginBtn?.addEventListener("click", () => showAuthForm("login"));
    elements.landingSignupLink?.addEventListener("click", (e) => {
        e.preventDefault();
        showAuthForm("signup");
    });
    elements.loginForm?.addEventListener("submit", handleLogin);
    elements.signupForm?.addEventListener("submit", handleSignup);
    elements.logoutBtn?.addEventListener("click", handleLogout);
    elements.addAppBtn?.addEventListener("click", addApplication);
    elements.applicationsList?.addEventListener("change", handleStatusUpdate);
    elements.applicationsList?.addEventListener("click", handleDeleteApp);
    elements.searchCollegesBtn?.addEventListener("click", searchColleges);
    elements.saveProfileBtn?.addEventListener("click", saveUserProfile);
}

function checkAuthState() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await initializeUserDocument(user);
            showDashboard(user);
            setupUserDataListener(user.uid);
        } else {
            showLandingPage();
        }
    });
}

async function initializeUserDocument(user) {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        email: user.email,
        applications: [],
        profile: {
            interest: "",
            locationPref: ""
        }
    }, { merge: true });
}

async function handleLogin(e) {
    e.preventDefault();
    try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert(`Login failed: ${error.message}`);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    try {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await initializeUserDocument(userCred.user);
    } catch (error) {
        alert(`Signup failed: ${error.message}`);
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout error:", error);
    }
}

function setupUserDataListener(userId) {
    const userDocRef = doc(db, "users", userId);
    
    onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            updateUI(doc.data());
        }
    });
}

function updateUI(userData) {
    if (elements.userInterest && userData.profile) {
        elements.userInterest.value = userData.profile.interest || "";
    }
    
    if (elements.applicationsList) {
        displayApplications(userData.applications || []);
    }
    
    if (elements.userEmail && auth.currentUser) {
        elements.userEmail.textContent = auth.currentUser.email;
    }
}

function displayApplications(applications) {
    elements.applicationsList.innerHTML = applications.map(app => `
        <li class="application-item">
            <span>${app.name}</span>
            <select class="status-select" data-appname="${app.name}">
                <option value="not_started" ${app.status === 'not_started' ? 'selected' : ''}>Not Started</option>
                <option value="in_progress" ${app.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="submitted" ${app.status === 'submitted' ? 'selected' : ''}>Submitted</option>
            </select>
            <button class="delete-btn" data-appname="${app.name}">
                <i class="fas fa-trash"></i>
            </button>
        </li>
    `).join('');
}

async function addApplication() {
    const name = elements.newAppName.value.trim();
    const status = elements.newAppStatus.value;
    
    if (!name) return alert("Please enter a school name");
    if (!auth.currentUser) return alert("Please login first");

    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
            applications: arrayUnion({
                name,
                status,
                dateAdded: new Date().toISOString()
            })
        });
        elements.newAppName.value = "";
    } catch (error) {
        alert("Failed to save application: " + error.message);
    }
}

async function handleStatusUpdate(e) {
    if (!e.target.classList.contains('status-select')) return;
    
    const appName = e.target.dataset.appname;
    const newStatus = e.target.value;
    const userId = auth.currentUser.uid;

    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        const currentApps = userDoc.data().applications;
        const updatedApps = currentApps.map(app => 
            app.name === appName ? { ...app, status: newStatus } : app
        );
        
        await updateDoc(doc(db, "users", userId), {
            applications: updatedApps
        });
    } catch (error) {
        console.error("Update error:", error);
    }
}

async function handleDeleteApp(e) {
    if (!e.target.closest('.delete-btn')) return;
    
    const appName = e.target.closest('.delete-btn').dataset.appname;
    const userId = auth.currentUser.uid;

    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        const currentApps = userDoc.data().applications;
        const updatedApps = currentApps.filter(app => app.name !== appName);
        
        await updateDoc(doc(db, "users", userId), {
            applications: updatedApps
        });
    } catch (error) {
        alert("Failed to delete application: " + error.message);
    }
}

async function searchColleges() {
    const studyField = elements.studyField.value;
    const location = elements.searchLocation.value.trim().toUpperCase();
    const resultsDiv = elements.recommendedColleges;
    
    resultsDiv.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching colleges...</div>`;

    try {
        let stateCode = location;
        if (location.length > 2) {
            const stateOption = document.querySelector(`#states option[value="${location}"]`);
            if (stateOption) stateCode = stateOption.value;
        }
        
        const params = new URLSearchParams({
            api_key: COLLEGE_API_KEY,
            fields: 'school.name,school.city,school.state,school.school_url,location',
            per_page: '20',
            'school.operating': '1',
            '2018.academics.program.bachelors': 'true',
            'school.degrees_awarded.predominant': '2,3'
        });

        if (studyField) {
            params.set('2018.academics.program_available.assoc_or_bachelors', 'true');
            params.set('2018.academics.program_percentage.assoc_or_bachelors', studyField);
        }

        if (stateCode && STATE_CODES.includes(stateCode)) {
            params.set('school.state', stateCode);
        }

        const response = await fetch(`${COLLEGE_API_URL}?${params.toString()}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        
        if (data.results?.length > 0) {
            const colleges = data.results.map(college => ({
                name: college['school.name'] || 'Unknown College',
                city: college['school.city'] || '',
                state: college['school.state'] || '',
                url: college['school.school_url'] || '',
                lat: college['location.lat'] || null,
                lon: college['location.lon'] || null
            }));
            
            displayCollegeRecommendations(colleges);
            if (map) updateMapWithColleges(colleges);
        } else {
            showFallbackColleges();
        }
    } catch (error) {
        console.error("Search error:", error);
        resultsDiv.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                Error: ${error.message}
            </div>
        `;
        showFallbackColleges();
    }
}

function displayCollegeRecommendations(colleges) {
    elements.recommendedColleges.innerHTML = colleges.map(college => `
        <div class="college-card">
            <h3>${college.name}</h3>
            <p><i class="fas fa-map-marker-alt"></i> ${college.city}, ${college.state}</p>
            ${college.url ? `<a href="${college.url}" target="_blank" class="college-link">Visit Website</a>` : ''}
            <button class="add-to-apps-btn" data-name="${college.name}">
                <i class="fas fa-plus"></i> Add to Applications
            </button>
        </div>
    `).join('');

    document.querySelectorAll('.add-to-apps-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.newAppName.value = btn.dataset.name;
            elements.newAppStatus.value = 'not_started';
        });
    });
}
function emergencyMapFix() {
    // Ensure map container has height
    const mapEl = document.getElementById('map');
    if (mapEl) {
        mapEl.style.height = '400px';
        mapEl.style.backgroundColor = '#f8f9fa';
    }
    

    if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => console.log('Leaflet loaded!');
        document.head.appendChild(script);
    }
}

document.addEventListener('DOMContentLoaded', emergencyMapFix);
    function showFallbackColleges() {
        const fallbackColleges = [
        
            {
                name: "Columbia University",
                city: "New York",
                state: "NY",
                url: "https://www.columbia.edu",
                lat: 40.8075,
                lon: -73.9626
            },
            {
                name: "New York University",
                city: "New York",
                state: "NY",
                url: "https://www.nyu.edu",
                lat: 40.7295,
                lon: -73.9965
            },
            {
                name: "Cornell University",
                city: "Ithaca",
                state: "NY",
                url: "https://www.cornell.edu",
                lat: 42.4475,
                lon: -76.4832
            },
            {
                name: "University of Rochester",
                city: "Rochester",
                state: "NY",
                url: "https://www.rochester.edu",
                lat: 43.1287,
                lon: -77.6265
            },
            {
                name: "Syracuse University",
                city: "Syracuse",
                state: "NY",
                url: "https://www.syracuse.edu",
                lat: 43.0382,
                lon: -76.1329
            }
        ];
    
        elements.recommendedColleges.innerHTML = `
            <div class="notice">
                <i class="fas fa-info-circle"></i>
                Showing recommended colleges in New York
            </div>
        `;
        
        displayCollegeRecommendations(fallbackColleges);
        if (map) updateMapWithColleges(fallbackColleges);
    }
function updateMapWithColleges(colleges) {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer !== userMarker) {
            map.removeLayer(layer);
        }
    });

    colleges.forEach(college => {
        if (college.lat && college.lon) {
            L.marker([college.lat, college.lon], {
                icon: L.divIcon({
                    className: 'college-marker',
                    html: '<i class="fas fa-graduation-cap"></i>',
                    iconSize: [30, 30]
                })
            }).addTo(map).bindPopup(college.name);
        }
    });
}

async function saveUserProfile() {
    if (!auth.currentUser) return;

    try {
        const locationPref = elements.locationPreference.value;
        
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
            profile: {
                interest: elements.userInterest.value,
                locationPref: locationPref
            }
        });
        alert("Profile saved successfully!");
    } catch (error) {
        alert("Failed to save profile: " + error.message);
    }
}

function showLandingPage() {
    elements.landingPage.style.display = "flex";
    elements.authContainer.style.display = "none";
    elements.dashboard.style.display = "none";
}

function showAuthForm(formType) {
    elements.landingPage.style.display = "none";
    elements.authContainer.style.display = "flex";
    elements.dashboard.style.display = "none";
    
    if (formType === "login") {
        elements.loginForm.style.display = "block";
        elements.signupForm.style.display = "none";
    } else {
        elements.loginForm.style.display = "none";
        elements.signupForm.style.display = "block";
    }
}

function showDashboard(user) {
    elements.landingPage.style.display = "none";
    elements.authContainer.style.display = "none";
    elements.dashboard.style.display = "block";
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => initMap(pos.coords.latitude, pos.coords.longitude),
            () => initMap(40.7128, -74.0060)
        );
    } else {
        initMap(40.7128, -74.0060);
    }
}