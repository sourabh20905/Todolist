//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sourabh:Test123@cluster0.fai7n.mongodb.net/todolistdb");
const itemSchema= {
  name:String
}

const Item=mongoose.model("item",itemSchema);
const item1= new Item({
  name:"welcome to todolist"
});
const item2=new Item({
  name:"press + to add item in todolist"
});
const item3 = new Item({
  name:"<-- click this"
});
const defaultItems=[item1,item2,item3];

//parameter list listSchema
const listSchema= {
  name: String,
  items:[itemSchema]
};

const List = mongoose.model("List",listSchema);



// read from data base








app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err) console.log(err);
        else console.log("susseccfully inserted");
      });
      res.redirect("/");
    }
    else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });




});
//express route parameter
app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;
  console.log(customListName);
  //mongoose method findOne()for not repeatation in listItems
  List.findOne({name:customListName},function(err,foundlist){
    if(!err) {
      if(!foundlist) {
        //creat new list
        const list= new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else {
        //show an existing list
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
      }
    }
    else console.log(err);
  })

})
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item = new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
      res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

//delete item by id
app.post("/delete",function(req,res){
  const checked=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checked,function(err){
      if(!err){
        console.log("susseccfully checked item is deleted");
        res.redirect("/");
      }
      });

  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checked}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});



app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port susseccfully");
});
