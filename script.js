var questions = [];
var questionCounter = 0;
let lastRadioButton;
let lastNegativeAllowed;
let currentQuestion;
let selectedOperations = [];
let allowNegatives = false;

function engageQuiz() {
    // Initiate the quiz
    console.log('Engaging quiz...');

    // Get the selected checkboxes
    var selectedCheckboxes = document.querySelectorAll('input[type=checkbox]:checked');
    selectedOperations = Array.from(selectedCheckboxes).map(cb => cb.id);

    // Allow negative numbers?
    allowNegatives = document.getElementById('includeNegatives').checked;
    if (allowNegatives === null) {
        allowNegatives = false;
    }

    // Initialize the question counter to 50
    questionCounter = 50;

    // Generate and display the first question
    currentQuestion = generateQuestion(selectedOperations, allowNegatives);
    displayQuestion(currentQuestion);
    displayAnswerInputField();

    // Add event listener to the answer input field
    var answerInputField = document.getElementById('answer');
    answerInputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent the default form submission behavior
            checkAnswer();
            answerInputField.value = ''; // Clear the answer input field
        }
    });
}

function displayQuestion(question) {
    // Display the question on the page
    var questionContainer = document.getElementById('question-container');
    if (questionContainer !== null) {
        console.log('Displaying question...');
        questionContainer.innerHTML = question.questionString;
    }
}

function displayAnswerInputField() {
    // Display an input field for the user to enter their answer
    var answerInputField = document.getElementById('answer-container');
    if (answerInputField !== null) {
        answerInputField.innerHTML = '<input type="text" id="answer" placeholder="Enter your answer...">';
    }
}

function generateQuestion(selectedOperations, negativeAllowed) {
    // Randomly select an operation from the selected checkboxes
    var randomIndex = Math.floor(Math.random() * selectedOperations.length);
    var selectedOperation = selectedOperations[randomIndex];

    // lastRadioButton = selectedOperation;
    // lastNegativeAllowed = negativeAllowed;

    if (selectedOperation === 'addition') {
        return generateAdditionQuestion(negativeAllowed);
    } else if (selectedOperation === 'subtraction') {
        return generateSubtractionQuestion(negativeAllowed);
    } else if (selectedOperation === 'multiplication') {
        return generateMultiplicationQuestion(negativeAllowed);
    } else if (selectedOperation === 'division') {
        return generateDivisionQuestion(negativeAllowed);
    } else if (selectedOperation === 'squares') {
        return generateSquaringQuestion(negativeAllowed);
    } else if (selectedOperation === 'squareRoots') {
        return generateSquareRootQuestion(negativeAllowed);
    } else {
        // Return a default question if no operation is selected
        return {
            questionString: 'No operation selected',
            answer: ''
        };
    }
}

function checkAnswer() {
    // Implement the logic to check the user's answer
    console.log('Checking answer...');
    var answerInputField = document.getElementById('answer');
    var userAnswer = answerInputField.value;
    var correctAnswer = currentQuestion.answer;
    var answerContainer = document.getElementById('answer-container');

    // Play a three-tone sequence based on whether all answers are correct
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const duration_1 = 500; // Half a second
    const duration_2 = 1500; // 1.5 seconds
    const delay = 600; // Slightly longer than the duration to ensure the tones don't overlap

    if (userAnswer == correctAnswer) {
        alert('Correct!');
        answerContainer.style.backgroundColor = 'green';
        questionCounter--;
        if (questionCounter > 0) {
            currentQuestion = generateQuestion(selectedOperations, allowNegatives);
            displayQuestion(currentQuestion);
            answerInputField.value = ''; // Clear the answer input field
        } else {
            alert('You have completed all 50 questions!');
        }
        // Four ascending tones forming an A-major triad (A4, C#5, E5) + A5 (one octave higher)
        setTimeout(() => { playTone(context, 440, duration_1); }, 0); // A4
        setTimeout(() => { playTone(context, 554.37, duration_1); }, delay); // C#5
        setTimeout(() => { playTone(context, 659.25, duration_1); }, delay * 2); // E5
        setTimeout(() => { playTone(context, 880, duration_2); }, delay * 3); // A5
    } else {
        setTimeout(() => { playTone(context, 440, duration_1); }, 0); // A4
        setTimeout(() => { playTone(context, 392, duration_1); }, delay); // G4
        setTimeout(() => { playTone(context, 369.99, duration_2, true); }, delay * 2); // F4#
        setTimeout(() => { answerContainer.style.backgroundColor = 'red'; }, delay * 5);
        setTimeout(() => { alert('Incorrect. The correct answer is ' + correctAnswer + '. Please try again!'); }, delay * 5);
    }
}

// Function to play a tone with a given frequency and duration, with optional oscillation
function playTone(context, frequency, duration, oscillate = false) {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    if (oscillate) {
        const gain = context.createGain();
        gain.gain.value = 30; // The amplitude of the oscillation

        const modulator = context.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.value = 4; // The frequency of the oscillation

        modulator.connect(gain);
        gain.connect(oscillator.frequency);

        modulator.start();
        setTimeout(() => { modulator.stop(); }, duration);
    }

    oscillator.connect(context.destination);
    oscillator.start();
    setTimeout(() => { oscillator.stop(); }, duration);
}


