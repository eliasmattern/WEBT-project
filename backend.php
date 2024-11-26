<?php
$valid_moods = [
    "stressed", "sad", "angry", "drained", "overwhelmed", "lonely", 
    "indifferent", "content", "peaceful", 
    "happy", "joyful", "grateful", "calm", "energized", "excited", "amazed" 
];

$body = file_get_contents("php://input");
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $mood_object = json_decode($body, true);
    
    if ($mood_object !== null && isset($mood_object['mood']) && isset($mood_object['date'])) {
        $errors = "";

        $mood = $mood_object['mood'];
        $details = isset($mood_object['details']) ? $mood_object['details'] : ""; 
        $date = $mood_object['date'];

        if (!is_string($mood) || strlen($mood) <= 1) {
            $errors .= "Mood must be a string longer than 1 character.\n";
        }
        if (!in_array($mood, $valid_moods)) {
            $errors .= "$mood is not a valid option.\n";
        }

        if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $date)) {
            $errors .= "Date must be in the format YYYY-MM-DD.\n";
        }

        if (!is_string($details)) {
            $errors .= "Details must be a string or empty.\n";
        }

        if ($errors !== "") {
            http_response_code(400); 
            echo json_encode(["errors" => $errors]);
            exit;
        }

        echo json_encode([
            "success" => true,
            "mood" => $mood,
            "details" => $details,
            "date" => $date
        ]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input. 'mood' and 'date' are required."]);
    }
} else {
}
