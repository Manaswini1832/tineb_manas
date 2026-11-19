const express = require('express')
const app = express()
const fs = require('fs');

const swaggerDocs = require('./swagger.js');

const PORT = 5000

/**
 * @swagger
 * components:
 *   schemas:
 *     Representative:
 *       type: object
 *       properties:
 *         Sl.No.:
 *           type: string
 *           example: "505"
 *         Name:
 *           type: string
 *           example: "Com. Selvaraj V"
 *         Party:
 *           type: string
 *           example: "CPI"
 *         Constituency:
 *           type: string
 *           example: "Nagapattinam (SC)"
 *         State:
 *           type: string
 *           example: "Tamil Nadu"
 *         Status:
 *           type: string
 *           example: "SITTING"
 *         Lok Sabha Terms:
 *           type: array
 *           items:
 *             type: string
 *           example: ["18"]
 *         Phone:
 *           type: string
 *           nullable: true
 *           example: null
 *         Email:
 *           type: array
 *           items:
 *             type: string
 *             format: email
 *           example:
 *             - "v.selvarajcpi@gmail.com"
 *             - "v.selvarajcpi@mpls.sansad.in"
 */

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

/**
 * @swagger
 * /states:
 *   get:
 *     summary: Get all states
 *     description: Returns a list of unique states represented in the Lok Sabha
 *     tags:
 *       - States
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of states
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *             example:
 *               - Andhra Pradesh
 *               - Karnataka
 *               - Tamil Nadu
 */
app.get('/states', async(req, res) => {
    const data = await readJson()
    const states = [...new Set(data.map(entry => entry.State))]
    res.status(200).json(states)
})

/**
 * @swagger
 * /constituencies:
 *   get:
 *     summary: Get constituencies in a state
 *     description: Returns all constituencies belonging to the specified state
 *     tags:
 *       - Constituencies
 *     parameters:
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the state
 *         example: Karnataka
 *     responses:
 *       200:
 *         description: Successfully retrieved constituencies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Missing or invalid state parameter
 */
app.get('/constituencies', async (req, res) => {
    const state = req.query.state;
    const data = await readJson();

    if (state === "" || state === undefined) {
        //if no state, send 400 (according to doc)
        return res.status(400).send("Missing or invalid state parameter");
    }

    const constituencies = data
        .filter(entry => entry.State.toLowerCase() === state.toLowerCase())
        .map(entry => entry.Constituency);

    res.status(200).json(constituencies);
});



/**
 * @swagger
 * /representatives:
 *   get:
 *     summary: Get representatives
 *     description: Returns all representatives or filters them by state.
 *     tags:
 *       - Representatives
 *     parameters:
 *       - in: query
 *         name: state
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter representatives by state.
 *         example: Himachal Pradesh
 *     responses:
 *       200:
 *         description: Successfully retrieved representatives.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Representative'
 *             example:
 *               - Sl.No.: "52"
 *                 Name: Dr. Rajeev Bharadwaj
 *                 Party: BJP
 *                 Constituency: Kangra
 *                 State: Himachal Pradesh
 *                 Status: SITTING
 *                 Lok Sabha Terms: ["18"]
 *                 Phone: null
 *                 Email:
 *                   - rajeevbhardwaj223@gmail.com
 *                   - rajeevbhardwaj.mp@mpls.sansad.in
 *               - Sl.No.: "187"
 *                 Name: Shri Suresh Kumar Kashyap
 *                 Party: BJP
 *                 Constituency: Shimla (SC)
 *                 State: Himachal Pradesh
 *                 Status: SITTING
 *                 Lok Sabha Terms: ["17", "18"]
 *                 Phone: null
 *                 Email:
 *                   - sureshkashyapnhn@gmail.com
 *                   - suresh.kumar15@mpls.sansad.in
 *               - Sl.No.: "354"
 *                 Name: Ms Kangna Ranaut
 *                 Party: BJP
 *                 Constituency: Mandi
 *                 State: Himachal Pradesh
 *                 Status: SITTING
 *                 Lok Sabha Terms: ["18"]
 *                 Phone: null
 *                 Email:
 *                   - krmanager@gmail.com
 *                   - kangna.ranaut@mpls.sansad.in
 *               - Sl.No.: "488"
 *                 Name: Shri Anurag Singh Thakur
 *                 Party: BJP
 *                 Constituency: Hamirpur
 *                 State: Himachal Pradesh
 *                 Status: SITTING
 *                 Lok Sabha Terms: ["14", "15", "16", "17", "18"]
 *                 Phone: null
 *                 Email:
 *                   - hpcapresident@yahoo.com
 *                   - mphamirpur@gmail.com
 *                   - mosfinance@nic.in
 *                   - anuragthakur.mp@mpls.sansad.in
 *                   - anurags.thakur@mpls.sansad.in
 */
