const express = require ("express");
const application = express();
const cors = require("cors");
const port = 3000;
const mysql = require("mysql2");

let db = mysql.createConnection({
    
    host: "localhost",
    user: "root",
    password: "",
    database: "arcane_algo",
    port: 3306
});



application.use(cors({
    origin:['http://localhost:5500', 'http://127.0.0.1:5500'] ,
    methods:['GET','POST'],
    credentials: true
}))
application.use("/",express.static("websiteDirectory"));
application.use(express.urlencoded({extended:false}));
application.use(express.json());

application.post("/dp", (req,res)=>{

    console.log("Recived date:", req.body);

    const firstName = req.body.firstName || '';
    const lastName = req.body.lastName || '';
    const emailAddress = req.body.emailAddress || '';
    const phoneNumber = req.body.phoneNumber || '';
    const scenarios = req.body.scenarios || '';
    const sportTypes = req.body.sportTypes || '';
    const levelRate = req.body.levelRate || '';
    const comments = req.body.comments || '';


    let message={};

//checking the data

    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/ ;
    let phonePattern=/^[0-9]{10}$/;
    let namePattern=/^[a-zA-Z\-'\s]{2,}$/;

    let validName = (firstName.match(namePattern)) &&  (lastName.match(namePattern));
    let validEmail =  emailAddress.match(emailPattern);
    let validPhone =  phoneNumber.match(phonePattern);
    let validRating = levelRate != null;

    if(validName && validEmail && validPhone && validRating){
        message ={status:true, err:""};
        addUserOpinion(firstName,lastName,emailAddress,phoneNumber,scenarios,sportTypes,levelRate,comments);

    }else{
        message ={
            status:false,
            err:"Error!!! Please provide real data."};

    }
    res.json(message);



});


function addUserOpinion(firstName,lastName,emailAddress,phoneNumber,scenarios,sportTypes,levelRate,comments){

   
    db.connect((err) => {
        if (err) {
            console.error("Connection Error:", err);
            return;
        }
    
        const sql = `INSERT INTO player (firstName, lastName, emailAddress, phoneNumber, scenarios, sportTypes, levelRate, comments)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
        db.query(sql, [firstName, lastName, emailAddress, phoneNumber, scenarios, sportTypes, levelRate, comments], (error, result) => {
            if (error) {
                console.error("Query Error:", error);
            } else {
                console.log("Data has been inserted successfully.");
            }
            db.end();
        });
    });
}




application.listen(port, ()=>{
    console.log("Server is running on port " + port) });
