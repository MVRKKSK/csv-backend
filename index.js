const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
var corsOptions = {
    origin: "*",
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.send("hello boi");
});

app.post("/", async(req, res) => {
    const { selectedHeaders, csvData, sheeturl } = req.body;
    // console.log(credentials)
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "./credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });
        const spreadsheetId = sheeturl;
        const selectedData = csvData.map((row) =>
            selectedHeaders.map((header) => row[header])
        );
        googleSheets.spreadsheets.values
            .append({
                auth,
                spreadsheetId,
                range: "Sheet1",
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: selectedData,
                },
            })
            .then((response) => {
                console.log("Data appended successfully", response.status);
                res.send("Successfully submitted! Thank you!");
            })
            .catch((err) => {
                console.error("Error appending data:", err);
                res.status(500).send("Error submitting request: " + err.message);
            });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send("Error submitting request: " + error.message);
    }
});

app.listen(process.env.PORT || 8000, (req, res) => console.log("running on 8000"));