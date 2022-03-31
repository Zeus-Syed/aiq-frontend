import * as express from "express";
import { Plant } from "../interface";
let router = express.Router();

var xlsx = require("node-xlsx");
const fs = require("fs");

const calculateNetgenerationPercentage = (netGeneration: number, total: number) => {
  let result = (netGeneration / total) * 100
  return result.toFixed(6);
}

router.route("/processEgridExcel").get(async (req, res) => {
  try {
    var egridData: any[] = xlsx.parse(__dirname + "/egrid2020_data.xlsx", {
      sheetStubs: true,
    });

    let finalGridArray: Plant[] = [];
    let finalStateArray: string[] = [];
    let finalGridObject: any = {};
    let totalNetGeneration: number = 0;

    let genArrayToProcess: any[] = [];
    let plantArrayToProcess: any[] = [];
    let stateArrayToProcess: any[] = [];

    genArrayToProcess = egridData.filter((gridObject) => gridObject.name === "GEN20");
    genArrayToProcess = genArrayToProcess[0].data;

    plantArrayToProcess = egridData.filter(
      (gridObject) => gridObject.name === "PLNT20"
    );
    plantArrayToProcess = plantArrayToProcess[0].data;

    stateArrayToProcess = egridData.filter(
      (gridObject) => gridObject.name === "ST20"
    );
    stateArrayToProcess = stateArrayToProcess[0].data;

    genArrayToProcess.map((rowArray: any) => {
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

    plantArrayToProcess.map(async (rowArray: any) => {
      if (finalGridObject[rowArray[4]]) {
        finalGridObject[rowArray[4]].latitude = rowArray[19];
        finalGridObject[rowArray[4]].longitude = rowArray[20];
        if (finalGridObject[rowArray[4]].netGeneration > 0) {
          let netGenerationPercentage = calculateNetgenerationPercentage(finalGridObject[rowArray[4]].netGeneration, Math.round(totalNetGeneration));
          finalGridObject[rowArray[4]].percentage = netGenerationPercentage
        }
        else {
          finalGridObject[rowArray[4]].percentage = 0;
        }
      }
    });

    stateArrayToProcess.map((rowArray: any) => {
      finalStateArray.push(rowArray[1])
    });


    finalGridArray = Object.values(finalGridObject);
    finalGridArray.pop();
    finalGridArray.pop();
    finalStateArray.shift();
    finalStateArray.shift();
    var jsonContent = JSON.stringify({ stateData: finalStateArray, plantData: finalGridArray });

    fs.writeFile("output.json", jsonContent, "utf8", function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }

      console.log("JSON file has been saved.");
    });
  } catch (err) { }
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
  } catch (err) { }
});



export default router;
