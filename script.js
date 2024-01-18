function engageQuiz() {
    // Implement the logic to generate questions and initiate the quiz
    console.log('Quiz engaged!');
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

function generateAdditionQuestion() {
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

function generateMultiplicationQuestion() {
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

function generateSquaringQuestion() {
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

function generateSubtractionQuestion(allowNegatives = true) {
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

function generateDivisionQuestion() {
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

function generateSquareRootQuestion() {
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