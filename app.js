const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded());

const authRoutes = require("./routes/auth");
const treeRoutes = require("./routes/trees");

app.use('/api/auth', authRoutes);
app.use('/api/trees', treeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