app.get('/representatives', async (req, res) => {
    const state = req.query.state;
    const data = await readJson();

    let representatives = data;

    if (state !== undefined) {
        representatives = data.filter(
            entry => entry.State.toLowerCase() === state.toLowerCase()
        );
    }

    representatives = representatives.map(entry => ({
        ...entry,

        //since lst and emails to be returned as arrays
        "Lok Sabha Terms": entry["Lok Sabha Terms"]
            .split(",")
            .map(term => term.trim()),

        "Phone" : entry.Phone === "-" ? null : entry.Phone,

        "Email": entry.Email
            .split(",")
            .map(email => email.trim())
    }));

    res.status(200).json(representatives);
});


/**
 * @swagger
 * /representatives/{id}:
 *   get:
 *     summary: Get representative by ID
 *     description: Returns representative details for the specified serial number
 *     tags:
 *       - Representatives
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the representative
 *         example: "100"
 *     responses:
 *       200:
 *         description: Successfully retrieved representative.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Representative'
 *             example:
 *               - Sl.No.: "100"
 *                 Name: Dr. Kakoli Ghosh Dastidar
 *                 Party: AITC
 *                 Constituency: Barasat
 *                 State: West Bengal
 *                 Status: SITTING
 *                 Lok Sabha Terms:
 *                   - "15"
 *                   - "16"
 *                   - "17"
 *                   - "18"
 *                 Phone: null
 *                 Email:
 *                   - kakoli.dastidar@mpls.sansad.in
 *       404:
 *         description: No representative found with the given ID
 */
app.get('/representatives/:id', async(req, res) => {
    const repID = req.params.id;
    const data = await readJson();

    if(repID === undefined){
        res.status(404).send("No representative found with the given ID")
    }

    let representatives = data
        .filter(entry => entry["Sl.No."] === repID)

    representatives = representatives.map(entry => ({
        ...entry,

        //since lst and emails to be returned as arrays
        "Lok Sabha Terms": entry["Lok Sabha Terms"]
            .split(",")
            .map(term => term.trim()),

        "Phone" : entry.Phone === "-" ? null : entry.Phone,

        "Email": entry.Email
            .split(",")
            .map(email => email.trim())
    }));

    res.status(200).json(representatives);
})


/**
 * @swagger
 * /counts:
 *   get:
 *     summary: Get representative counts by state
 *     description: Returns the total number of Lok Sabha representatives from each state
 *     tags:
 *       - Stats
 *     responses:
 *       200:
 *         description: Successfully retrieved state-wise representative counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *             example:
 *               Tamil Nadu: 39
 *               Chhattisgarh: 11
 *               Rajasthan: 25
 *               Uttar Pradesh: 80
 *               Jammu and Kashmir: 5
 *               West Bengal: 41
 *               Manipur: 2
 *               Bihar: 40
 *               Kerala: 20
 *               Telangana: 17
 *               Maharashtra: 48
 *               Punjab: 13
 */
app.get('/counts', async (req, res) => {
    const reps = await readJson();

    const countMap = new Map();
    for (const rep of reps) {
        countMap.set(rep.State, (countMap.get(rep.State) || 0) + 1);
    }

    res.status(200).json(Object.fromEntries(countMap));
});



swaggerDocs(app, PORT);

app.listen(PORT, () => {
    console.log("Hello World! Listening at " + PORT)
})