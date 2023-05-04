const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

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

const Task = mongoose.model("Task", taskSchema);


const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the list name!"]
    },
    tasks: [taskSchema]
});

const List = mongoose.model("List", listSchema);
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





const today_ = new Date();
const currentDay = today_.getDay();
let dayKind_ = "";
const day = date.getDayName();
const dayArray = day.split(",");
const today = dayArray[0]+ ",";

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
    const listName = req.body.list;

    const task = new Task({
        name: newTaskName
    });

    if(listName === today){
        task.save();
        res.redirect("/");
    }
    else{
        List.findOne({
            name: listName
        })
        .then(function (foundList) {
            foundList.tasks.push(task);
            foundList.save();
            res.redirect("/"+ listName);
        })
        .catch((error)=> console.error("Failed to find list!"));
    }
});


app.post("/delete", function (req, res) {
    const taskID = req.body.checkTask;
    const listName = req.body.listName;

    if(listName === today){
        Task.findByIdAndDelete(taskID)
            .then(function (docs) {
                console.log("Task " + taskID + " is deleted!");
                res.redirect("/");
                })
            .catch((error) => console.error("Error in deleting task of id " + taskID + " !!"));
            }
    else{
        List.findOneAndUpdate({name: listName},
            {$pull: {tasks: {_id: taskID}}})
            .then( function(){
                console.log("Task " + taskID + " is deleted!");
                res.redirect("/"+ listName);
            });
    }
});



app.get("/:listName", function (req, res) {
    const listName = _.capitalize(req.params.listName);

    List.findOne({
            name: listName
        })
        .then(function (foundList) {
            if(foundList){
                //Show the existing list
                res.render("list", {
                    dayKind: dayKind_,
                    listTitle: foundList.name,
                    addedTasks: foundList.tasks
                });
            }
            else {
                    console.log(listName + " is not found!!");
                    // Create the list:
                    const list = new List({
                        name: listName,
                        tasks: multipleTasks
                    });
                    list.save()
                        .then(function () {
                            console.log("list " + listName + " is created !");
                           
                            res.redirect("/" + listName);

                        });
                    // .catch((error)=> console.error("Error in creating "+ listName +" list!! => "+ error));
                    // .then(()=> res.redirect("/"+ listName));
                    // res.redirect("/"+ listName);
            };
        });

    // const list = new List({
    //     name: listName,
    //     tasks: tasks
    // });
    // list.save()
    // .then(function(){
    //     console.log("list "+listName+ " is created !");
    //     res.render("list", {
    //         dayKind: dayKind_,
    //         listTitle: listName.toUpperCase(),
    //         addedTasks: tasks
    //     });
    //     })
    //     .catch((err)=> console.error("Error in creating list "+listName+" => "+ err));
});


// app.get("/work", function (req, res) {
//     res.render("list", {
//         dayKind: "work day",
//         listTitle: "Work List",
//         addedTasks: workTasks
//     });
// });


// app.get("/about", function (req, res) {
//     res.render("about");
// });

app.listen(port, function () {
    console.log("Server started on port " + port);
});