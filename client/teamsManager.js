class Team {
  constructor(id, name, score) {
    this.id = id;
    this.name = name;
    this.score = score;
  }
}

class TeamsManager {
  constructor() {
    let allTeams = [];

    this.addTeam = (team) => allTeams.push(team);
    this.getAllTeams = () => allTeams;
    this.clear = () => allTeams = [];
  }

  findTeam(id) {
    for (let team of this.getAllTeams()) {
      if (team.id === id) {
        return team;
      }
    }
  }

  async fetchTeams(tournamentId, teamId) {
    let team = await Fetch.findTeam(tournamentId, teamId);
    return new Team(team.teamId, team.name, team.score);
  }
}
