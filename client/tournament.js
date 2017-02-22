class Tournament {
  constructor(teamsPerMatch, numberOfTeams) {
    this.teamsPerMatch = teamsPerMatch;
    this.numberOfTeams = numberOfTeams;
  }

  async run() {
    const render = new Render(this.getRounds());
    render.reset();
    render.drawMatches();

    const newTournament = await Fetch.createTournament(this.teamsPerMatch, this.numberOfTeams);
    const tournamentId = newTournament.tournamentId;
    const currentMatchUps = newTournament.matchUps;

    const teamsManager = new TeamsManager();
    const roundManager =
      new RoundManager(tournamentId, currentMatchUps, this.teamsPerMatch, teamsManager, render);

    await roundManager.runMatchUps();

    const winner = teamsManager.findTeam(roundManager.winner);
    render.drawWinner(winner.name);
  }

  getRounds() {
    let rounds = [];
    let numberOfTeams = this.numberOfTeams;

    while(numberOfTeams % this.teamsPerMatch === 0) {
      numberOfTeams /= this.teamsPerMatch;

      let round = [];
      for (let i = 0; i < numberOfTeams; i++ ) {
        round.push(i);
      }
      rounds.push(round);
    }

    return rounds;
  }
}
