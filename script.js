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
        // clear scheduled timeouts
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
        // Get the selected operation checkboxes only (exclude the "Include Negatives" control)
        var selectedCheckboxes = document.querySelectorAll('input[name="operation"]:checked');
        selectedOperations = Array.from(selectedCheckboxes).map(cb => cb.id);

        // Guard: at least one operation must be selected
        if (!selectedOperations || selectedOperations.length === 0) {
            showToast('Please select at least one operation before starting the quiz.', 'error', 3000);
            return;
        }

        // Allow negative numbers?
        var negativesCheckbox = document.getElementById('includeNegatives');
        allowNegatives = negativesCheckbox ? negativesCheckbox.checked : false;

        // Initialize the question counter based off of number input field; default to 50
        var questionCountInput = document.getElementById('questionCount');
        var questionCount = questionCountInput ? parseInt(questionCountInput.value) : NaN;

        if (!Number.isInteger(questionCount) || questionCount <= 0) {
            showToast('Please enter a positive integer for the number of questions.', 'error', 3000);
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
        var questionContainer = document.getElementById('question-container');
        if (questionContainer !== null && question) {
            questionContainer.textContent = question.questionString;
            // reset background color for answer container
            const answerContainer = document.getElementById('answer-container');
            if (answerContainer) answerContainer.style.backgroundColor = '';
        }
    }

    function displayAnswerInputField() {
        var answerInputField = document.getElementById('answer-container');
        if (answerInputField !== null) {
            answerInputField.innerHTML = '<input type="text" id="answer" placeholder="Enter your answer..." aria-label="Answer input">';
        }
    }

    function generateQuestion(selectedOperations, negativeAllowed) {
        if (!selectedOperations || selectedOperations.length === 0) {
            return { questionString: 'No operation selected', answer: '' };
        }

        var randomIndex = Math.floor(Math.random() * selectedOperations.length);
        var selectedOperation = selectedOperations[randomIndex];

        if (selectedOperation === 'addition') return generateAdditionQuestion(negativeAllowed);
        if (selectedOperation === 'subtraction') return generateSubtractionQuestion(negativeAllowed);
        if (selectedOperation === 'multiplication') return generateMultiplicationQuestion(negativeAllowed);
        if (selectedOperation === 'division') return generateDivisionQuestion(negativeAllowed);
        if (selectedOperation === 'squares') return generateSquaringQuestion(negativeAllowed);
        if (selectedOperation === 'squareRoots') return generateSquareRootQuestion(negativeAllowed);

        return { questionString: 'Unknown operation selected', answer: '' };
    }

    // Imaginary helpers
    function isImagString(s) {
        return typeof s === 'string' && /i$/i.test(String(s).trim());
    }

    function normalizeImagString(s) {
        if (s === null || s === undefined) return '';
        let str = String(s).trim().toLowerCase();
        str = str.replace(/\s+/g, '').replace(/\*/g, '');
        if (!str.endsWith('i')) return str;
        let prefix = str.slice(0, -1);
        if (prefix === '' || prefix === '+') prefix = '1';
        if (prefix === '-') prefix = '-1';
        if (prefix.startsWith('+')) prefix = prefix.slice(1);
        const num = Number(prefix);
        if (!isNaN(num)) prefix = Number.isInteger(num) ? String(num) : String(num);
        return prefix + 'i';
    }

    function checkAnswer() {
        var answerInputField = document.getElementById('answer');
        if (!answerInputField) {
            showToast('No answer field found. Generate a question first.', 'error', 3000);
            return;
        }

        if (!currentQuestion) {
            showToast('No question generated. Click "Generate Question(s)" to start.', 'error', 3000);
            return;
        }

        var rawUserAnswer = answerInputField.value;
        var userAnswer = rawUserAnswer !== null && rawUserAnswer !== undefined ? String(rawUserAnswer).trim() : '';
        if (userAnswer === '') {
            showToast('Please enter an answer.', 'error', 2500);
            return;
        }

        var correctAnswer = currentQuestion.answer;
        var answerContainer = document.getElementById('answer-container');

        stopAllSound();
        const context = ensureAudioContext();

        const duration_1 = 500; // Half a second
        const duration_2 = 1500; // 1.5 seconds
        const delay = 600; // Slightly longer than the duration to ensure the tones don't overlap

        // Determine correctness
        let isCorrect = false;
        if (typeof correctAnswer === 'number') {
            const parsed = Number(userAnswer);
            if (!isNaN(parsed)) isCorrect = Math.abs(parsed - correctAnswer) < 1e-6;
        } else if (isImagString(correctAnswer) || isImagString(userAnswer)) {
            const normUser = normalizeImagString(userAnswer);
            const normCorrect = normalizeImagString(correctAnswer);
            isCorrect = normUser === normCorrect;
        } else {
            isCorrect = userAnswer.toLowerCase() === String(correctAnswer).toLowerCase();
        }

        if (isCorrect) {
            if (answerContainer) answerContainer.style.backgroundColor = 'green';
            numberOfQuestions--;
            if (numberOfQuestions > 0) {
                currentQuestion = generateQuestion(selectedOperations, allowNegatives);
                displayQuestion(currentQuestion);
                answerInputField.value = '';
                answerInputField.focus();
            } else {
                // celebration
                playCelebratoryMusic();
                generateConfetti(600);
                const restartBtn = document.getElementById('restartBtn');
                if (restartBtn) restartBtn.style.display = 'inline-block';
                setTimeout(() => { showToast('You have completed all questions!', 'success', 3000); }, 80);
            }

            // Play success sequence and show a non-blocking toast
            playToneSequence([
                { freq: 440, dur: duration_1, start: 0 },
                { freq: 554.37, dur: duration_1, start: delay },
                { freq: 659.25, dur: duration_1, start: delay * 2 },
                { freq: 880, dur: duration_2, start: delay * 3 }
            ], context);
            setTimeout(() => { showToast('Correct!', 'success', 2000); }, 80);
        } else {
            if (answerContainer) answerContainer.style.backgroundColor = 'red';

            playToneSequence([
                { freq: 440, dur: duration_1, start: 0 },
                { freq: 392, dur: duration_1, start: delay },
                { freq: 369.99, dur: duration_2, start: delay * 2, oscillate: true }
            ], context);

            setTimeout(() => { showToast('Incorrect — correct answer: ' + String(correctAnswer), 'error', 3500); }, delay * 3);
        }
    }

    function playToneSequence(sequence, context) {
        if (!context) context = ensureAudioContext();
        stopAllSound();

        sequence.forEach(item => {
            const id = setTimeout(() => { playTone(context, item.freq, item.dur, !!item.oscillate); }, item.start);
            scheduledTimeouts.push(id);
        });
    }

    function playTone(context, frequency, duration, oscillate = false) {
        try {
            const oscillator = context.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;

            const gain = context.createGain();
            gain.gain.value = 1.0; // per-tone

            if (oscillate) {
                const modulator = context.createOscillator();
                modulator.type = 'sine';
                modulator.frequency.value = 4;
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
            activeNodes.push(oscillator);

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
        stopAllSound();
        const context = ensureAudioContext();
        const duration_1 = 500;
        const duration_2 = 1500;
        const delay = 600;
        playToneSequence([
            { freq: 880, dur: duration_1, start: 0 },
            { freq: 830.61, dur: duration_1, start: delay },
            { freq: 739.99, dur: duration_1, start: delay * 2 },
            { freq: 659.25, dur: duration_1, start: delay * 3 },
            { freq: 587.33, dur: duration_1, start: delay * 4 },
            { freq: 554.37, dur: duration_1, start: delay * 5 },
            { freq: 493.88, dur: duration_1, start: delay * 6 },
            { freq: 440, dur: duration_2, start: delay * 7 }
        ], context);
    }

    function generateConfetti(delay_standard) {
        var confettiSettings = { target: 'my-canvas' };
        var confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();
        const clearId = setTimeout(() => { try { confetti.clear(); } catch (e) { /* ignore */ } }, delay_standard * 9);
        scheduledTimeouts.push(clearId);
        // show restart button instead of reloading
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) restartBtn.style.display = 'inline-block';
    }

    function restartQuiz() {
        stopAllSound();
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) restartBtn.style.display = 'none';
        const questionContainer = document.getElementById('question-container');
        if (questionContainer) questionContainer.textContent = '';
        const answerContainer = document.getElementById('answer-container');
        if (answerContainer) answerContainer.textContent = '';
        numberOfQuestions = parseInt(document.getElementById('questionCount')?.value) || 50;
        currentQuestion = null;
    }

    function generateRandomNumber(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    // generators
    function generateAdditionQuestion(allowNegatives) { const minNum = allowNegatives ? -20 : 0; const maxNum = 20; const num1 = generateRandomNumber(minNum, maxNum); const num2 = generateRandomNumber(minNum, maxNum); return { questionString: `${num1} + ${num2}`, answer: num1 + num2 }; }
    function generateMultiplicationQuestion(allowNegatives) { const minNum = allowNegatives ? -12 : 0; const maxNum = 12; const num1 = generateRandomNumber(minNum, maxNum); const num2 = generateRandomNumber(minNum, maxNum); return { questionString: `${num1} * ${num2}`, answer: num1 * num2 }; }
    function generateSquaringQuestion(allowNegatives) { const minNum = allowNegatives ? -12 : 0; const maxNum = 12; const num = generateRandomNumber(minNum, maxNum); return { questionString: `${num}^2`, answer: num * num }; }
    function generateSubtractionQuestion(allowNegatives) { const minNum = allowNegatives ? -20 : 0; const maxNum = 20; const num1 = generateRandomNumber(minNum, maxNum); const num2 = generateRandomNumber(minNum, maxNum); return { questionString: `${num1} - ${num2}`, answer: num1 - num2 }; }

    function generateDivisionQuestion(allowNegatives) {
        const minNum = allowNegatives ? -12 : 0; const maxNum = 12; let product1 = 0; let product2 = 1;
        do { product1 = generateRandomNumber(minNum, maxNum); product2 = generateRandomNumber(minNum, maxNum); } while (product2 === 0 && product1 === 0);
        const dividend = product1 * product2; const divisor = product2 !== 0 ? product2 : product1; const raw = dividend / divisor; return { questionString: `${dividend} ÷ ${divisor}`, answer: raw };
    }

    function generateSquareRootQuestion(allowNegatives) {
        const maxNum = 12; const num = generateRandomNumber(0, maxNum); if (allowNegatives) { if (Math.random() > 0.5) { const square = num * num * -1; return { questionString: `√${square}`, answer: `${num}i` }; } else { const square = num * num; return { questionString: `√${square}`, answer: num }; } } else { const square = num * num; return { questionString: `√${square}`, answer: num }; }
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

    if (muteCheckbox) { muteCheckbox.addEventListener('change', function () { if (muteCheckbox.checked) setMasterVolume(0); else setMasterVolume(Number(volumeSlider?.value || 0.1)); }); }
    if (volumeSlider) { volumeSlider.addEventListener('input', function () { if (muteCheckbox && muteCheckbox.checked) return; setMasterVolume(Number(volumeSlider.value)); }); setMasterVolume(Number(volumeSlider.value || 0.1)); }

    // Expose functions to the global scope
    window.engageQuiz = engageQuiz; window.checkAnswer = checkAnswer; window.restartQuiz = restartQuiz;
});
