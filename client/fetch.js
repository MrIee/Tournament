class Fetch {
  static serialize(arr) {
    let str = [];
    arr.forEach(e => {
      str.push(`${C.TEAMSCORES}=${encodeURIComponent(e)}`);
    });
    return str.join('&');
  }

  static async createTournament(teamsPerMatch, numberOfTeams) {
    let params = `teamsPerMatch=${teamsPerMatch}&numberOfTeams=${numberOfTeams}`;
    let req = new Request('/tournament', {
      method: 'POST',
      headers: { "Content-type": "application/x-www-form-urlencoded" },
      body: params,
    });

    try {
      let response = await fetch(req)
      return await response.json();
    } catch (err) {
      return err;
    }

    return false;
  }

  static async findTeam(tournamentId, teamId) {
    let params = `tournamentId=${tournamentId}&teamId=${teamId}`;
    let req = new Request(`/team?${params}`, { method: 'GET' });

    try {
      let response = await fetch(req)
      return await response.json();
    } catch (err) {
      return err;
    }

    return false;
  }

  static async findMatch(tournamentId, round, match) {
    let params = `tournamentId=${tournamentId}&round=${round}&match=${match}`;
    let req = new Request(`/match?${params}`, { method: 'GET' });

    try {
      let response = await fetch(req)
      return await response.json();
    } catch (err) {
      return err;
    }

    return false;
  }

  static async findWinner(tournamentId, teamScores, matchScore) {
    let params = `tournamentId=${tournamentId}&${teamScores}&matchScore=${matchScore}`;
    let req = new Request(`/winner?${params}`, { method: 'GET' });

    try {
      let response = await fetch(req)
      return await response.json();
    } catch (err) {
      return err;
    }

    return false;
  }
}
