//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect('mongodb+srv://Mayura:mayura123@cluster0.rddu7.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = { //defining the scheme
  name: String
};

const Item = mongoose.model('Item', itemsSchema); //creating model

const item1 = new Item({ //creating documents
  name: "Welcome to your do list!"
});

const item2 = new Item({ //creating documents
  name: "Hit the + button to add a new item"
});

const item3 = new Item({ //creating documents
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3]



const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

//insert to mongodb
app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) { //if theres none it will add default
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log("Successfully inserted default items to DB")
        }
      });
      res.redirect("/"); //after adding it will redirect to the route route again
    } else { //after that it will come to this else conditions
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  })
});


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })

        list.save();
        res.redirect("/" + customListName)
      } else {
        //show and existing listres
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  })
});



app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }
});


app.post("/delete", function(req, res) {
  const checkdItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Today"){
    Item.findByIdAndRemove(checkdItemId, function(err) {
      if (err) {
        console.log(err)
      } else {
        console.log("Deleted Successfully")
        res.redirect("/");
      }
    })

  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checkdItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});







app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
