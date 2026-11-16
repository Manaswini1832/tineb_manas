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

app.get('/constituencies', async (req, res) => {
    const state = req.query.state;
    const data = await readJson();

    if (state === undefined) {
        const constituencies = data.map(entry => entry.Constituency);
        return res.status(200).send(constituencies);
    }

    const constituencies = data
        .filter(entry => entry.State.toLowerCase() === state.toLowerCase())
        .map(entry => entry.Constituency);

    res.status(200).send(constituencies);
});

app.get('/representatives', async (req, res) => {
    const state = req.query.state;
    const data = await readJson();

    if (state === undefined) {
        res.status(200).send(data)
    }

    const representatives = data
        .filter(entry => entry.State.toLowerCase() === state.toLowerCase())

    res.status(200).send(representatives);
});

app.get('/representatives/:id', async(req, res) => {
    const repID = req.params.id;
    const data = await readJson();

    if(repID === undefined){
        res.status(404).send("No such representative")
    }

    const representatives = data
        .filter(entry => entry["Sl.No."] === repID)

    res.status(200).send(representatives);
})

app.listen(PORT, () => {
    console.log("Hello World! Listening at " + PORT)
})