const express = require("express");
const router = express.Router();
const axios = require('axios');
const locationList = require("../model/locationList");

router.post("/addlocation", async (req, res) => {
    console.log("addlocation");
    const fetchlocation = req.body;
    try {
        const data = new locationList(fetchlocation[0]);
        await data.save();
    } catch (e) {
        console.log(e);
        res.status(500).send({ message: "Location Not Added" })
    }
    res.status(200).send({ message: "Location Added!" })
})

router.post("/deletelocation", async (req, res) => {
    console.log("deletelocation");
    const { _id } = req.body;
    try {
        const check = await locationList.findById(_id);
        if (check) {
            const data = await locationList.findOneAndDelete(
                { _id: _id },
            );
            if (data) res.status(200).send({ data: data, message: "Location Removed!" });
            else res.status(500).send({ message: "Location Not Removed!" });
        } else {
            res.status(500).send({ data: check, message: "Location Not Found!" });
        }
    } catch (err) {
        console.log(err);
    }
})

router.post("/getlocationlist", async (req, res) => {
    console.log("getlocationlist");
    let data;
    try {
        data = await locationList.find({});
    } catch (e) {
        console.log(e);
        res.status(500).send({ message: "Location Data Not Fetched" })
    }
    res.status(200).send({ data: data, message: "Location Data Fetched" })
})

router.post("/fetchlocationname", async (req, res) => {
    const { loc } = req.body
    console.log(loc);
    let data = [];
    try {
        let lonlat = `${loc.lat},${loc.lon}`;
        data = await axios.get(`https://trueway-geocoding.p.rapidapi.com/ReverseGeocode?language=en&location=${lonlat}`, {
            headers: {
                'X-RapidAPI-Key': '0882d6a9admshd1be93ee039f1e3p1b9cd4jsn9fa85fdebd00',
                'X-RapidAPI-Host': 'trueway-geocoding.p.rapidapi.com'
            }
        })
    } catch (e) {
        console.log("ErrB==>", e);
    }
    res.status(200).send(data?.data?.results)
})

router.post("/fetchlocation", async (req, res) => {
    console.log("fetchlocation");
    const { location } = req.body
    let data = [];
    try {
        data = await axios.get(`https://trueway-geocoding.p.rapidapi.com/Geocode?language=en&address=${location}`, {
            headers: {
                'X-RapidAPI-Key': '0882d6a9admshd1be93ee039f1e3p1b9cd4jsn9fa85fdebd00',
                'X-RapidAPI-Host': 'trueway-geocoding.p.rapidapi.com'
            }
        })
    } catch (e) {
        console.log("ErrB==>", e);
    }
    res.status(200).send(data?.data);
})

router.post("/sendnotification", async (req, res) => {
    const { title, body } = req.body
    console.log(title);

    const message = {
        to: "ExponentPushToken[W_gxF9Ck_o3MsVwTdzB0uY]",
        sound: "default",
        title: title,
        body: body
    }
    let ack;
    try {
        ack = await axios.post("https://exp.host/--/api/v2/push/send", JSON.stringify(message), {
            headers: {
                host: "exp.host",
                accept: "application/json",
                "accept-encoding": "gzip, deflate",
                "content-type": "application/json"
            }
        })
        
    } catch (e) {
        console.log("ErrB==>", e);
    }
    res.status(200).send(ack?.data);

})

// router.post("/sendnotification", async (req, res) => {
//     const { title, body, id } = req.body
//     const data = await locationList.findById(id);

//     if (data) {
//         const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
//         const currentTimeObj = new Date(currentTime);
//         const fifteenMinutesAgo = new Date(currentTimeObj.getTime() - 10 * 1000); // 0.5 minutes ago

//         console.log(data?.lastNotificationSentAt < fifteenMinutesAgo);

//         if (data?.lastNotificationSentAt < fifteenMinutesAgo) {

//             const message = {
//                 to: "ExponentPushToken[W_gxF9Ck_o3MsVwTdzB0uY]",
//                 sound: "default",
//                 title: title,
//                 body: body
//             }
//             let ack;
//             try {
//                 ack = await axios.post("https://exp.host/--/api/v2/push/send", JSON.stringify(message), {
//                     headers: {
//                         host: "exp.host",
//                         accept: "application/json",
//                         "accept-encoding": "gzip, deflate",
//                         "content-type": "application/json"
//                     }
//                 })
//                 if(ack?.data?.data?.status === "ok"){
//                     data.lastNotificationSentAt = currentTime;
//                     await data.save();
//                 }
//             } catch (e) {
//                 console.log("ErrB==>", e);
//             }
//             res.status(200).send(ack?.data);
//         }
//     }else{
//         res.status(400).send("Message Not Sent");
//     }
// })

module.exports = router;