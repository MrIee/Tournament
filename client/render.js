class Render {
  constructor(rounds) {
    this.rounds = rounds;
    this.matchNo = 0;
    this.tournamentBody = document.getElementById(C.TOURNAMENT_ELEMENT_ID);
  }

  drawMatches() {
    let matchNo = 0;

    for(let round of this.rounds) {
      let roundDiv = document.createElement('div');
      roundDiv.className = 'tournament__round';
      this.tournamentBody.appendChild(roundDiv);

      for (let match of round) {
        let matchDiv = document.createElement('div');
        matchDiv.setAttribute('id', `match ${matchNo}`)
        matchDiv.className = 'tournament__match';
        roundDiv.appendChild(matchDiv);
        matchNo++;
      }
    }
  }

  fillMatch() {
    let matchDiv = document.getElementById(`match ${this.matchNo}`);
    matchDiv.className += ' tournament__match--filled';
    this.matchNo++;
  }

  drawWinner(winner) {
    let winnerElement = document.getElementById(C.WINNER_ELEMENT_ID);
    winnerElement.innerHTML = winner;
  }

  reset() {
    let winnerElement = document.getElementById(C.WINNER_ELEMENT_ID);
    winnerElement.innerHTML = '';
    while (this.tournamentBody.firstChild) {
      this.tournamentBody.removeChild(this.tournamentBody.firstChild);
    }
    this.matchNo = 0;
  }
}
