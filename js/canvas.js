function drawSmiley(mood) {
    const canvas = document.getElementById("smileyCanvas");
    const ctx = canvas.getContext("2d");

    // face fill
    ctx.beginPath();
    ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.stroke();

    // left eye
    ctx.beginPath();
    ctx.arc(110, 120, 10, 0, Math.PI * 2, true);
    ctx.fillStyle = "black";
    ctx.fill();

    // right eye
    ctx.beginPath();
    ctx.arc(190, 120, 10, 0, Math.PI * 2, true);
    ctx.fillStyle = "black";
    ctx.fill();

    // Mouth
    if (mood == "positive_mood") {
        ctx.beginPath();
        ctx.arc(150, 150, 60, 0.2 * Math.PI, 0.8 * Math.PI, false);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        ctx.stroke();
    } else if (mood == "unpleasant_mood") {
        ctx.beginPath();
        ctx.arc(150, 220, 30, 0, Math.PI, true);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        ctx.stroke();
    } else if (mood == "neutral_mood") {
        ctx.beginPath();
        ctx.moveTo(110, 190);
        ctx.lineTo(190, 190);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    // Nose
    ctx.beginPath();
    ctx.arc(150, 160, 8, 0, Math.PI * 2, true);
    ctx.fillStyle = "black";
    ctx.fill();
}
46