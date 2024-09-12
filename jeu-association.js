// Variables pour la gestion du jeu
let selectedSemestre = null;
let selectedNiveau = null;
let questions = [];
let currentSet = [];
let errors = 0;
let correctAnswers = 0;
let matchesMade = 0;
let timer = 30;
let timerInterval;
let score = 0;

// Sélection des éléments DOM
const semestreButtons = document.querySelectorAll('.semestre-btn');
const niveauButtons = document.querySelectorAll('.niveau-btn');
const sousNiveauxMenu = document.getElementById('sous-niveaux');
const gameContainer = document.getElementById('game-container');
const startButtonContainer = document.getElementById('start-game'); // À ajouter dans HTML si manquant
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const replayButton = document.getElementById('replay-btn');
const shareButton = document.getElementById('share-btn');

// Partie 1 : Sélection du semestre et affichage des sous-niveaux
semestreButtons.forEach(button => {
    button.addEventListener('click', function() {
        semestreButtons.forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
        selectedSemestre = this.dataset.semestre;
        sousNiveauxMenu.classList.remove('hidden'); // Affiche les sous-niveaux après la sélection du semestre
    });
});

// Partie 2 : Sélection du sous-niveau et affichage du bouton "Démarrer"
niveauButtons.forEach(button => {
    button.addEventListener('click', function() {
        niveauButtons.forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
        selectedNiveau = this.dataset.niveau;
        startButtonContainer.classList.remove('hidden'); // Montre le bouton "Démarrer" après la sélection du sous-niveau
    });
});

// Partie 3 : Fonction pour démarrer le jeu
document.getElementById('start-btn').addEventListener('click', function() {
    startButtonContainer.classList.add('hidden'); // Cacher le bouton "Démarrer"
    sousNiveauxMenu.classList.add('hidden'); // Cacher le menu sous-niveau
    document.getElementById('semesters').classList.add('hidden'); // Cacher le menu semestre
    gameContainer.classList.remove('hidden'); // Affiche la zone de jeu
    loadQuestions(); // Charge et lance le jeu
});

// Partie 4 : Démarrage du timer du jeu
function startTimer() {
    timerInterval = setInterval(() => {
        timer--;
        timerDisplay.textContent = `Temps restant : ${timer} sec`;

        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame(); // Termine le jeu si le temps est écoulé
        }
    }, 1000);
}

// Partie 5 : Chargement des questions et démarrage du jeu
async function loadQuestions() {
    const response = await fetch(`data-lexique/lexique_S${selectedSemestre}_U${selectedNiveau}.csv`);
    const data = await response.text();
    const lines = data.split('\n').filter(line => line.trim() !== '');

    questions = lines.slice(1).map(line => {
        const [text, audioFile, imageFile] = line.split(',');
        return {
            imageFile: imageFile || null,
            audioFile: audioFile || null,
            text: text || null
        };
    });

    startGame(); // Lancer le jeu après chargement des questions
}

// Partie 6 : Initialisation et mise en place du jeu
function startGame() {
    errors = 0;
    matchesMade = 0;
    correctAnswers = 0;
    score = 0;
    timer = 30;
    scoreDisplay.textContent = `Score : ${score}`;
    currentSet = getRandomSet(5);
    renderColumns();
    startTimer(); // Démarre le timer du jeu
}

// Partie 7 : Fonction pour obtenir un set aléatoire de questions
function getRandomSet(number) {
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, number);
}

// Partie 8 : Affichage des colonnes de jeu
function renderColumns() {
    const leftColumn = document.getElementById('column-left');
    const rightColumn = document.getElementById('column-right');
    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    currentSet.forEach((item, index) => {
        const leftItem = document.createElement('div');
        leftItem.classList.add('item');

        if (item.imageFile) {
            leftItem.innerHTML = `<img src="${item.imageFile}" alt="Image" width="100">`;
        } else if (item.audioFile) {
            leftItem.innerHTML = `<audio controls src="${item.audioFile}"></audio>`;
        }
        leftItem.dataset.index = index;
        leftColumn.appendChild(leftItem);
    });

    const shuffledAnswers = [...currentSet].sort(() => Math.random() - 0.5);
    shuffledAnswers.forEach((item, index) => {
        const rightItem = document.createElement('div');
        rightItem.classList.add('item');
        rightItem.textContent = item.text || "Ouuuups! Pas de texte disponible";
        rightItem.dataset.index = currentSet.indexOf(item);
        rightColumn.appendChild(rightItem);
    });

    addClickHandlers();
}

// Partie 9 : Gestion des clics dans le jeu
function addClickHandlers() {
    let selectedLeft = null;
    let selectedRight = null;

    document.querySelectorAll('#column-left .item').forEach(item => {
        item.addEventListener('click', function() {
            if (selectedLeft) selectedLeft.classList.remove('selected');
            selectedLeft = item;
            selectedLeft.classList.add('selected');
            checkMatch();
        });
    });

    document.querySelectorAll('#column-right .item').forEach(item => {
        item.addEventListener('click', function() {
            if (selectedRight) selectedRight.classList.remove('selected');
            selectedRight = item;
            selectedRight.classList.add('selected');
            checkMatch();
        });
    });

    function checkMatch() {
        if (selectedLeft && selectedRight) {
            const leftIndex = selectedLeft.dataset.index;
            const rightIndex = selectedRight.dataset.index;

            if (leftIndex === rightIndex) {
                matchesMade++;
                correctAnswers++;
                score++;
                scoreDisplay.textContent = `Score : ${score}`;
                selectedLeft.classList.add('correct');
                selectedRight.classList.add('correct');
                selectedLeft.classList.add('disabled');
                selectedRight.classList.add('disabled');

                if (matchesMade === 5) {
                    currentSet = getRandomSet(5);
                    renderColumns();
                }
            } else {
                errors++;
                selectedLeft.classList.add('incorrect');
                selectedRight.classList.add('incorrect');
                setTimeout(() => {
                    selectedLeft.classList.remove('incorrect');
                    selectedRight.classList.remove('incorrect');
                }, 500);
            }

            selectedLeft.classList.remove('selected');
            selectedRight.classList.remove('selected');
            selectedLeft = null;
            selectedRight = null;
        }
    }
}

// Partie 10 : Fin du jeu
function endGame() {
    clearInterval(timerInterval);
    document.getElementById('score-popup').classList.remove('hidden');
}
