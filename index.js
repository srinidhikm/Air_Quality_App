import 'dotenv/config'
import express from "express"
import axios from "axios"
import bodyParser from "body-parser";

const port = 3000;
const app = express();

app.use(express.static("public"));

const apiKey = process.env.API_KEY;

function logger(req, res, next)
{
    console.log("Method -> "+req.method);
    console.log("URL -> "+req.url);
    next();

}
app.use(logger);

app.use(bodyParser.urlencoded({extended:true}))

let content;
let errorMessage;

app.get("/", (req, res)=>
{
    res.render("index.ejs", {content: JSON.stringify(content),
    errorMessage: errorMessage})
    errorMessage="";
})


app.post("/submit", async (req, res)=>
{

    const config ={
        headers:
        {
            "X-Api-Key": apiKey,
        }
    }

    try
    {
        const result = await axios.get(`https://api.api-ninjas.com/v1/airquality?city=${req.body["location"]}`, config)
        console.log(result.data);

        const aqi = result.data.overall_aqi;
        let severity;
        let level;
        
        if (aqi >= 0 && aqi <= 50) {
            severity = 'Good';
            level = 0;
        } else if (aqi >= 51 && aqi <= 100) {
            severity = 'Moderate';
            level = 1;
        } else if (aqi >= 101 && aqi <= 150) {
            severity = 'Bit Unhealthy';
            level = 2
        } else if (aqi >= 151 && aqi <= 200) {
            severity = 'Unhealthy';
            level = 3;
        } else if (aqi >= 201 && aqi <= 300) {
            severity = 'Very Unhealthy';
            level = 4;
        } else {
            severity = 'Hazardous';
            level = 5;
        }

        content = {
            location: req.body["location"].toUpperCase(),
            aqi: aqi,
            level: level,
            severity: severity,
            co: result.data.CO.concentration,
            no2: result.data.NO2.concentration,
            o3: result.data.O3.concentration,
            so2: result.data.SO2.concentration,
            pm25: result.data["PM2.5"].concentration,
            pm10:result.data.PM10.concentration
        }

    }
    catch(error)
    {
        console.log(error.message);
        errorMessage="Could not find air quality of the entered location";
    }

    res.redirect("/")
})

app.listen(port, ()=>
{
    console.log(`Listening at port ${port}`)
})

