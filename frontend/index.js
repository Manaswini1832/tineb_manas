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

                    const repName = document.createElement("h1")
                    repName.textContent = `${rep.Name}`
                    
                    const repDetailsList = document.createElement("ul")
                    repDetailsList.innerHTML = `
                        <li>${rep.Party}</li>
                        <li>${rep.Constituency}</li>
                        <li>${rep.State}</li>
                        <li>${rep.Status}</li>
                        <li>${rep["Lok Sabha Terms"]}</li>
                        <li>${rep.Phone}</li>
                        <li>${rep.Email}</li>
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


//start
readJson({
    state : "Tamil Nadu",
    constituency : "Vellore"
});