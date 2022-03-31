import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as http from "http";

import { dbConnect } from './../db/index';
import route from './routes/index';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("static"));

dbConnect();



let server = http.createServer(app);

server.listen(4000, () => {
  console.log("🚀 Server ready at", 4000);
});


app.get("/ok", (req, res) => {
    res.send("Yes WORKING now");
  });

app.use("/get", route); 