const connectDB = require('./db/db');
const express = require('express');
const cors = require('cors');
// import serverless from "serverless-http";
// import router from "./route/route";

const PORT = 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

connectDB();

// api.use('/.netlify/functions/', router);
app.use(require('./route/route'))

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

// export const handler = serverless(app);