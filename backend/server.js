require('dotenv').config();
const app = require('./src/app');
const connectToDb = require('./src/db/db');

const PORT = process.env.PORT || 3000;

// Connect to database
connectToDb();

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
