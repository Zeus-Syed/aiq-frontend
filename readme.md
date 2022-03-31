command to run node app:

    - npm start

      Node app will run in http://localhost:4000

APIs

GET -- '/get/processEgridExcel'

    - Processes the eGrid2020_data.xlsx file data and create a new json file with new format to send to client. The json file's format will be easily for client to process in UI.

    - In production, we can run a cron job to process the grid file and create new json file at scheduled time. So that client can request the json data from '/get/getPlantData' endpoint.

    - For development purpose, we can hit this endpoint so that the file is available for '/get/getPlantData' endpoint.

GET -- '/get/getPlantData'

    - fetch data from json file and return to client.
    - Response to client will be fast as data will be taken from file.
