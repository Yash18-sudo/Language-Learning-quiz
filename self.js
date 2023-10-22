const firebaseConfig = {
    apiKey: "AIzaSyAGmUAViFiecU-O8sxpJXrisDONlmsaZD4",
    authDomain: "checks-d2001.firebaseapp.com",
    projectId: "checks-d2001",
    storageBucket: "checks-d2001.appspot.com",
    messagingSenderId: "574565931185",
    appId: "1:574565931185:web:2cb1c936a69d573b282a90",
    measurementId: "G-XQE0J9VF6F"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // Initialize variables
  const auth = firebase.auth()
  const database = firebase.database()

const api_url ="https://api-production-7402.up.railway.app/service";

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const playButton = document.getElementById("play-btn");
let level = document.getElementById("level");
let final_ans;
let questionIndex = 0;
let score = 0;
let userScore ;
let op_index=0;
let userId;
let leaderboard = document.querySelectorAll(".leaderboard");

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      userId = user.uid;  // Store the UID in the userId variable
    }
  });


function refreshPage() {
    // Use the location object to reload the current page
    location.reload();
}

async function getapi(api_url){
    
    const response = await fetch(api_url);
    let data = await response.json();
    
    console.log(data);
    let options = Object.assign({}, data.results[0].incorrect_answers);
    options.ans=data.results[op_index].correct_answer;
    final_ans=data.results[op_index].correct_answer//correct option
    let propertyValues = Object.values(options);//all options

    function shuffle(propertyValues) {
        propertyValues.sort(() => Math.random() - 0.5);
    }
    shuffle(propertyValues);
    


function showQuestion(){

    resetState();
    
    
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          userId = user.uid; // Store the UID in the userId variable
          getUserScore(userId)
            .then((userScore) => {
              if (userScore !== null) {
                console.log(userScore);
                
              }
            });
        }
      });

      function getUserScore(userId) {
        const userRef = database.ref(`/users/${userId}`);
      
        return userRef.once('value')
          .then((snapshot) => {
            const userData = snapshot.val();
            if (userData) {
               userScore = userData.score;
              return userScore;
            } else {
              console.log("User data not found.");
              return null; // Return null if user data is not found
            }
          })
          .catch((error) => {
            console.error('Error reading user data:', error);
            return null; // Return null in case of an error
          });
      }
      
    let levels = levset();

    function levset(){
        if(userScore<=5)
        {
            return "easy";
            
        }
        else if(userScore>=5 && userScore<=7)
        {
            return "medium";
        }

        else if(userScore>=8)
        {
            return "hard";
        }
        return "easy"
    }

    const Questions = data.results.filter(question => question.difficulty === `${levels}`);
    console.log(levels);    
    console.log(Questions);
    
    questionElement.innerHTML = Questions[questionIndex].question;
    level.innerHTML = levels;
    options = Object.assign({}, Questions[op_index].incorrect_answers);
    options.ans=Questions[op_index].correct_answer;
    final_ans=Questions[op_index].correct_answer//correct option
    propertyValues = Object.values(options);//all options
    shuffle(propertyValues);
    op_index++;

    propertyValues.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer;
        button.classList.add("btn");
        answerButtons.appendChild(button);

        button.addEventListener("click",selectAnswer);
    });
    }


    function resetState() {
        nextButton.style.display = "none";
        while(answerButtons.firstChild)
        {
            answerButtons.removeChild(answerButtons.firstChild);
        }
    }   

    function selectAnswer(event)
    {
        const selectedButton = event.target;
        if (selectedButton.textContent == final_ans) {
            selectedButton.classList.add('correct');
            score++;
        } else {
            selectedButton.classList.add('incorrect');
        }
        
        Array.from(answerButtons.children).forEach(button => {

            if(button.textContent == final_ans){
                button.classList.add('correct');
            }
            button.disabled=true;
        });
        
        nextButton.style.display = "block";
    }

    function showScore() {
        resetState();
        
        // Get the user's reference in the Firebase database
        const userRef = database.ref(`/users/${userId}`);
        questionElement.innerHTML= "Calculating your score"
        // Read the current user data
        userRef.once('value')
          .then((snapshot) => {
            const userData = snapshot.val();
            if (userData) {
              const userScore = userData.score || 0; // Default to 0 if score is undefined
              const newScore = score;
              
              // Update the user's score in Firebase
              userRef.update({ score: newScore });
      
              // Display the updated score
              questionElement.innerHTML = `You Scored ${newScore} out of 10`;
              playButton.style.display = "block";
            } else {
              console.log("User data not found.");
            }
          })
          .catch((error) => {
            console.error('Error updating user score:', error);
          });
      }
      

    function handleNextButton(){
        questionIndex++;
        if(questionIndex < 10)
        {
            showQuestion();
        }
        else{
            showScore();
        }
    }
 
    nextButton.addEventListener("click", ()=>{
        if(questionIndex < data.results.length)
        {
            handleNextButton();
        }else{
            startQuiz();
        }
    });
    

function startQuiz(){
    nextButton.innerHTML = "Next";
    showQuestion();
}


startQuiz();

}

getapi(api_url);


const userUids = [];

function getAllUserUids(callback) {
    const usersRef = database.ref('/users');
    
    usersRef.once('value')
      .then((snapshot) => {
        const usersData = snapshot.val();
        if (usersData) {
          const userUids = Object.keys(usersData);
          callback(userUids);
        } else {
          callback([]); // Provide an empty array if there are no users
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        callback([]); // Handle the error and provide an empty array
      });
  }
  
  
  
function populateLeaderboard() {
    const nameList = document.getElementById("name-list");
    const scoreList = document.getElementById("score-list");
  
    const usersRef = database.ref("/users");
  
    usersRef.once("value")
      .then((snapshot) => {
        const usersData = snapshot.val();
  
        if (usersData) {
          const usersArray = Object.entries(usersData);
  
          // Sort the users by their score in ascending order
          usersArray.sort((a, b) => b[1].score - a[1].score);
  
          usersArray.forEach(([uid, userData]) => {
            // Create list items for names and scores
            const nameItem = document.createElement("li");
            nameItem.textContent = userData.full_name;
  
            const scoreItem = document.createElement("li");
            scoreItem.textContent = userData.score;
  
            // Append list items to the respective lists
            nameList.appendChild(nameItem);
            scoreList.appendChild(scoreItem);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }
  
  // Call the function to populate the leaderboard
  populateLeaderboard();
  