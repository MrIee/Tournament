class Tournament {
  constructor(teamsPerMatch, numberOfTeams, api) {
    this.teamsPerMatch = parseInt(teamsPerMatch);
    this.numberOfTeams = parseInt(numberOfTeams);
    this.allTeams = [];
    this.tournamentId = 0;
    this.round = 0;
    this.matchNo = 0;
    this.numWinners = 0;
    this.winners = [];
    this.winner = 0;
    this.currentMatchUps = [];
    this.nextMatchUps = [];
  }

  async run() {
    this.currentMatchUps = await this.create();
    await this.runMatchUps();
    console.log('The winner is:\n', this.getTeamInfo(this.winner));
    console.log('---===== ******* TOURNAMENT IS FINISHED ******* =====---');
  }

  async runMatchUps() {
    for (let matchUp of this.currentMatchUps) {
      this.winner = await this.getMatchWinner(matchUp);
      this.winners.push(this.winner);
      this.numWinners++;

      if (this.numWinners === this.teamsPerMatch) {
        this.createNewMatch();

        if (((this.matchNo + 1) === this.currentMatchUps.length) ||
          ((this.matchNo + 1) === this.currentMatchUps.length / this.teamsPerMatch)) {
            await this.processEndOfRound();
        } else {
          this.matchNo++;
        }
      }
    }
  }

  createNewMatch() {
    this.nextMatchUps.push(
      Object.assign(
        {},
        {
          match: this.matchNo,
          teamIds: this.winners
        }
      )
    );
    this.winners = [];
    this.numWinners = 0;
  }

  async processEndOfRound() {
    this.matchNo = 0;
    this.currentMatchUps = this.nextMatchUps;
    this.nextMatchUps = [];
    console.log('------ END OF ROUND ', this.round);
    this.round++;
    console.log('this,currentMatchUps', this.currentMatchUps);
    await this.runMatchUps(this.currentMatchUps);
  }

  async getMatchWinner(matchUp) {
    let teamScores = [];
    let teams = [];
    let teamInfo = {};
    let winningTeam = 0;
    let matchScore = await this.getMatchScore(this.round, matchUp.match);

    for (let id of matchUp.teamIds) {
      if (this.round === 0) {
        teamInfo = await this.getTeamInfoAsync(id);
        this.allTeams.push(teamInfo);
      } else {
        teamInfo = this.getTeamInfo(id);
      }
      teams.push(teamInfo);
      teamScores.push(teamInfo.score);
    };

    console.log('Teams:\n', teams);
    console.log('Match score: ', matchScore);
    console.log('Team scores: ', teamScores);
    winningTeam = await this.getWinningTeam(teamScores, matchScore, teams);
    console.log('Winning team: ', winningTeam);

    return winningTeam;
  }

  async getWinningTeam(teamScores, matchScore, teams) {
    const winningScore = await this.getWinningScore(teamScores, matchScore);
    console.log('Winning score: ', winningScore);
    return this.findWinner(winningScore, teams);
  }

  findWinner(score, teams) {
    let winningTeams = [];
    for (let team of teams) {
      team.score === score ? winningTeams.push(team.teamId) : null;
    }
    return winningTeams.length > 1 ? Math.min(...winningTeams) : winningTeams[0];
  }

  getTeamInfo(id) {
    for (let team of this.allTeams) {
      if (team.teamId === id) {
        return team;
      }
    }
  }

  async create() {
    let newTournament = await Fetch.createTournament(this.teamsPerMatch, this.numberOfTeams);
    this.tournamentId = newTournament.tournamentId;
    return newTournament.matchUps;
  }

  async getTeamInfoAsync(teamId) {
    let team = await Fetch.findTeam(this.tournamentId, teamId);
    return team;
  }

  async getMatchScore(round, match) {
    let fetchedMatch = await Fetch.findMatch(this.tournamentId, round, match);
    return fetchedMatch.score;
  }

  async getWinningScore(teamScores, matchScore) {
    let winner = await Fetch.findWinner(this.tournamentId, Fetch.serialize(teamScores), matchScore);
    return winner.score;
  }
}
