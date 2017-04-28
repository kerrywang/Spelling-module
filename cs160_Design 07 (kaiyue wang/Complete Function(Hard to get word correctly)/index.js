'use strict';

console.log('Loading function');

// const doc = require('dynamodb-doc');

// const dynamo = new doc.DynamoDB();

var Alexa = require("alexa-sdk");
// const doc = require('dynamodb-doc');
// const dynamo = new doc.DynamoDB();

var appId = ''; //'amzn1.echo-sdk-ams.app.your-skill-id';
/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
//// class for timing the performance
 function Stopwatch(){
    var startTime, endTime, instance = this;

    this.start = function (){
        startTime = new Date();
    };

    this.stop = function (){
        endTime = new Date();
    }

    this.clear = function (){
        startTime = null;
        endTime = null;
    }

    this.getSeconds = function(){
        if (!endTime){
        return 0;
        }
        return Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    }

    this.getMinutes = function(){
        return Math.round(instance.getSeconds() / 60);
    }      

}

var wordsDatabase = {
    "easy" : [],
    "medium" : [
        {
            "name" : "bayou",
            "Definition" : "is a marshy arm of a river, usually sluggish or stagnant"
        },
        {
            "name" : "beret",
            "Definition" : "is a soft, visorless cap"
        },
        {
            "name" : "baroque",
            "Definition": "pertains to architecture and art from 17th century Italy."
        },
        {
            "name" : "blithe",
            "Definition": "is joyous, glad or cheerful"
        },
        {
            "name" : "boutique",
            "Definition": "is a small shop within a larger store"
        },
        {
            "name" : "cabaret",
            "Definition": "is a restaurant providing food, drink and music."
        },
        {
            "name" : "callous",
            "Definition": "is hard or indifferent"
        },
        {
            "name" : "monocle",
            "Definition": "is an eyeglass for one eye"
        },
        {
            "name" : "motif",
            "Definition": "is a recurring subject, theme or idea"
        },
        {
            "name" : "noxious",
            "Definition": "is harmful or injurious to health"
        },
        {
            "name" : "nylons",
            "Definition": "are stockings worn by women"
        },
        {
            "name" : "pacifist",
            "Definition": "is a person who is opposed to war or to violence of any kind"
        }
    ],
    
    "hard" : []
}
var s1 = new Stopwatch();


exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log("GetItem succeeded:");

    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, startGameHandlers, SpellingGameModeHandlers);
    alexa.execute();
    // const done = function(err, result) {
    //     console.log("retrieve data");
    //     if (err) {
    //         console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    //     } else {
    //         console.log("GetItem succeeded:", JSON.stringify(result, null, 2));
    //     }

    //     data = result;

    //     alexa.appId = appId;
    //     //alexa.dynamoDBTableName = 'UserRecipe';
    //     alexa.registerHandlers(newSessionHandlers, startGameHandlers, IngredientModeHandlers,DirectionModeHandlers);
    //     alexa.execute();
    // };

    
    // dynamo.scan({ TableName: "RecipesDB" }, done);
        
    
};



var states = {
    SPELLINGGAMEMODE: '_SPELLINGGAMEMODE', // User is trying to access the ingredient.
    SPELLINGSTARTMODE: '_SPELLINGSTARTMODE',  // Prompt the user to start or restart the game.
    SPELLINGRESULTMODE: '_SPELLINGRESULT'
};

var newSessionHandlers = {
    'NewSession': function() {
        this.handler.state = states.SPELLINGSTARTMODE;
        this.emit(':ask', 'Welcome to spelling mode, Would you like easy, medium, or hard mode?',
            'Please Say the name level of game you want to play.');
    },
    "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        //this.attributes['endedSessionCount'] += 1;
        this.emit(":tell", "Goodbye!");
    }
};

var startGameHandlers = Alexa.CreateStateHandler(states.SPELLINGSTARTMODE, {
    'NewSession': function () {
        // this.emit(':ask', 'Welcome to spelling mode, Would you like easy, medium, or hard mode?',
        //     'Please Say the name level of game you want to play.');
    },
    'DIFFICULTYIntetnt': function() {
        console.log("I am in the start game mode");
        var itemSlot = this.event.request.intent.slots["diff"];
        var itemName = itemSlot.value.toLowerCase();

        console.log("the input difficulty: " + itemName);
        this.attributes['inputSofar'] = "";
        this.attributes['totalCorrect'] = 0;
        this.attributes['QuestionCount'] = 0;
        this.attributes['NumCorrectWord'] = 0;
        this.attributes['difficulty'] = itemName;
        this.handler.state = states.SPELLINGGAMEMODE;
         
        this.emit(':ask', "Great! you have chosen level:" + itemName + ", i will give you a list of 10 words one at a time, try to spell each word correctly, I am going to time your performance so don't take it too long, say start if you are ready to take the challenge", "say start if you are ready to take the challenge");        

    },
    'AMAZON.HelpIntent' : function() {
        this.emit(':ask', "You can specify your desired difficulty level by saying: Easy, Medium or Hard, Or quit the app by saying: stop", "You can specify your desired difficulty level by saying: Easy, Medium or Hard.")

    },
    'RestartIntent': function() {
        this.emit('NewSession');
    },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");  
    },  
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'I do not understand your input for difficulty level, please say easy, medium or hard';
        this.emit(':ask', message, message);
    }
});

