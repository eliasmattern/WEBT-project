CREATE DATABASE IF NOT EXISTS MoodTracker;

USE MoodTracker;

CREATE TABLE moods (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    mood ENUM('stressed', 'sad', 'angry', 'drained', 'overwhelmed', 'lonely',
              'indifferent', 'content', 'peaceful',
              'happy', 'joyful', 'grateful', 'calm', 'energized', 'excited', 'amazed') NOT NULL,
    details VARCHAR(500) NULL,
    mood_category ENUM('unpleasant_mood', 'neutral_mood', 'positive_mood') NOT NULL,
    date DATE NOT NULL
);

CREATE INDEX idx_date ON moods (date);
