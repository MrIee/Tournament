class Tournament {
  constructor(teamsPerMatch, numberOfTeams, teamsManager) {
    this.teamsPerMatch = teamsPerMatch;
    this.numberOfTeams = numberOfTeams;
    this.teamsManager = teamsManager;
  }

  async run() {
    const newTournament = await Fetch.createTournament(this.teamsPerMatch, this.numberOfTeams);
    const tournamentId = newTournament.tournamentId;
    const currentMatchUps = newTournament.matchUps;

    const roundManager =
      new RoundManager(tournamentId, currentMatchUps, this.teamsPerMatch, this.teamsManager);
    await roundManager.runMatchUps();

    console.log('The winner is:\n', this.teamsManager.findTeam(roundManager.winner));
    console.log('---===== ******* TOURNAMENT IS FINISHED ******* =====---');
  }
}
