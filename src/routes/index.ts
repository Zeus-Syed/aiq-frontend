import * as express from "express";
let router = express.Router();

var xlsx = require("node-xlsx");
const fs = require("fs");

const calculateNetgenerationPercentage = (netGeneration, total) => {
  let result = (netGeneration/total) * 100
  return result.toFixed(6);
}

router.route("/processexcel").get(async (req, res) => {
  try {
    var obj = xlsx.parse(__dirname + "/egrid2020_data.xlsx", {
      sheetStubs: true,
    });

    let finalGridObject: any = {};
    let finalGridArray: any = [];
    let finalStateArray: any = [];
    let totalNetGeneration: any = 0;

    let genArrayToProcess: any = [];
    let plantArrayToProcess: any = [];
    let stateArrayToProcess: any = [];

    genArrayToProcess = obj.filter((gridObject) => gridObject.name === "GEN20");
    genArrayToProcess = genArrayToProcess[0].data;

    plantArrayToProcess = obj.filter(
      (gridObject) => gridObject.name === "PLNT20"
    );
    plantArrayToProcess = plantArrayToProcess[0].data;

    stateArrayToProcess = obj.filter(
      (gridObject) => gridObject.name === "ST20"
    );
    stateArrayToProcess = stateArrayToProcess[0].data;

    genArrayToProcess.map((rowArray) => {
      if (rowArray.length > 13 && rowArray[12] && rowArray[12] !== 'Generator annual net generation (MWh)' && rowArray[12] !== 'GENNTAN') {
        totalNetGeneration = totalNetGeneration + parseFloat(rowArray[12]);
      }
      if (finalGridObject[rowArray[4]]) {
        if (rowArray.length > 13 && rowArray[12]) {
          finalGridObject[rowArray[4]].netGeneration =
            finalGridObject[rowArray[4]].netGeneration + rowArray[12];
        }
      } else {
        let plantObject: any = {};
        plantObject.name = rowArray[3];
        plantObject.plantState = rowArray[2];
        plantObject.facilityCode = rowArray[4];
        if (rowArray.length > 13 && rowArray[12]) {
          plantObject.netGeneration = rowArray[12];
        } else {
          plantObject.netGeneration = 0;
        }
        finalGridObject[rowArray[4]] = plantObject;
      }
    });

    plantArrayToProcess.map(async (rowArray) => {
      if (finalGridObject[rowArray[4]]) {
        finalGridObject[rowArray[4]].latitude = rowArray[19];
        finalGridObject[rowArray[4]].longitude = rowArray[20];
        if(finalGridObject[rowArray[4]].netGeneration > 0){
          let netGenerationPercentage = calculateNetgenerationPercentage(finalGridObject[rowArray[4]].netGeneration, Math.round(totalNetGeneration));
          finalGridObject[rowArray[4]].percentage = netGenerationPercentage
        }
        else{
          finalGridObject[rowArray[4]].percentage = 0;
        }
      }
    });

    stateArrayToProcess.map((rowArray) => { 
      finalStateArray.push(rowArray[1]) 
    });


    finalGridArray = Object.values(finalGridObject);
    finalGridArray.pop();
    finalGridArray.pop();
    finalStateArray.shift();
    finalStateArray.shift();
    var jsonContent = JSON.stringify({ stateData: finalStateArray, plantData: finalGridArray});
    console.log(jsonContent);

    fs.writeFile("output.json", jsonContent, "utf8", function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }

      console.log("JSON file has been saved.");
    });
  } catch (err) {}
});



router.route("/getPlantData").get(async (req, res) => {
  try {
    let rawdata = fs.readFileSync("output.json");
    let plantData = JSON.parse(rawdata);
    res
      .status(200)
      .send({
        data: plantData,
        message: "Plant data retrieved successfully!",
        success: true,
      });
  } catch (err) {}
});



export default router;