var SpellingGameModeHandlers = Alexa.CreateStateHandler(states.SPELLINGGAMEMODE, {
    'NewSession': function () {
        this.handler.state = states.STARTMODE;
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'STARTIntent': function() { // start the ingredient
        if (this.attributes["QuestionCount"] === 0) {
            s1.start();
        }

        if (this.attributes["QuestionCount"] < 10) {
            var index = this.attributes['QuestionCount']; /// wizard of OZ should be changed to random with in a certain range of words
            this.attributes['QuestionCount'] = this.attributes['QuestionCount'] + 1;
            var level = this.attributes['difficulty'];
            var correctCurWord = wordsDatabase[level][index]["name"];
            this.attributes['curWord'] = correctCurWord;

            this.emit(':ask', 'Question ' + index + " Please spell: " + correctCurWord ,"Please spell " + correctCurWord);
        } else {

            var imageObj = {
                smallImageUrl: 'https://t3.ftcdn.net/jpg/00/90/04/66/240_F_90046622_ndUsvkHoQF56Jjs1zwqSCNJIqQ0eV7g8.jpg',
                largeImageUrl: 'https://t3.ftcdn.net/jpg/00/90/04/66/240_F_90046622_ndUsvkHoQF56Jjs1zwqSCNJIqQ0eV7g8.jpg'
            };
            // get the ranking 
            s1.stop();

            var min = s1.getMinutes();
            this.emit(':askWithCard', "You have finished the test, your correctness is: " + this.attributes["NumCorrectWord"] / 10 * 100 + " percent," + " you have spent " + min + " minites and you are ranked number 10 at berkeley area", "to return say stop", "Result:", "Ranked: 10 \n Time Used: " + min + " minutes" , imageObj);

        }
    },
    'AskMeaningIntent' : function() {
        var curWord = this.attributes['curWord'];
        this.emit(':ask', "the meaning of " + curWord + " is " + wordsDatabase[this.attributes['difficulty']][this.attributes['QuestionCount'] - 1]["Definition"], "Please spell the word");
    },
    'SpellingIntent': function() {
        var inputWord = this.attributes['inputSofar'];
        
         for (var i = 0; i < 8; i++) {
            // var curChar = this.event.request.intent.slots[alphaCount[i]];
            
            if (this.event.request.intent.slots[alphaCount[i]].value !== undefined) {
                inputWord += this.event.request.intent.slots[alphaCount[i]].value.toLowerCase();
            }
        }
          

        this.attributes["inputSofar"] = inputWord.replace(/[^0-9a-z]/gi, '');
        //this.emit(':ask', "you input " + this.attributes["inputSofar"], "place holder");
        this.emit(':askWithCard', "Your input is: " + spellOutWord(this.attributes["inputSofar"]) + "say done when you are finished or say continue to keep adding or restart to start over", "say done, continue or restart", "Your input is: ", this.attributes["inputSofar"]);


    },
    'DoneIntent': function() {
        //function of compare difference.
        var imageObjCorrect = {
            smallImageUrl: 'https://img.clipartfest.com/6150aa5f94af2e035b28bdcfde2fd3c4_good-job-icon-illustration-thumbs-up-good-job-clipart_1300-1241.jpeg',
            largeImageUrl: 'https://img.clipartfest.com/6150aa5f94af2e035b28bdcfde2fd3c4_good-job-icon-illustration-thumbs-up-good-job-clipart_1300-1241.jpeg'
        };

        var imageObjIncorrect = {
            smallImageUrl: 'https://www.ingenie.com/young-drivers-guide/wp-content/uploads/sites/4/2015/02/How-to-get-over-failing-your-driving-test_banner.jpg',
            largeImageUrl: 'https://www.ingenie.com/young-drivers-guide/wp-content/uploads/sites/4/2015/02/How-to-get-over-failing-your-driving-test_banner.jpg'
        };


        if (this.attributes["inputSofar"] == this.attributes["curWord"]) {
            this.attributes['NumCorrectWord'] += 1;
            this.attributes["inputSofar"] = "";
            this.emit(':askWithCard', "congratulation, you have spelled correctly! to hear the next word please say next", "please say: next, to hear the next word ", "Congratulation","Your Current Correct Answer Count is " + this.attributes["NumCorrectWord"], imageObjCorrect);
        } else {
            ///
            var input = this.attributes["inputSofar"];
            this.attributes["inputSofar"] = "";
            this.emit(':askWithCard', "Sorry, you have spelled incorrectly! the correct way to spell" + this.attributes["curWord"] +
                " is " + spellOutWord(this.attributes["curWord"]) + "to hear the next word please say next", "please say: next, to hear the next word ", "Your Result is:", 
                "Correct input: " + this.attributes["curWord"] + "\n Your input: " + input, imageObjIncorrect);

        }




        
    },
    
    'ContinueIntent' : function() {
        this.emit(':ask', "please continue spelling", "please continue spelling");
    },
    'RestartIntent': function() {
        this.attributes["inputSofar"] = "";
        

        var index = this.attributes['QuestionCount']; /// wizard of OZ should be changed to random with in a certain range of words
        this.emit(':ask', 'Question' + index - 1 + "Please spell: " + this.attributes['curWord'] + ", say done when you are finished." ,"Please spell" + this.attributes['curWord']);
    },
    
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', "You can say next to skip the current problem, After spelling the word, you can say done to submit your response, continue to continue adding and restart to start from scratch", "help");
    },
    "AMAZON.StopIntent": function() {
        console.log("STOPINTENT");
        this.handler.state = states.STARTMODE;
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.emit(':ask', 'Sorry, I didn\'t get that. ', 'Sorry, I didn\'t get that. ');
    }
    
});

var alphaCount = ["firstSlot","secondSlot","thridSlot","fourthSlot","fifthSlot","sixthSlot","seventhSlot","eighthSlot"]
function spellOutWord(spelling) {
    return spelling.toUpperCase().split('').join("<break time=\"0.3s\"/>") + "<break time=\"0.3s\"/>";
}
