document.addEventListener('DOMContentLoaded', function() {
    let allowNegatives = false;
    let numberOfQuestions = 50;
    let selectedOperations = [];
    let currentQuestion = null;

    // Audio manager
    let audioContext = null;
    let masterGain = null;
    let activeNodes = []; // oscillators/modulators
    let scheduledTimeouts = []; // timeouts for scheduled play/stop

    function ensureAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // create a master gain node so mute/volume are global
            masterGain = audioContext.createGain();
            masterGain.gain.value = 0.1; // default volume
            masterGain.connect(audioContext.destination);
        }
        return audioContext;
    }

    function setMasterVolume(value) {
        if (!masterGain) ensureAudioContext();
        masterGain.gain.value = value;
    }

    function stopAllSound() {
        // clear timeouts
        while (scheduledTimeouts.length) {
            const id = scheduledTimeouts.shift();
            try { clearTimeout(id); } catch (e) { /* ignore */ }
        }

        // stop active nodes
        try {
            activeNodes.forEach(node => {
                try { node.stop && node.stop(); } catch (e) { /* ignore */ }
                try { node.disconnect && node.disconnect(); } catch (e) { /* ignore */ }
            });
        } finally {
            activeNodes = [];
        }
    }

    function engageQuiz() {
        // Ensure audio will be allowed in browsers that require a user gesture
        const ctx = ensureAudioContext();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => { /* ignore */ });
        }

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
            answerInputField.focus();
        }
    }

    function displayQuestion(question) {
        // Display the question on the page
        var questionContainer = document.getElementById('question-container');
        if (questionContainer !== null && question) {
            questionContainer.textContent = question.questionString;
        }
    }

    function displayAnswerInputField() {
        // Display an input field for the user to enter their answer
        var answerInputField = document.getElementById('answer-container');
        if (answerInputField !== null) {
            answerInputField.innerHTML = '<input type="text" id="answer" placeholder="Enter your answer..." aria-label="Answer input">';
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

    function isImagString(s) {
        return typeof s === 'string' && /i$/i.test(s.trim());
    }

    function normalizeImagString(s) {
        if (s === null || s === undefined) return '';
        let str = String(s).trim().toLowerCase();
        // remove spaces and asterisks
        str = str.replace(/\s+/g, '').replace(/\*/g, '');
        if (!str.endsWith('i')) return str;
        let prefix = str.slice(0, -1); // part before i
        if (prefix === '' || prefix === '+') prefix = '1';
        if (prefix === '-') prefix = '-1';
        // remove leading +
        if (prefix.startsWith('+')) prefix = prefix.slice(1);
        // coerce numeric formatting
        let num = Number(prefix);
        if (!isNaN(num)) {
            // if integer, keep as integer string
            if (Number.isInteger(num)) prefix = String(num);
            else prefix = String(num);
        }
        return prefix + 'i';
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
            // Accept numeric input that matches with tolerance
            const parsed = Number(userAnswer);
            if (!isNaN(parsed)) {
                isCorrect = Math.abs(parsed - correctAnswer) < 1e-6;
            } else {
                isCorrect = false;
            }
        } else {
            // special-case imaginary answers to accept 'i' == '1i'
            if (isImagString(correctAnswer) || isImagString(userAnswer)) {
                const normUser = normalizeImagString(userAnswer);
                const normCorrect = normalizeImagString(correctAnswer);
                isCorrect = normUser === normCorrect;
            } else {
                // Compare as trimmed, lowercased strings for general cases
                isCorrect = userAnswer.toLowerCase() === String(correctAnswer).toLowerCase();
            }
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
                // celebration
                playCelebratoryMusic();
                generateConfetti(600);
                // show restart button
                var restartBtn = document.getElementById('restartBtn');
                if (restartBtn) restartBtn.style.display = 'inline-block';
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
            setTimeout(() => { alert('Incorrect. The correct answer is ' + String(correctAnswer) + '. Please try again!'); }, delay * 3);
        }
    }

    // Play a sequence of tones using the shared audio context. Stops previous sounds first.
    function playToneSequence(sequence, context) {
        if (!context) context = ensureAudioContext();
        // stop previous nodes and clear scheduled timeouts
        stopAllSound();

        sequence.forEach(item => {
            const id = setTimeout(() => {
                playTone(context, item.freq, item.dur, !!item.oscillate);
            }, item.start);
            scheduledTimeouts.push(id);
        });
    }

    // Function to play a tone with a given frequency and duration, with optional oscillation
    function playTone(context, frequency, duration, oscillate = false) {
        try {
            const oscillator = context.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;

            const gain = context.createGain();
            // per-tone gain controlled by masterGain
            gain.gain.value = 1.0;

            if (oscillate) {
                const modulator = context.createOscillator();
                modulator.type = 'sine';
                modulator.frequency.value = 4; // The frequency of the oscillation

                // Connect modulator to the gain's gain param to modulate amplitude
                modulator.connect(gain.gain);
                modulator.start();
                activeNodes.push(modulator);

                oscillator.connect(gain);
                gain.connect(masterGain || context.destination);
            } else {
                oscillator.connect(gain);
                gain.connect(masterGain || context.destination);
            }

            oscillator.start();
            // Keep track so we can stop it if a new sequence starts
            activeNodes.push(oscillator);

            // Schedule stop
            const stopId = setTimeout(() => {
                try { oscillator.stop(); } catch (e) { /* ignore */ }
                try { oscillator.disconnect(); } catch (e) { /* ignore */ }
                try { gain.disconnect(); } catch (e) { /* ignore */ }
            }, duration + 50);
            scheduledTimeouts.push(stopId);
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    }

    function playCelebratoryMusic() {
        // Stop anything currently playing first
        stopAllSound();
        const context = ensureAudioContext();

        // Four descending tones forming an A-major scale
        const duration_1 = 500; // Half a second
        const duration_2 = 1500; // 1.5 seconds
        const delay = 600; // Slightly longer than the duration to ensure the tones don't overlap

        playToneSequence([{...{freq:880,dur:duration_1,start:0}},{...{freq:830.61,dur:duration_1,start:delay}},{...{freq:739.99,dur:duration_1,start:delay*2}},{...{freq:659.25,dur:duration_1,start:delay*3}},{...{freq:587.33,dur:duration_1,start:delay*4}},{...{freq:554.37,dur:duration_1,start:delay*5}},{...{freq:493.88,dur:duration_1,start:delay*6}},{...{freq:440,dur:duration_2,start:delay*7}}], context);
    }

    function generateConfetti(delay_standard) {
        // Generate confetti using confetti-js
        var confettiSettings = { target: 'my-canvas' };
        var confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();
        // clear confetti after the sequence and show restart button
        const clearId = setTimeout(() => { try { confetti.clear(); } catch (e) { /* ignore */ } }, delay_standard * 9);
        scheduledTimeouts.push(clearId);
    }

    function restartQuiz() {
        // Reset UI state
        stopAllSound();
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) restartBtn.style.display = 'none';
        const questionContainer = document.getElementById('question-container');
        if (questionContainer) questionContainer.textContent = '';
        const answerContainer = document.getElementById('answer-container');
        if (answerContainer) answerContainer.textContent = '';
        // Reset defaults
        numberOfQuestions = parseInt(document.getElementById('questionCount')?.value) || 50;
        currentQuestion = null;
    }

    function generateRandomNumber(min, max) {
        // Generate a random number between min and max (inclusive)
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Question generators
    function generateAdditionQuestion(allowNegatives) {
        const minNum = allowNegatives ? -20 : 0;
        const maxNum = 20;
        const num1 = generateRandomNumber(minNum, maxNum);
        const num2 = generateRandomNumber(minNum, maxNum);
        return { questionString: `${num1} + ${num2}`, answer: num1 + num2 };
    }

    function generateMultiplicationQuestion(allowNegatives) {
        const minNum = allowNegatives ? -12 : 0;
        const maxNum = 12;
        const num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        const num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        return { questionString: `${num1} * ${num2}`, answer: num1 * num2 };
    }

    function generateSquaringQuestion(allowNegatives) {
        const minNum = allowNegatives ? -12 : 0;
        const maxNum = 12;
        const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        return { questionString: `${num}^2`, answer: num * num };
    }

    function generateSubtractionQuestion(allowNegatives) {
        const minNum = allowNegatives ? -20 : 0;
        const maxNum = 20;  
        const num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        const num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        return { questionString: `${num1} - ${num2}`, answer: num1 - num2 };
    }

    function generateDivisionQuestion(allowNegatives) {
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

        const dividend = product1 * product2;
        const divisor = product2 !== 0 ? product2 : product1; // Ensure divisor is not zero
        const raw = dividend / divisor;
        // If raw is an integer, keep it as Number; otherwise keep Number (comparison toleranced)
        return { questionString: `${dividend} ÷ ${divisor}`, answer: raw };
    }

    function generateSquareRootQuestion(allowNegatives) {
        const maxNum = 12;
        const num = Math.floor(Math.random() * (maxNum + 1));
        let questionString = '';
        let answer = '';

        if (allowNegatives) {
            const imaginary_chance = Math.random();
            if (imaginary_chance > 0.5) {
                const square = num * num * -1;
                questionString = `√${square}`;
                answer = `${num}i`; // imaginary as string
            }
            else {
                const square = num * num;
                questionString = `√${square}`;
                answer = num; // numeric
            }
        }
        else {
            const square = num * num;
            questionString = `√${square}`;
            answer = num; // numeric
        }

        return { questionString, answer };
    }

    // Wire up controls
    const generateBtn = document.getElementById('generateBtn');
    const checkBtn = document.getElementById('checkBtn');
    const restartBtn = document.getElementById('restartBtn');
    const muteCheckbox = document.getElementById('mute');
    const volumeSlider = document.getElementById('volume');

    if (generateBtn) generateBtn.addEventListener('click', engageQuiz);
    if (checkBtn) checkBtn.addEventListener('click', checkAnswer);
    if (restartBtn) restartBtn.addEventListener('click', restartQuiz);

    if (muteCheckbox) {
        muteCheckbox.addEventListener('change', function () {
            if (muteCheckbox.checked) setMasterVolume(0);
            else setMasterVolume(Number(volumeSlider?.value || 0.1));
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', function () {
            if (muteCheckbox && muteCheckbox.checked) return;
            setMasterVolume(Number(volumeSlider.value));
        });
        // initialize master volume
        setMasterVolume(Number(volumeSlider.value || 0.1));
    }

    // Expose functions to the global scope for backward compatibility
    window.engageQuiz = engageQuiz;
    window.checkAnswer = checkAnswer;
    window.restartQuiz = restartQuiz;
});
