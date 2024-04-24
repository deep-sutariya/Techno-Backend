const express = require("express");
const router = express.Router();
const axios = require('axios');
const locationList = require("../model/locationList");

router.get("/", (req,res)=>{
    res.send("Ok");
})

router.post("/addlocation", async (req, res) => {
    console.log("addlocation");
    const fetchlocation = req.body;
    console.log('====================================');
    console.log(fetchlocation[0]);
    console.log('====================================');
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
    let data = [];
    try {
        let lonlat = `${loc.lat},${loc.lon}`;
        data = await axios.get(`https://trueway-geocoding.p.rapidapi.com/ReverseGeocode?language=en&location=${lonlat}`, {
            headers: {
                'X-RapidAPI-Key': '0882d6a9admshd1be93ee039f1e3p1b9cd4jsn9fa85fdebd00',
                // 'X-RapidAPI-Key': '1aecf3ac76mshe524bcc63f5c710p10f501jsn24c678f969cb',
                'X-RapidAPI-Host': 'trueway-geocoding.p.rapidapi.com'
            }
        })
    } catch (e) {
        console.log("Err Fetching location in short time");
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
        console.log("Err Fetching location in short time");
        res.status(400).send(data);
    }
    res.status(200).send(data?.data);
})

router.post("/addtask", async (req, res) => {
    try {
        const { id, task } = req.body;
        const location = await locationList.findByIdAndUpdate({_id:id}, { $push: { tasks: task } }, { new: true });

        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        res.status(200).json({ message: "Task added successfully", location });
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/updatetask", async (req, res) => {
    const { id, taskId, updatedTask } = req.body;
    try {
        const location = await locationList.findByIdAndUpdate(
            id,
            { $set: { "tasks.$[task]": updatedTask } },
            { arrayFilters: [{ "task._id": taskId }], new: true }
        );

        if (!location) {
            return res.status(404).send("Location not found");
        }

        res.status(200).json(location);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).send("Error updating task");
    }
});


router.post("/deletetask", async (req, res) => {
    try {
        const { id, taskId } = req.body;
        const location = await locationList.findByIdAndUpdate({_id:id}, { $pull: { tasks: { _id: taskId } } }, { new: true });

        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        res.status(200).json({ message: "Task deleted successfully", location });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.post("/sendnotification", async (req, res) => {
    console.log("sendnotification");
    const { title, tasks, id, token } = req.body;
    console.log("Token->",token);
    try {
        const data = await locationList.findById(id);
        if (data) {
            const currentTime = new Date().getTime();
            const currentTimeObj = new Date(currentTime);
            const fifteenMinutesAgo = new Date(currentTimeObj.getTime() - 5 * 60 * 1000);

            if (!data.lastNotificationSentAt || data.lastNotificationSentAt < fifteenMinutesAgo) {
                const message = {
                    to: token,
                    sound: "default",
                    title: title,
                    body: tasks?.length>0 ? tasks : "No Tasks"
                };

                let ack;
                try {
                    const timeout = 10000;
                    const axiosConfig = {
                        headers: {
                            host: "exp.host",
                            accept: "application/json",
                            "accept-encoding": "gzip, deflate",
                            "content-type": "application/json"
                        },
                        timeout: timeout
                    };
                    ack = await axios.post("https://exp.host/--/api/v2/push/send", JSON.stringify(message), axiosConfig);
                } catch (error) {
                    console.log("Nested post request error:", error);
                    res.status(500).send("Error sending notification.");
                    return;
                }

                if (ack.data.data.status === "ok") {
                    console.log(currentTime);
                    await locationList.findByIdAndUpdate(id, { lastNotificationSentAt: currentTime });
                }
                res.status(200).send(ack.data);
            } else {
                res.status(400).send("Notification already sent within the last 30 seconds.");
            }
        } else {
            res.status(404).send("Location not found.");
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal server error.");
    }
});


module.exports = router;