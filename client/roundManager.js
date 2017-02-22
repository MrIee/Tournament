class RoundManager {
  constructor(tournamentId, currentMatchUps, teamsPerMatch, teamsManager, render) {
    this.teamsManager = teamsManager;
    this.render = render;
    this.tournamentId = tournamentId;
    this.teamsPerMatch = teamsPerMatch;
    this.currentMatchUps = currentMatchUps;
    this.nextMatchUps = [];
    this.round = 0;
    this.matchNo = 0;
    this.winner = 0;
  }

  async runMatchUps() {
    let winners = [];

    for (let matchUp of this.currentMatchUps) {
      this.winner = await Match.getWinner(matchUp, this.tournamentId, this.round, this.teamsManager);
      this.render.fillMatch();
      winners.push(this.winner);

      if (winners.length === this.teamsPerMatch) {
        this.createNewMatch(winners);
        winners = [];
        if (((this.matchNo + 1) === this.currentMatchUps.length) ||
          ((this.matchNo + 1) === this.currentMatchUps.length / this.teamsPerMatch)) {
            await this.processEndOfRound();
        } else {
          this.matchNo++;
        }
      }
    }
  }

  createNewMatch(winners) {
    this.nextMatchUps.push(
      Object.assign(
        {},
        {
          match: this.matchNo,
          teamIds: winners
        }
      )
    );
  }

  async processEndOfRound() {
    this.matchNo = 0;
    this.currentMatchUps = this.nextMatchUps;
    this.nextMatchUps = [];
    this.round++;
    await this.runMatchUps(this.currentMatchUps);
  }
}
