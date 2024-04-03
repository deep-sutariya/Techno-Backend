const express = require("express");
const router = express.Router();
const axios = require('axios');
const locationList = require("../model/locationList");

router.post("/addlocation", async (req, res) => {
    const fetchlocation = req.body;
    try{
        const data = new locationList(fetchlocation[0]);
        await data.save();
    }catch(e){
        console.log(e);
        res.status(500).send({message: "Location Not Added"})
    }
    res.status(200).send({message: "Location Added!"})
})

router.post("/getlocationlist", async (req, res) => {
    let data;
    try{
        data = await locationList.find({});
    }catch(e){
        console.log(e);
        res.status(500).send({message: "Location Data Not Fetched"})
    }
    res.status(200).send({data: data, message: "Location Data Fetched"})
})

router.post("/fetchlocationname", async (req, res) => {
    const {loc} = req.body
    let data = [];
    try {
        let lonlat = `${loc.lat},${loc.lon}`;
        data = await axios.get(`https://trueway-geocoding.p.rapidapi.com/ReverseGeocode?language=en&location=${lonlat}`, {
            headers: {
                'X-RapidAPI-Key': '1aecf3ac76mshe524bcc63f5c710p10f501jsn24c678f969cb',
                'X-RapidAPI-Host': 'trueway-geocoding.p.rapidapi.com'
            }
        })
    } catch (e) {
        console.log("ErrB==>",e);
    }
    res.send(data?.data?.results)
})

module.exports = router;