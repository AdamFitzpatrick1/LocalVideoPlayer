const express = require("express");
const app = express();
const fs = require("fs");

const videoPath = "example.mp4";

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/video", function(req, res) {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range)
        res.status(400).send("Requires Range header");

    // get video stats (about 61MB)
    const videoSize = fs.statSync(videoPath).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);
});

app.get("/download", (req, res) => {
    res.download(`${__dirname}/${videoPath}`);
})

app.listen(8000, function() {
    console.log("\n");
    console.log("-----------------------------------------");
    console.log("Welcome to the Node.js Local Video Player");
    console.log("-----------------------------------------");
    console.log("\n");
    console.log("Listening on port 8000!");
    console.log("Navigate to localhost:8000 in your browser to view the page");
    console.log("If you wish to view the video on a different device, use the IPv4 address of the local computer and append :8000 to the end");
});