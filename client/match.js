class Match {
  static async getWinner(matchUp, tournamentId, round, teamsManager) {
    let teamScores = [];
    let teams = [];
    let team = {};
    let winningTeam = 0;
    let matchScore = await Fetch.findMatch(tournamentId, round, matchUp.match);

    for (let id of matchUp.teamIds) {
      if (round === 0) {
        team = await teamsManager.fetchTeams(tournamentId, id);
        teamsManager.addTeam(team);
      } else {
        team = teamsManager.findTeam(id);
      }
      teams.push(team);
      teamScores.push(team.score);
    };

    winningTeam = await Match.fetchtWinningTeam(tournamentId, teamScores, matchScore.score, teams);

    return winningTeam;
  }

  static async fetchtWinningTeam(tournamentId, teamScores, matchScore, teams) {
    const winningScore =
      await Fetch.findWinner(tournamentId, Fetch.serialize(teamScores), matchScore);
    return Match.findWinner(winningScore.score, teams);
  }

  static findWinner(score, teams) {
    let winningTeams = [];
    for (let team of teams) {
      team.score === score ? winningTeams.push(team.id) : null;
    }
    return winningTeams.length > 1 ? Math.min(...winningTeams) : winningTeams[0];
  }
}
