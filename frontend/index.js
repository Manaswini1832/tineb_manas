async function readJson(filter) {
    if(filter === undefined) return //if no rep filter return empty array
    /*
    filter = {
        state
        constituency
    }
    */

    try {
        const assessmentData = await fetch('./parsed_assessment_data.json');
        const assessmentJson = await assessmentData.json();

        const container = document.getElementById('members');
        container.innerHTML = ""

        assessmentJson.forEach(rep => {
            if(rep.State === filter.state){
                if(filter.constituency === "" || rep.Constituency === filter.constituency){
                    const div = document.createElement('div');
                    div.className = "representative-card";

                    const repName = document.createElement("h3")
                    repName.textContent = `${rep.Name}`

                    const emailArray = rep.Email.split(",").map(e => e.trim());
                    const emailHTML = emailArray.map(email =>
                        `<a href="mailto:${email}">${email}</a>
                         <button onclick="navigator.clipboard.writeText('${email}').then(() => {
                            this.textContent = 'Copied!';
                            setTimeout(() => this.textContent = 'Copy', 1500);
                        })" class = "copyBtn">Copy</button>
                        </p>`
                    ).join("");
                    
                    const repDetailsList = document.createElement("div")
                    repDetailsList.innerHTML = `
                        <p><strong>Party</strong> : ${rep.Party}</p>
                        <p><strong>Constituency</strong> : ${rep.Constituency}</p>
                        <p><strong>State</strong> : ${rep.State}</p>
                        <p><strong>Status</strong> : ${rep.Status}</p>
                        <p><strong>Lok Sabha Terms</strong> : ${rep["Lok Sabha Terms"]}</p>
                        <p><strong>Phone</strong> : ${rep.Phone === '-' ? "Unavailable" : rep.Phone}</p>
                        <p><strong>Emails</strong> : </p>
                        ${emailHTML}
                    `;


                
                    div.appendChild(repName)
                    div.appendChild(repDetailsList)

                    container.appendChild(div);
                }
            }
        });

    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}


//get all states and constituencies to populate frontend form selection
async function getStates() {
    try {
        const assessmentData = await fetch('./parsed_assessment_data.json');
        const assessmentJson = await assessmentData.json();

        const selectElement = document.getElementById('stateSelect');

        const states = [...new Set(assessmentJson.map(rep => rep.State))];

        states.forEach(state => {
            const stateOption = new Option(state, state);
            selectElement.add(stateOption);
        });

    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}

async function getConstituencies(state) {
    try {
        const assessmentData = await fetch('./parsed_assessment_data.json');
        const assessmentJson = await assessmentData.json();

        const selectElement = document.getElementById('constituencySelect');
        selectElement.innerHTML = ""

        const constituencies = [...new Set(assessmentJson.map(rep => {
            if(rep.State === state){
                return rep.Constituency
            }
        }))];

        constituencies.forEach(constituency => {
            const constituencyOption = new Option(constituency, constituency);
            selectElement.add(constituencyOption);
        });

    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}

function searchRepresentative() {
    const state = document.getElementById('stateSelect').value;
    const constituency = document.getElementById('constituencySelect').value;

    readJson({ state, constituency });
}


//start
getStates()

const stateSelect = document.getElementById('stateSelect');
const constituencySelect = document.getElementById('constituencySelect');

stateSelect.addEventListener('change', () => {
    if (stateSelect.value !== "") {
        constituencySelect.disabled = false;
        getConstituencies(stateSelect.value)
    } else {
        constituencySelect.disabled = true;
    }
});