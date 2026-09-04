document.addEventListener('DOMContentLoaded', function() {
    let allowNegatives = false;
    let numberOfQuestions = 50;
    let selectedOperations = [];
    let currentQuestion = null;

    // Simple audio manager to avoid overlapping sounds
    let audioContext = null;
    let activeNodes = []; // store oscillators and modulators so we can stop them

    function ensureAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    function stopAllSound() {
        try {
            // Stop all active oscillators/modulators and disconnect
            activeNodes.forEach(node => {
                try { node.stop && node.stop(); } catch (e) { /* ignore */ }
                try { node.disconnect && node.disconnect(); } catch (e) { /* ignore */ }
            });
        } finally {
            activeNodes = [];
        }
    }

    function engageQuiz() {
        // Initiate the quiz
        console.log('Engaging quiz...');

        // Get the selected operation checkboxes only (exclude the "Include Negatives" control)
        var selectedCheckboxes = document.querySelectorAll('input[name="operation"]:checked');
        selectedOperations = Array.from(selectedCheckboxes).map(cb => cb.id);

        // Guard: at least one operation must be selected
        if (!selectedOperations || selectedOperations.length === 0) {
            alert('Please select at least one operation before starting the quiz.');
            return;
        }

        // Allow negative numbers?
        var negativesCheckbox = document.getElementById('includeNegatives');
        allowNegatives = negativesCheckbox ? negativesCheckbox.checked : false;

        // Initialize the question counter based off of number input field; default to 50
        var questionCountInput = document.getElementById('questionCount');
        var questionCount = questionCountInput ? parseInt(questionCountInput.value) : NaN;

        if (!Number.isInteger(questionCount) || questionCount <= 0) {
            alert('Please enter a positive integer for the number of questions.');
            return;
        } else {
            numberOfQuestions = questionCount;
        }

        // Generate and display the first question
        currentQuestion = generateQuestion(selectedOperations, allowNegatives);
        displayQuestion(currentQuestion);
        displayAnswerInputField();

        // Add event listener to the answer input field (replace any existing handler)
        var answerInputField = document.getElementById('answer');
        if (answerInputField) {
            answerInputField.onkeypress = function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent the default form submission behavior
                    checkAnswer();
                }
            };
            // Focus the input so users can start typing immediately
            answerInputField.focus();
        }
    }

    function displayQuestion(question) {
        // Display the question on the page
        var questionContainer = document.getElementById('question-container');
        if (questionContainer !== null && question) {
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
        // Guard: if no operations selected, return a default message (but engageQuiz should prevent this)
        if (!selectedOperations || selectedOperations.length === 0) {
            return {
                questionString: 'No operation selected',
                answer: ''
            };
        }

        // Randomly select an operation from the selected checkboxes
        var randomIndex = Math.floor(Math.random() * selectedOperations.length);
        var selectedOperation = selectedOperations[randomIndex];

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
            // Return a default question if an unknown operation is encountered
            return {
                questionString: 'Unknown operation selected',
                answer: ''
            };
        }
    }

    function checkAnswer() {
        // Implement the logic to check the user's answer
        console.log('Checking answer...');

        var answerInputField = document.getElementById('answer');
        if (!answerInputField) {
            alert('No answer field found. Please generate a question first.');
            return;
        }

        if (!currentQuestion) {
            alert('No question generated. Click "Generate Question(s)" to start.');
            return;
        }

        var rawUserAnswer = answerInputField.value;
        var userAnswer = rawUserAnswer !== null && rawUserAnswer !== undefined ? String(rawUserAnswer).trim() : '';
        if (userAnswer === '') {
            alert('Please enter an answer.');
            return;
        }

        var correctAnswer = currentQuestion.answer;
        var answerContainer = document.getElementById('answer-container');

        // Stop any currently playing sounds before starting a new sequence
        stopAllSound();
        const context = ensureAudioContext();

        const duration_1 = 500; // Half a second
        const duration_2 = 1500; // 1.5 seconds
        const delay = 600; // Slightly longer than the duration to ensure the tones don't overlap

        // Normalize comparison so numbers and strings compare sensibly
        let isCorrect = false;
        if (typeof correctAnswer === 'number') {
            // Accept numeric input that matches exactly
            const parsed = Number(userAnswer);
            isCorrect = !isNaN(parsed) && parsed === correctAnswer;
        } else {
            // Compare as trimmed strings
            isCorrect = userAnswer === String(correctAnswer);
        }

        if (isCorrect) {
            if (answerContainer) answerContainer.style.backgroundColor = 'green';
            numberOfQuestions--;
            if (numberOfQuestions > 0) {
                currentQuestion = generateQuestion(selectedOperations, allowNegatives);
                displayQuestion(currentQuestion);
                // Clear the input for the next question and focus
                answerInputField.value = '';
                answerInputField.focus();
            } else {
                alert('You have completed all questions!');
            }

            // Play a short ascending sequence; ensure earlier sounds are stopped
            playToneSequence([{
                freq: 440,
                dur: duration_1,
                start: 0
            }, {
                freq: 554.37,
                dur: duration_1,
                start: delay
            }, {
                freq: 659.25,
                dur: duration_1,
                start: delay * 2
            }, {
                freq: 880,
                dur: duration_2,
                start: delay * 3
            }], context);

            // Brief feedback for correct answer
            setTimeout(() => { alert('Correct!'); }, 50);
        } else {
            if (answerContainer) answerContainer.style.backgroundColor = 'red';

            // Play an incorrect sequence
            playToneSequence([{
                freq: 440,
                dur: duration_1,
                start: 0
            }, {
                freq: 392,
                dur: duration_1,
                start: delay
            }, {
                freq: 369.99,
                dur: duration_2,
                start: delay * 2,
                oscillate: true
            }], context);

            // Delay the alert so it doesn't interrupt the tone starting
            setTimeout(() => { alert('Incorrect. The correct answer is ' + correctAnswer + '. Please try again!'); }, delay * 3);
        }
    }

    // Play a sequence of tones using the shared audio context. Stops previous sounds first.
    function playToneSequence(sequence, context) {
        if (!context) context = ensureAudioContext();
        // stop previous nodes
        stopAllSound();

        sequence.forEach(item => {
            setTimeout(() => {
                playTone(context, item.freq, item.dur, !!item.oscillate);
            }, item.start);
        });
    }

    // Function to play a tone with a given frequency and duration, with optional oscillation
    function playTone(context, frequency, duration, oscillate = false) {
        try {
            const oscillator = context.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;

            const gain = context.createGain();
            // Reasonable gain so volume isn't huge
            gain.gain.value = 0.1;

            if (oscillate) {
                const modulator = context.createOscillator();
                modulator.type = 'sine';
                modulator.frequency.value = 4; // The frequency of the oscillation

                // Connect modulator to the gain's gain param to modulate amplitude
                modulator.connect(gain.gain);
                modulator.start();
                activeNodes.push(modulator);

                oscillator.connect(gain);
                gain.connect(context.destination);
            } else {
                oscillator.connect(gain);
                gain.connect(context.destination);
            }

            oscillator.start();
            // Keep track so we can stop it if a new sequence starts
            activeNodes.push(oscillator);

            // Schedule stop
            setTimeout(() => {
                try { oscillator.stop(); } catch (e) { /* ignore */ }
                try { oscillator.disconnect(); } catch (e) { /* ignore */ }
                try { gain.disconnect(); } catch (e) { /* ignore */ }
            }, duration + 50);
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    }

    // Expose functions to the global scope
    window.engageQuiz = engageQuiz;
    window.checkAnswer = checkAnswer;
});

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

    // Ensure we don't end up with both zeros (which would produce 0 ÷ 0)
    do {
        product1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        product2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    }
    while (product2 === 0 && product1 === 0);

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
        answer = String(num);
    }

    // Return an object with question and answer
    return {
        questionString: questionString,
        answer: answer
    };
}

function playCelebratoryMusic() {
    // Stop anything currently playing first
    stopAllSound();
    const context = ensureAudioContext();

    // Four descending tones forming an A-major scale
    const duration_1 = 500; // Half a second
    const duration_2 = 1500; // 1.5 seconds
    const delay = 600; // Slightly longer than the duration to ensure the tones don't overlap

    playToneSequence([{
        freq: 880,
        dur: duration_1,
        start: 0
    },{
        freq: 830.61,
        dur: duration_1,
        start: delay
    },{
        freq: 739.99,
        dur: duration_1,
        start: delay * 2
    },{
        freq: 659.25,
        dur: duration_1,
        start: delay * 3
    },{
        freq: 587.33,
        dur: duration_1,
        start: delay * 4
    },{
        freq: 554.37,
        dur: duration_1,
        start: delay * 5
    },{
        freq: 493.88,
        dur: duration_1,
        start: delay * 6
    },{
        freq: 440,
        dur: duration_2,
        start: delay * 7
    }], context);
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
