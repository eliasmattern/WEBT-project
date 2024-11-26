document.getElementById('moodForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const [mood, details, date] = getInputs();
    document.getElementById('error-container').classList.add("w3-hide");

    if (validate_inputs(mood, details, date)) {
        saveMood(mood, details, date); 
    } else {
        displayErrors(mood, details, date);
    }
});

document.getElementById('moodForm').addEventListener('input', () => {
    const [mood, details, date] = getInputs()

    document.getElementById('submit-button').disabled  = !validate_inputs(mood, details, date);
});

function validate_inputs(mood, details, date) {
    return mood.length > 1 && isValidDateFormat(date) && typeof details == 'string'

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

    return [mood, details, date]
}

function displayErrors(mood, details, date) {
    let moodError = ''
    let detailsError = ''
    let dateError = ''
    if (mood.length < 1) {
        moodError = "<p>moodError</p>"
    }

    if (!typeof details == 'string') {
        detailsError = "<p>details error</p>"
    }
    if (!isValidDateFormat(date)) {
        dateError = "<p>date Error</p>"
    }

    document.getElementById('error-container').innerHTML = `${moodError}<br>${detailsError}<br>${dateError}`;
    document.getElementById('error-container').classList.remove("w3-hide");

}

function saveMood(mood, details, date) {
    let xhr = new XMLHttpRequest();
    xhr.onerror = () => {
        let error = parseJsonHelper(xhr.responseText)
        let output = document.getElementById('output');
        output.innerText = error;
        };
    xhr.ontimeout = undefined;
    xhr.onload = () => {
        let response = parseJsonHelper(xhr.responseText);
        if (xhr.status == 200) {
            console.log(response);
        } else {
            let output = document.getElementById('output');
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