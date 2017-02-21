const {TournamentController, TournamentApp} = require('../../server/tournament_server');
const {TournamentManager} = require('../../server/tournament');

class TournamentTestServer {
  constructor() {
    this.createTournamentOptions = {};
    this.server = null;
  }

  init(staticPath, port) {
    const getDelay = () => 0;
    const tournamentManager = new TournamentManager();
    const getTournament = (teamsPerMatch, numberOfTeams) => tournamentManager.createTournament(teamsPerMatch, numberOfTeams, this.createTournamentOptions);

    const tournamentController = new TournamentController(tournamentManager, getTournament);
    this.server = new TournamentApp(staticPath, getDelay, tournamentController);
    this.server.init(port);
  }

  close() {
    this.server.close();
  }

  reset() {
    this.createTournamentOptions = {
      getTeamName: function (index, teamId) {
        return `Team ${teamId}`;
      },
      getTeamScore: function (index, teamId) {
        return teamId;
      }
    };
  }

  setTeamNameGetter(fn) {
    this.createTournamentOptions.getTeamName = fn;
  }

  setTeamIdGetter(fn) {
    this.createTournamentOptions.getTeamId = fn;
  }

  setTeamScoreGetter(fn) {
    this.createTournamentOptions.getTeamScore = fn;
  }

  setMatchScoreGetter(fn) {
    this.createTournamentOptions.getMatchScore = fn;
  }

  setWinningScoreGetter(fn) {
    this.createTournamentOptions.getWinningScore = fn;
  }
}

module.exports = TournamentTestServer;
