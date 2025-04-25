//creating a form
const form = document.getElementById("ratingForm");
//adding an event listener that is triggered by submission
form.addEventListener("submit", function(event) {
    //stops submission before validation
    event.preventDefault();

    
    //read user input
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const emailAddress = document.getElementById("emailAddress").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const comments = document.getElementById("textarea").value;
    const sportTypes = document.querySelector('input[name="sportTypes"]:checked')?.value;
    const Skill =document.querySelector('input[name="Skill"]:checked')?.value;
    const levelRate = document.querySelector('input[name="levelRate"]:checked')?.value;


    const validFormData = validateform(firstName, lastName, emailAddress, phoneNumber, levelRate);

    if(validFormData){

    fetch("http://localhost:3000/dp",{
        //sending 3 objects
        method:"POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({ //data enterned by user
            firstName:firstName,
            lastName:lastName,
            emailAddress:emailAddress,
            phoneNumber:phoneNumber,
            Skill:Skill,
            sportTypes:sportTypes,
            levelRate:levelRate,
            comments:comments
        }),
    })
    .then(function(response){
        if(response.ok){
            return response.json(); //convert to json

        }else{
            throw new Error("Oppss! Network response was interrupted.");
        }
    })
    .then(function(data){
        
        if(data.status){
            document.getElementById("confirmation-message").innerHTML = "<span style='background-color:#f4e8d0; color:#003049;  margin:20px;  padding: 20px;margin: 20px;border-radius:15px; font-family:serif;'>Thank you, your review has been received.</span>";
        }else{
            throw new Error(data.err);
        }
    })
    
    .catch(function(error){
        document.getElementById("confirmation-message").innerHTML = "<span style='color:red; background-color:#f4e8d0;    padding: 20px;margin: 20px;border-radius:15px; font-family:serif;'>Sorry! There seems to be an error.</span>";
    }
    );
}
else{
    alert("Please fill out the form correctly.");
}

});
function validateform(firstName, lastName, email, phoneNumber, rating) {

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/ ;


    let errorMessages = ["The first name must be at least 2 characters long.",
        "The last name must be at least 2 characters long.",
        "The email must be a valid email address and follow the usual format.",
        "The phone number must be a valid phone number and follow the usual format.",
        "You must select only one  rating between 1 and 5.",
];

    

    if(firstName == "" || !firstName.match("[a-zA-Z]{2,}")) {
    alert(errorMessages[0]);
    return false;

        
    }
    if( lastName == "" || !lastName.match("[a-zA-Z]{2,}")) {
    alert(errorMessages[1]);
    return false;
        
    }
    if ( email == "" || !email.match(emailPattern) ) {
        alert(errorMessages[2]);
        return false;
    
    }
    if ( phoneNumber == "" || !phoneNumber.match("[0-9]{10}")) {
        alert(errorMessages[3]);
        return false;
        
    }
    if (rating == null) {
    alert(errorMessages[4]);
    return false;
        
    }

    return true;
}



