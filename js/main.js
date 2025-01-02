const valid_moods = ["stressed", "sad", "angry", "drained", "overwhelmed", "lonely", "indifferent", "content", "peaceful", "happy", "joyful", "grateful", "calm", "energized", "excited", "amazed"];

function getInputs() {
    const mood = document.getElementById('mood').value;
    const details = document.getElementById('details').value;
    const date = document.getElementById('date').value;
    return { mood, details, date };
}

function validate_inputs(mood, details, date) {
    return valid_moods.includes(mood) &&
        isValidDateFormat(date) &&
        typeof details === 'string' &&
        details.length < 500 &&
        new Date(date) <= new Date();
}

function isValidDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function displayErrors({ mood, details, date }) {
    const errors = [
        !valid_moods.includes(mood) ? `<p>${mood} is not a valid mood.</p>` : '',
        typeof details !== 'string' || details.length > 500 ? "<p>Details must be text and less than 500 characters.</p>" : '',
        !isValidDateFormat(date) ? "<p>Date must be YYYY-MM-DD.</p>" : new Date(date) > new Date() ? "<p>Date cannot be in the future.</p>" : ''
    ].join('');
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = errors;
    errorContainer.classList.toggle("w3-hide", !errors);
}

function saveMood(mood, details, date) {
    let xhr = new XMLHttpRequest();
    xhr.onerror = () => {
        let errorContainer = document.getElementById('error-container');
        errorContainer.innerText = "Could not save mood";
        errorContainer.classList.remove("w3-hide");
    };
    xhr.ontimeout = () => {
        let errorContainer = document.getElementById('error-container');
        errorContainer.innerText = "The request timed out. Please check your connection and try again. ";
        errorContainer.classList.remove("w3-hide");
    };
    xhr.onload = () => {
        let response = parseJsonHelper(xhr.responseText);
        if (xhr.status == 200 && response.success == true) {
            fetchMoods();
            resetForm();
        } else {
            let output = document.getElementById('error-container');
            document.getElementById('error-container').classList.remove("w3-hide");
            output.innerText = "Could not save mood";
        }
    };
    const body = { mood, details, date };
    let json = JSON.stringify(body);
    xhr.open('POST', 'backend.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(json);
}

function fetchMoods(category = 'all') {
    let xhr = new XMLHttpRequest();
    let errorContainer = document.getElementById('error-container');
    let outputContainer = document.getElementById('output');
    const handleError = (message) => {
        errorContainer.innerText = message;
        errorContainer.classList.remove("w3-hide");
    };
    xhr.onerror = () => handleError("Failed to load moods. Please try again.");
    xhr.ontimeout = () => handleError("The request timed out. Please check your connection and try again.");
    xhr.onload = () => {
        errorContainer.classList.add("w3-hide");
        outputContainer.innerHTML = "";
        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.success && response.moods) {
                let moods = response.moods;
                moods.sort((a, b) => new Date(b.date) - new Date(a.date));
                const formatDate = (dateString) => {
                    let date = new Date(dateString);
                    let day = String(date.getDate()).padStart(2, '0');
                    let month = String(date.getMonth() + 1).padStart(2, '0');
                    let year = date.getFullYear();
                    return `${day}.${month}.${year}`;
                };
                moods.forEach((item) => {
                    let moodEntry = document.createElement('div');
                    moodEntry.classList.add('w3-card', 'w3-margin', 'w3-padding');
                    moodEntry.innerHTML = `
                        <h3>Mood: ${item.mood}</h3>
                        <p><strong>Date:</strong> ${formatDate(item.date)}</p>
                        <p><strong>Details:</strong> ${item.details}</p>`;
                    outputContainer.appendChild(moodEntry);
                });
                if (response.currentMoodCategory) {
                    drawSmiley(response.currentMoodCategory);
                    
                    document.getElementById("currentMood").innerHTML = "Your Current Mood: " + response.currentMoodCategory;
                }
            } 
        } else {
            handleError("Failed to fetch moods.");
        }
    };
    let url = "backend.php";
    if (category !== 'all') {
        url += `?mood_category=${encodeURIComponent(category)}`;
    }
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
}

function resetForm() {
    const form = document.getElementById('moodForm');
    form.reset();
    const errorContainer = document.getElementById('error-container');
    errorContainer.classList.add("w3-hide");
    errorContainer.innerHTML = "";
}

document.getElementById('moodForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const mood_object = getInputs();
    const mood = mood_object.mood;
    const details = mood_object.details;
    const date = mood_object.date;
    document.getElementById('error-container').classList.add("w3-hide");
    if (validate_inputs(mood, details, date)) {
        saveMood(mood, details, date);
    } else {
        displayErrors(mood, details, date);
    }
});

function parseJsonHelper(text) {
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}
