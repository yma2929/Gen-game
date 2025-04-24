const express = require ("express");
const application = express();
const cors = require("cors");
const port = 3000;
const mysql = require("mysql2");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const dp = mysql.createPool({
    
    host: "localhost",
    user: "root",
    password: "",
    database: "arcane_algo",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
}).promise();


application.use(cors({
    origin:['http://localhost:5500', 'http://127.0.0.1:5500'] ,
    methods:['GET','POST'],
    credentials: true
}))
application.use("/",express.static("docs"));
application.use(express.urlencoded({extended:false}));
application.use(express.json());

application.post("/dp", (req,res)=>{

    console.log("Recived date:", req.body);

    const firstName = req.body.firstName || '';
    const lastName = req.body.lastName || '';
    const emailAddress = req.body.emailAddress || '';
    const phoneNumber = req.body.phoneNumber || '';
    const Skill = req.body.Skill || '';
    const sportTypes = req.body.sportTypes || '';
    const levelRate = req.body.levelRate || '';
    const comments = req.body.comments || '';

    //const sportTypesraw = req.body.sportTypes || '';
    //const sportTypes = Array.isArray(sportTypesraw) ? sportTypesraw.join(',') : sportTypesraw;

    //const skillraw = req.body.skill || '';
    //const Skill = Array.isArray(skillraw) ? skillraw.join(',') : skillraw;

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
        addUserOpinion(firstName,lastName,emailAddress,phoneNumber,Skill,sportTypes,levelRate,comments);

    }else{
        message ={
            status:false,
            err:"Error!!! Please provide real data."};

    }
    res.json(message);



});


async function addUserOpinion(firstName,lastName,emailAddress,phoneNumber,Skill,sportTypes,levelRate,comments){


   // db.connect((err) => {
       // if (err) {
            //console.error("Connection Error:", err);
            //return; }
    try{
        const sql = `INSERT INTO player (firstName, lastName, emailAddress, phoneNumber, Skill, sportTypes, levelRate, comments)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    await dp.query(sql, [firstName, lastName, emailAddress, phoneNumber, Skill, sportTypes, levelRate, comments])
            
                console.log("Data has been inserted successfully.");
            
        }
        catch(error){
            console.error("Query error:",error);

        }
    }

/*
application.get("/export-json",(req,res)=>{
    dp.query("SELECT * FROM player",(err,result)=>{
        if(err){
            console.error("Error retrieving data:",err);
            return res.status(500).send("Error fetching data.");
        }

        const filePath = path.join(__dirname,"playerData.json");

        fs.writeFile(filePath,JSON.stringify(result,null,2),(err)=>{
            if(err){
                console.error("Error writing in file:",err);
                return res.status(500).send("Error writing file:");
            }
            res.download(filePath);
        });
    });
});*/
application.get("/export-json", async (req, res) => {
    try {
      const [rows] = await dp.query("SELECT * FROM player");
      const filePath = path.join(__dirname, "playerData.json");
  
      await fs.promises.writeFile(filePath, JSON.stringify(rows, null, 2));
      return res.download(filePath);
    } catch (err) {
      console.error("Export JSON error:", err);
      return res.status(500).send("Failed to export JSON.");
    }
  });
  

application.get('/export-excel-exceljs',async(req,res)=>{
    try{
        const [rows] = await dp.query("SELECT * FROM player");

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Players');

        sheet.columns = [
            { header: 'First Name',   key: 'firstName',    width: 20 },
            { header: 'Last Name',    key: 'lastName',     width: 20 },
            { header: 'Email',        key: 'emailAddress', width: 30 },
            { header: 'Phone',        key: 'phoneNumber',  width: 15 },
            { header: 'Skill',    key: 'Skill',    width: 30 },
            { header: 'Sport Types',  key: 'sportTypes',   width: 20 },
            { header: 'Level Rate',   key: 'levelRate',    width: 10 },
            { header: 'Comments',     key: 'comments',     width: 40 }
          ];

          rows.forEach(row => sheet.addRow(row));


          const filePath = path.join(__dirname,'playerData.xlsx');
          await workbook.xlsx.writeFile(filePath);

          res.download(filePath,'playerData.xlsx',(err)=>{
            if(err) console.error("Download error:",err);
          })
    } catch(err){
        console.error('ExcelJS export error:',err);
        res.status(500).send('Failed to export file.');
    }
});

application.get("/dashboard-data",async(req,res)=>{
    try{
        const [players] = await dp.query("SELECT * FROM player");
       const totalPlayers = players.length;

       const sportMap = {};
       const skillMap = {};
       const comments = {};

       players.forEach(player => {
           sportMap[player.sportTypes] = (sportMap[player.sportTypes] || 0) + 1;
           skillMap[player.levelRate] = (skillMap[player.levelRate] || 0) + 1;

           if (player.comments) {
            comments.push(player.comments);
           }
       });


        const sportTypes = Object.entries(sportMap).map(([sport, count]) => ({ sport, count }));
        const skillLevels = Object.entries(skillMap).map(([level, count]) => ({ level, count }));
        res.json({
            totalPlayers,
            sportTypes,
            skillLevels,
            comments:comments.slice(-5)
        });
    }catch(err){
        console.error("Dashboard data error:",err);
        res.status(500).send("Failed to fetch dashboard data.");
    }
});


application.listen(port, ()=>{
    console.log("Server is running on port " + port) });
