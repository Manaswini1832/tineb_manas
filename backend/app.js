const fs = require("fs");

async function readJson(){
    try{
        const assessmentData = fs.readFile("./parsed_assessment_data.json", "utf8")
        const assessmentJson = JSON.parse(assessmentData)
        return assessmentJson
    }catch(err){
        throw err
    }
}