var currentQuestionIndex = 0; // Track the index of the current question

function engageQuiz() {
    // Initiate the quiz
    // Get all checkboxes
    console.log('Engaging quiz...');

    // Get the selected radio button
    var selectedRadioButton = document.querySelector('input[type=radio]:checked');

    // Allow negative numbers?
    var allowNegatives = document.getElementById('includeNegatives').checked;

    // Generate a question based on the selected radio button
    var question = generateQuestion(selectedRadioButton);

    // Display the first question
    displayQuestion(questions[currentQuestionIndex]);
}

function displayQuestion(question) {
    // Display the question on the page
    var questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = question.questionString;
}

function generateQuestion(radioButton) {
    // Generate a question based on the selected radio button
    if (radioButton.id === 'addition') {
        return generateAdditionQuestion(allowNegatives);
    } else if (radioButton.id === 'subtraction') {
        return generateSubtractionQuestion(allowNegatives);
    } else if (radioButton.id === 'multiplication') {
        return generateMultiplicationQuestion(allowNegatives);
    } else if (radioButton.id === 'division') {
        return generateDivisionQuestion(allowNegatives);
    } else if (radioButton.id === 'squares') {
        return generateSquaringQuestion(allowNegatives);
    } else if (radioButton.id === 'squareRoots') {
        return generateSquareRootQuestion(allowNegatives);
    }
}

function checkAnswer() {
    // Implement the logic to check the user's answer
    console.log('Checking answer...');
}

function proceedToNextQuestion() {
    // Implement the logic to proceed to the next question
    console.log('Proceeding to the next question...');
}

function energize() {
    // Implement the logic to reset the page
    console.log('Energizing...');
}

function generateAdditionQuestion(allowNegatives) {
    // Generate random numbers between 0 and 20
    const num1 = Math.floor(Math.random() * 21);
    const num2 = Math.floor(Math.random() * 21);

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
    // Generate random numbers between 0 and 12
    const num1 = Math.floor(Math.random() * 13);
    const num2 = Math.floor(Math.random() * 13);

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
    // Generate a random number between 0 and 12
    const num = Math.floor(Math.random() * 13);

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
    // Generate random numbers between 0 and 20
    const num1 = Math.floor(Math.random() * 21);
    const num2 = Math.floor(Math.random() * 21);

    // Ensure the first number is greater than or equal to the second
    const minNum = allowNegatives ? 0 : num2;
    const maxNum = 20;

    const num3 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    // Create the question string
    const questionString = `${num3} - ${num2}`;

    // Calculate the answer
    const answer = num3 - num2;

    // Return an object with question and answer
    return {
        questionString: questionString,
        answer: answer
    };
}

function generateDivisionQuestion(allowNegatives) {
    // Generate random numbers between the products of 1 to 12
    const product1 = Math.floor(Math.random() * 12) + 1;
    const product2 = Math.floor(Math.random() * 12) + 1;

    // Calculate the dividend and divisor
    const dividend = product1 * product2;
    const divisor = product2 !== 0 ? product2 : 1; // Ensure divisor is not zero

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
    const num = Math.floor(Math.random() * 13);

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