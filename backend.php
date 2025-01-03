<?php
$unpleasant_moods = [
    "stressed",
    "sad",
    "angry",
    "drained",
    "overwhelmed",
    "lonely"
];

$neutral_moods = [
    "indifferent",
    "content",
    "peaceful",
];

$positive_moods = [
    "happy",
    "joyful",
    "grateful",
    "calm",
    "energized",
    "excited",
    "amazed"
];

function getDbConnection() {
    $conn = mysqli_connect("localhost", "root", "", "MoodTracker");
    if (!$conn) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "Failed to connect to database",
        ]);
        exit;
    }
    return $conn;
}

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

        $all_valid_moods = array_merge($unpleasant_moods, $neutral_moods, $positive_moods);
        if (!in_array($mood, $all_valid_moods)) {
            $errors .= "$mood is not a valid mood option.\n";
        }

        if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $date)) {
            $errors .= "Date must be in the format YYYY-MM-DD.\n";
        } else {
            $current_date = new DateTime();
            $provided_date = DateTime::createFromFormat('Y-m-d', $date);
        
            if ($provided_date > $current_date) {
                $errors .= "Date cannot be in the future.\n";
            }
        }
        $details = trim($details);
        if (!is_string($details)) {
            $errors .= "Details must be a string or empty.\n";
        }

        if (strlen($details) > 500) {
            $errors .= "Details can not be longer than 500 characters.\n";
        }

        if ($errors !== "") {
            http_response_code(400);
            echo json_encode(["errors" => $errors]);
            exit;
        }

        if (in_array($mood, $unpleasant_moods)) {
            $mood_category = "unpleasant_mood";
        } elseif (in_array($mood, $neutral_moods)) {
            $mood_category = "neutral_mood";
        } else {
            $mood_category = "positive_mood";
        }

        $conn = getDbConnection();

        $stmt = $conn->prepare("INSERT INTO moods (mood, details, mood_category, date) VALUES (?, ?, ?, ?)");

        $stmt->bind_param("ssss", $mood, $details, $mood_category, $date);

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "mood" => $mood,
                "details" => $details,
                "date" => $date
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => "Failed to save mood",
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid input. 'mood' and 'date' are required."]);
    }
} elseif ($method == 'GET') {
    $conn = getDbConnection();

    if (isset($_GET['mood_category'])) {
        $mood_category = $_GET['mood_category'];
        $valid_categories = ['unpleasant_mood', 'neutral_mood', 'positive_mood'];

        if (in_array($mood_category, $valid_categories)) {
            $stmt = $conn->prepare("SELECT * FROM moods WHERE mood_category = ?");
            $stmt->bind_param("s", $mood_category);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Category not found"]);
            exit;
        }
    } else {
        $stmt = $conn->prepare("SELECT * FROM moods");
    }

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $moods = $result->fetch_all(MYSQLI_ASSOC);
        $conn = getDbConnection();

        $newestStmt = $conn->prepare("SELECT * FROM moods ORDER BY date DESC LIMIT 1");
        if ($newestStmt->execute()) {
            $newestResult = $newestStmt->get_result();
            $newestMood = $newestResult->fetch_assoc();
            $currentMood = "";
            if (isset($newestMood) && isset($newestMood['mood_category'])) {
                setcookie("currentMoodCategory", $newestMood['mood_category'], time() + (86400 * 30), "/");
                $currentMood = $newestMood['mood_category'];
                if ($newestMood['mood_category'] == "unpleasant_mood") {
                    $currentMood = "unpleasant";
                } elseif ($newestMood['mood_category'] == "neutral_mood"){
                    $currentMood = "neutral";
                } elseif ($newestMood['mood_category'] == "positive_mood"){
                    $currentMood = "positive";
                }
            }

            echo json_encode([
                "success" => true,
                "moods" => $moods,
                "currentMoodCategory" => $currentMood 
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => "Failed to retrieve the newest mood"
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "Failed to retrieve moods"
        ]);
    }
} else {
    header("Location: /");
    exit;
}
