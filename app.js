
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const port = 3000;

const date = require( __dirname + "/date.js");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const tasks = [];
const workTasks = [];

app.get("/", function(req, res){
    
    const today = new Date();
    const currentDay = today.getDay();
    let dayKind_ = "";    
    const day = date.getDayName();

    if (currentDay === 5){
        dayKind_ = "Holiday";
    }
    else{
        dayKind_ = "work day";
    }
    // console.log(currentDay);
    res.render("list", {dayKind: dayKind_, listTitle: day, addedTasks: tasks});
});

app.post("/", function(req, res){
    if(req.body.list === "Work"){
        workTasks.push(req.body.newTask);
        res.redirect("/work");
    }
    else{
        tasks.push(req.body.newTask);
        res.redirect("/");
    }
});


app.get("/work", function(req, res){
    res.render("list", {dayKind: "work day", listTitle: "Work List", addedTasks: workTasks});
});


app.get("/about", function(req, res){
    res.render("about");
});

app.listen(port, function(){
    console.log("Server started on port "+ port);
});