
const valid_moods = [
    "stressed",
    "sad",
    "angry",
    "drained",
    "overwhelmed",
    "lonely",
    "indifferent",
    "content",
    "peaceful",
    "happy",
    "joyful",
    "grateful",
    "calm",
    "energized",
    "excited",
    "amazed"
];

document.getElementById('moodForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const mood_object = getInputs();
    const mood = mood_object.mood
    const details = mood_object.details
    const date = mood_object.date
    document.getElementById('error-container').classList.add("w3-hide");

    if (validate_inputs(mood, details, date)) {
        saveMood(mood, details, date); 
    } else {
        displayErrors(mood, details, date);
    }
});

document.getElementById('moodForm').addEventListener('input', () => {
    const mood_object = getInputs();
    const mood = mood_object.mood
    const details = mood_object.details
    const date = mood_object.date

    document.getElementById('submit-button').disabled  = !validate_inputs(mood, details, date);
});

function validate_inputs(mood, details, date) {
    return valid_moods.includes(mood) &&
       isValidDateFormat(date) &&
       typeof details === 'string' &&
       details.length < 500 &&
       new Date(date) <= new Date();
}

function isValidDateFormat(dateString) {

    const regex = /^\d{4}\-\d{2}\-\d{2}$/;

    if (!regex.test(dateString)) {
        return false;
    }

    const [year, month, day] = dateString.split('-').map(Number);

    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}


function getInputs() {
    const mood = document.getElementById('mood').value;
    const details = document.getElementById('details').value;
    const date = document.getElementById('date').value;

    return {mood, details, date}
}

function displayErrors(mood, details, date) {
    let moodError = '';
    let detailsError = '';
    let dateError = '';

    if (!valid_moods.includes(mood)) {
        moodError = `<p>${mood} is not a valid mood.</p>`;
    }

    if (typeof details !== 'string') {
        detailsError = "<p>Details must be text.</p>";
    } else if (details.length > 500) {
        detailsError = "<p>Details cannot be longer than 500 characters.</p>";
    }

    if (!isValidDateFormat(date)) {
        dateError = "<p>Date must be in the format YYYY-MM-DD.</p>";
    } else if (new Date(date) > new Date()) {
        dateError = "<p>Date cannot be in the future.</p>";
    }

    document.getElementById('error-container').innerHTML = `${moodError}${detailsError}${dateError}`;
    document.getElementById('error-container').classList.remove("w3-hide");
}


function saveMood(mood, details, date) {

    let xhr = new XMLHttpRequest();
    xhr.onerror = () => {
        let error = parseJsonHelper(xhr.responseText)
        let errorContainer = document.getElementById('error-container');
        errorContainer.innerText = error;
        };
    xhr.ontimeout = undefined;
    xhr.onload = () => {
        let response = parseJsonHelper(xhr.responseText);
        if (xhr.status == 200) {
            console.log(response);
        } else {
            let output = document.getElementById('error-container');
            document.getElementById('error-container').classList.remove("w3-hide");
            output.innerText = response.errors;
        }
    };

    const body = { mood, details, date };
    console.log(body);
    
    let json = JSON.stringify(body);

    xhr.open('POST', 'backend.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json'); 
    xhr.send(json);
}

function parseJsonHelper(text) {
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}