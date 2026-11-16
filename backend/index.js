const express = require('express')
const app = express()
const fs = require('fs');

const PORT = 5000

async function readJson(){
    try {
        const assessmentData = await fs.promises.readFile('./parsed_assessment_data.json', 'UTF-8')
        const assessmentJson = JSON.parse(assessmentData)
        return assessmentJson
    } catch (err) {
        console.log('Error parsing JSON:', err);
        return []
    }
}

app.get('/states', async(req, res) => {
    const data = await readJson()
    const states = [...new Set(data.map(entry => entry.State))]
    res.status(200).send(states)
})

app.listen(PORT, () => {
    console.log("Hello World! Listening at " + PORT)
})