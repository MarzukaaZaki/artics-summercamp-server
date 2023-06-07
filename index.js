const express = require('express');

const app = express();

// middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());


const port = process.env.PORT || 5000;

app.get('/', (req, res)=>{
    res.send('Artics Summer Camp Server is running now!')
})

app.listen(port, ()=>{
    console.log(`Artics Summer Camp Server is running on port ${port}`);
})