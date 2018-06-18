class Match {
  constructor() {
    this.firstName;
    this.lastName;
    this.email;
    this.timer;
    this.scores;
    document.getElementById('congrats').style.visibility = 'hidden';
    this.addEvents();
  }
  addEvents() {
    document
      .getElementById('start')
      .addEventListener('click', () => this.startGame());
    document
      .getElementById('restart')
      .addEventListener('click', () => this.startGame());
    document
      .getElementById('apply')
      .addEventListener('click', () => this.applyEvent());
  }

  getDifficulty() {
    return Number(document.getElementById('difficulty').value);
  }
  getBack() {
    return document.getElementById('back').value;
  }
  generateCard(frontText) {
    const card = document.createElement('div');
    const front = document.createElement('figure');
    const back = document.createElement('figure');
    card.className = 'card';
    front.className = 'front';
    back.className = 'back';
    front.innerHTML = frontText;
    back.style.backgroundImage = `url(./assets/img/${this.getBack()}.jpg)`;
    card.append(front, back);

    return card;
  }
  generateDeck() {
    const KANJI_START = 0x4e00;
    const KANJI_END = 0x9faf;
    const deck = [];
    for (let i = 0; i < this.getDifficulty() / 2; i++) {
      const randomKanji = Math.floor(
        Math.random() * (KANJI_END - KANJI_START) + KANJI_START
      );
      const newCard = `&#${randomKanji}`;
      deck.push(newCard);
      deck.push(newCard);
    }
    return deck;
  }

  shufleDeck(deck) {
    let currentIndex = deck.length,
      temporaryValue,
      randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = deck[currentIndex];
      deck[currentIndex] = deck[randomIndex];
      deck[randomIndex] = temporaryValue;
    }
    return deck;
  }

  addGameField() {
    const gameField = document.createElement('div');
    gameField.className = 'gameField';
    gameField.id = 'gameField';
    this.shufleDeck(this.generateDeck()).forEach((e) =>
      gameField.appendChild(this.generateCard(e))
    );
    let oldField = document.getElementById('gameField');
    if (oldField) {
      oldField.innerHTML = gameField.innerHTML;
    } else document.getElementById('gameFieldWrapper').appendChild(gameField);
  }
  addGameLogic() {
    let that = this;
    const gameField = document.getElementById('gameField');
    gameField.addEventListener('click', clickHandler);
    const difficulty = this.getDifficulty() / 2;
    const congrats = this.congrats;
    let stack = [];
    let counter = difficulty;
    this.gameHandler = clickHandler;
    function clickHandler(e) {
      e.target.parentNode.classList.toggle('flipped');
      if (
        stack.length === 0 &&
        e.target.parentNode.className === 'card flipped'
      ) {
        stack.push(e.target.parentNode);
      } else if (
        isSameCard(stack[0], e.target.parentNode) &&
        stack[0] !== e.target.parentNode
      ) {
        sameHandler(stack[0], e.target.parentNode);
      } else {
        notSameHandler(stack[0], e.target.parentNode);
      }
      function isSameCard(first, second) {
        const firstValue = first.firstChild.innerHTML;
        const secondValue = second.firstChild.innerHTML;
        if (firstValue === secondValue) {
          return true;
        } else return false;
      }
      function notSameHandler(first, second) {
        setTimeout(() => {
          first.classList.toggle('flipped');
          second.classList.toggle('flipped');
          stack.length = 0;
        }, 700);
      }
      function sameHandler(first, second) {
        setTimeout(() => {
          first.classList.toggle('hide');
          second.classList.toggle('hide');
          stack.length = 0;
          counter--;
          if (counter === 0) congrats.call(that, clickHandler);
        }, 700);
      }
    }
  }
  congrats(event) {
    let time = document.getElementById('timer').innerHTML;
    document.getElementById('gameField').removeEventListener('click', event);
    clearInterval(this.timer);
    let scores = this.addScore(Number(time));
    this.renderScores(scores);
    this.updateScores(scores);
    document.getElementById('timer').innerHTML = '';
    document.getElementById('congrats').style.visibility = 'initial';
    document.getElementById('gameFieldWrapper').style.visibility = 'hidden';
  }
  applyEvent() {
    this.firstName = document.getElementById('firstName').value;
    this.lastName = document.getElementById('lastName').value;
    this.email = document.getElementById('email').value;
    let fullName = document.getElementById('fullName');
    this.setData(
      'lastAccount',
      JSON.stringify({
        first: this.firstName,
        last: this.lastName,
        email: this.email,
      })
    );
    document.getElementById('inputs').style.visibility = 'hidden';
    fullName.innerHTML = `Loged as ${this.firstName} ${this.lastName}`;
  }
  startTimer() {
    const timer = document.getElementById('timer');
    this.timer = setInterval(
      () => (timer.innerHTML = `${Number(timer.innerHTML) + 1}`),
      1000
    );
  }
  startGame() {
    this.getData('scores')
      .catch((e) => {
        if (e === 'no value') {
          this.setData('scores', JSON.stringify({ data: [] }));
          this.scores = [];
        }
      })
      .then((e) => {
        if (e) this.scores = JSON.parse(e).data;
      });

    let field = document.getElementById('gameField');
    if (field) field.removeEventListener('click', this.gameHandler);
    clearInterval(this.timer);
    document.getElementById('timer').innerHTML = '';
    this.addGameField();
    this.addGameLogic();
    this.startTimer.apply(this);
    //hide welcome message
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('congrats').style.visibility = 'hidden';
  }

  addScore(value) {
    let scores = [...this.scores];
    scores.push([
      [`${this.firstName}, ${this.lastName}`],
      value,
      this.getDifficulty(),
    ]);
    scores.sort((a, b) => a[1] - b[1]);
    if (scores.length > 10) scores.length = 10;
    return scores;
  }

  renderScores(scoresArr) {
    const scoreBoard = document.getElementById('scores');
    scoreBoard.innerHTML = '';
    scoreBoard.innerHTML = `
    <tr>
      <th>Full Name</th>
      <th>Time</th> 
      <th>Difficulty(cards)</th>
    </tr>`;
    scoresArr.forEach((e) => {
      const node = document.createElement('TR');
      node.innerHTML = `<td>${e[0]}</td><td>${e[1]}</td><td>${e[2]}</td>`;
      scoreBoard.appendChild(node);
    });
  }
  updateScores(scores) {
    this.scores = scores;
    this.setData('scores', JSON.stringify({ data: scores }));
  }

  setData(key, value) {
    return new Promise((resolve, reject) => {
      window.localStorage.setItem(key, value);
      resolve([key, value]);
    });
  }

  getData(key) {
    return new Promise((resolve, reject) => {
      let value = window.localStorage.getItem(key);
      if (value) {
        resolve(value);
      } else reject('no value');
    });
  }
}
