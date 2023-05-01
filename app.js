const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

const port = 3000;

const date = require(__dirname + "/date.js");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1:27017/tasksDB")
    .then(() => console.log("Connected!"))
    .catch((error) => {
        console.error("Failed to connect to mongoDB!");
    });

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the task!"]
    }
});


const Task = mongoose.model("Tasks", taskSchema);
// const tasks = [];
// const workTasks = [];



const multipleTasks = [{
        name: "task2"
    },
    {
        name: "task3"
    },
    {
        name: "task4"
    }
];





const today = new Date();
const currentDay = today.getDay();
let dayKind_ = "";
const day = date.getDayName();


app.get("/", function (req, res) {

    if (currentDay === 5) {
        dayKind_ = "Holiday";
    } else {
        dayKind_ = "work day";
    }
    // console.log(currentDay);
    Task.find()
        .then(function (tasks) {
            if (tasks.length === 0) {
                
                // If it was declared out of this function, when deleted mongoose won't be able to track it to save it; therefore, I declared it here!
                const task1 = new Task({
                    name: "task1: Web Dev course"
                });

                task1.save()
                    .then(() => console.log("task1 is added!"))
                    .catch((error) => console.error("Error in inserting task1!! => " + error));

                Task.insertMany(multipleTasks)
                    .then(() => console.log("Multiple tasks are added!"))
                    .catch((error) => console.error("Error in inserting multiple tasks!!"));

                res.redirect("/");
            } else {
                console.log("The Tasks Database is listed: ", tasks);
                res.render("list", {
                    dayKind: dayKind_,
                    listTitle: day,
                    addedTasks: tasks
                });
            };
        });
});

app.post("/", function (req, res) {
    // if(req.body.list === "Work"){
    //     workTasks.push(req.body.newTask);
    //     res.redirect("/work");
    // }
    // else{
    //     tasks.push(req.body.newTask);
    //     res.redirect("/");
    // }
    const newTaskName = req.body.newTask;
    const task = new Task({
        name: newTaskName
    });
    task.save();
    res.redirect("/");
});

app.post("/delete", function (req, res) {
    const taskID = req.body.checkTask;
    Task.findByIdAndDelete(taskID)
        .then(function (docs) {
            console.log("Task " + taskID + " is deleted!");
            res.redirect("/");
        })
        .catch((error) => console.error("Error in deleting task of id " + taskID + " !!"));
});


app.get("/work", function (req, res) {
    res.render("list", {
        dayKind: "work day",
        listTitle: "Work List",
        addedTasks: workTasks
    });
});


app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(port, function () {
    console.log("Server started on port " + port);
});