function playCelebratoryMusic() {
    // Play celebratory music using the Web Audio API
    // Four descending tones forming an A-major scale (A5, G#5, F#5, E5, D5, C#5, B4, A4)
    // Play a three-tone sequence based on whether all answers are correct
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const duration_1 = 500; // Half a second
    const duration_2 = 1500; // 1.5 seconds
    const delay = 600; // Slightly longer than the duration to ensure the tones don't overlap

    setTimeout(() => { playTone(context, 880, duration_1); }, 0); // A5
    setTimeout(() => { playTone(context, 830.61, duration_1); }, delay); // G#5
    setTimeout(() => { playTone(context, 739.99, duration_1); }, delay * 2); // F#5
    setTimeout(() => { playTone(context, 659.25, duration_1); }, delay * 3); // E5
    setTimeout(() => { playTone(context, 587.33, duration_1); }, delay * 4); // D5
    setTimeout(() => { playTone(context, 554.37, duration_1); }, delay * 5); // C#5
    setTimeout(() => { playTone(context, 493.88, duration_1); }, delay * 6); // B4
    setTimeout(() => { playTone(context, 440, duration_2); }, delay * 7); // A4
}

function generateConfetti(delay_standard) {
    // Generate confetti using confetti-js
    var confettiSettings = { target: 'my-canvas' };
    var confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
    setTimeout(() => { confetti.clear(); }, delay_standard * 9);
    setTimeout(() => { location.reload(); }, delay_standard * 9);
}

function generateRandomNumber(min, max) {
    // Generate a random number between min and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAdditionQuestion(allowNegatives) {
    // Generate random numbers between -20 and 20 if allowNegatives is true
    const minNum = allowNegatives ? -20 : 0;
    const maxNum = 20;
    const num1 = generateRandomNumber(minNum, maxNum);
    const num2 = generateRandomNumber(minNum, maxNum);

    // Create the question string
    const questionString = `${num1} + ${num2}`;

    // Calculate the answer
    const answer = num1 + num2;

    // Return an object with question and answer
    return {
        questionString: questionString,
        answer: answer
    };
}

function generateMultiplicationQuestion(allowNegatives) {
    // Generate random numbers between -12 and 12 if allowNegatives is true
    const minNum = allowNegatives ? -12 : 0;
    const maxNum = 12;
    const num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    const num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    // Create the question string
    const questionString = `${num1} * ${num2}`;

    // Calculate the answer
    const answer = num1 * num2;

    // Return an object with question and answer
    return {
        questionString: questionString,
        answer: answer
    };
}

function generateSquaringQuestion(allowNegatives) {
    // Generate a random number between -12 and 12 if allowNegatives is true
    const minNum = allowNegatives ? -12 : 0;
    const maxNum = 12;
    const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    // Create the question string
    const questionString = `${num}^2`;

    // Calculate the answer
    const answer = num * num;

    // Return an object with question and answer
    return {
        questionString: questionString,
        answer: answer
    };
}

function generateSubtractionQuestion(allowNegatives) {
    // Generate random numbers between -20 and 20 if allowNegatives is true
    const minNum = allowNegatives ? -20 : 0;
    const maxNum = 20;  
    const num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    const num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    // Create the question string
    const questionString = `${num1} - ${num2}`;

    // Calculate the answer
    const answer = num1 - num2;

    // Return an object with question and answer
    return {
        questionString: questionString,
        answer: answer
    };
}

function generateDivisionQuestion(allowNegatives) {
    // Generate random numbers between the products of -12 to 12 if allowNegatives is true
    const minNum = allowNegatives ? -12 : 0;
    const maxNum = 12;
    let product1 = 0;
    let product2 = 1;

    do {
        product1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        product2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    }
    while (product2 === 0 && product1 === 0); // Ensure at least one of the products is not zero

    // Calculate the dividend and divisor
    const dividend = product1 * product2;
    const divisor = product2 !== 0 ? product2 : product1; // Ensure divisor is not zero

    // Create the question string
    const questionString = `${dividend} ÷ ${divisor}`;

    // Calculate the answer
    const answer = dividend / divisor;

    // Return an object with question and answer
    return {
        questionString: questionString,
        answer: answer
    };
}

function generateSquareRootQuestion(allowNegatives) {
    // Generate a random number between 0 and 12
    const maxNum = 12;
    const num = Math.floor(Math.random() * (maxNum + 1))
    let questionString = ''
    let answer = ''

    // Calculate the square and create the question and answer strings
    // Only let the answer be imaginary SOMETIMES
    if (allowNegatives) {
        const imaginary_chance = Math.random();
        if (imaginary_chance > 0.5) {
            const square = num * num * -1;
            questionString = `√${square}`;
            answer = `${num}i`;
        }
        else {
            const square = num * num;
            questionString = `√${square}`;
            answer = `${num}`;
        }
        
    }
    else {
        const square = num * num;
        questionString = `√${square}`;
        answer = num;
    }

    // Return an object with question and answer
    return {
        questionString: questionString,
        answer: answer
    };
}