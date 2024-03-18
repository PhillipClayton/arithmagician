var question;

function engageQuiz() {
    // Initiate the quiz
    console.log('Engaging quiz...');

    // Get the selected radio button
    var selectedRadioButton = document.querySelector('input[type=radio]:checked');

    // Allow negative numbers?
    var allowNegatives = document.getElementById('includeNegatives').checked;
    if (allowNegatives === null) {
        allowNegatives = false;
    }

    // Generate a question based on the selected radio button
    question = generateQuestion(selectedRadioButton, allowNegatives);

    // Display the question with an answer input field
    displayQuestion(question);
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

function generateQuestion(radioButton, negativeAllowed) {
    // Generate a question based on the selected radio button
    if (radioButton.id === 'addition') {
        return generateAdditionQuestion(negativeAllowed);
    } else if (radioButton.id === 'subtraction') {
        return generateSubtractionQuestion(negativeAllowed);
    } else if (radioButton.id === 'multiplication') {
        return generateMultiplicationQuestion(negativeAllowed);
    } else if (radioButton.id === 'division') {
        return generateDivisionQuestion(negativeAllowed);
    } else if (radioButton.id === 'squares') {
        return generateSquaringQuestion(negativeAllowed);
    } else if (radioButton.id === 'squareRoots') {
        return generateSquareRootQuestion(negativeAllowed);
    }
}

function checkAnswer() {
    // Implement the logic to check the user's answer
    console.log('Checking answer...');
    var answerInputField = document.getElementById('answer');
    var userAnswer = answerInputField.value;
    var correctAnswer = question.answer;
    if (userAnswer == correctAnswer) {
        alert('Correct!');
    } else {    
        alert('Incorrect! The correct answer is ' + correctAnswer);
    }  
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
    do {
        const product1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        const product2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
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
    // Generate a random number between -12 and 12 if allowNegatives is true
    const minNum = allowNegatives ? -12 : 0;
    const maxNum = 12;
    const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    // Calculate the square
    const square = num * num;

    // Create the question string
    const questionString = `√${num}`;

    // Calculate the answer
    const answer = num;

    // Return an object with question and answer
    return {
        questionString: questionString,
        answer: answer
    };
}