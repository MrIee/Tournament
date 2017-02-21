const url = require('url');
const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {TournamentError, TOURNAMENT_ERROR_TYPE} = require('./tournament');

class TournamentApp {
  constructor(staticPath, getDelay, tournamentController) {
    this.staticPath = staticPath;
    this.getDelay = getDelay;
    this.tournamentController = tournamentController;
    this.server = null;
  }

  init(port) {
    const app = express();

    // Static files
    app.get('/', (req, res) => res.sendFile(`${this.staticPath}/index.html`));
    app.use('/client', express.static(`${this.staticPath}/client`));
    app.use('/shared', express.static(`${this.staticPath}/shared`));

    // Tournament endpoints
    app.use(cors());
    app.use(bodyParser.urlencoded({extended: true}));

    app.post('/tournament', (req, res) => this.serve(res, this.tournamentController.createTournament(req.body)));
    app.get('/team', (req, res) => this.serve(res, this.tournamentController.findTeam(req.query)));
    app.get('/match', (req, res) => this.serve(res, this.tournamentController.findMatch(req.query)));
    app.get('/winner', (req, res) => this.serve(res, this.tournamentController.findWinner(req.query)));

    // Error handling
    app.use((err, req, res, next) => {
      if (err instanceof TournamentError) {
        this.serveError(res, TournamentController.handleError(err));
        return;
      }

      next(err);
    });

    this.server = app.listen(port, () => console.log(`server running on port ${port}`));
  }

  close() {
    this.server && this.server.close();
    this.server = null;
  }

  serve(res, data) {
    setTimeout(() => res.send(data), this.getDelay());
  }

  serveError(res, {status, data}) {
    res.status(status).send(data);
  }
}

class TournamentController {
  constructor(tournamentManager, getTournament) {
    this.tournamentManager = tournamentManager;
    this.getTournament = getTournament;
  }

  createTournament({teamsPerMatch, numberOfTeams}) {
    const tournament = this.getTournament(teamsPerMatch, numberOfTeams);
    const tournamentId = this.tournamentManager.addTournament(tournament);
    const matchUps = tournament.getMatchUps();
    return {tournamentId, matchUps};
  }

  findTeam({tournamentId, teamId}) {
    const tournament = this.tournamentManager.getTournament(tournamentId);
    return tournament.getTeam(teamId);
  }

  findMatch({tournamentId, round, match}) {
    const tournament = this.tournamentManager.getTournament(tournamentId);
    return tournament.getMatch(round, match);
  }

  findWinner({tournamentId, teamScores, matchScore}) {
    const tournament = this.tournamentManager.getTournament(tournamentId);
    return tournament.getWinner(teamScores, matchScore);
  }

  static handleError(err) {
    let status;
    switch (err.type) {
      case TOURNAMENT_ERROR_TYPE.INVALID:
        status = 400;
        break;
      case TOURNAMENT_ERROR_TYPE.NOT_FOUND:
      default:
        status = 404;
        break;
    }
    return {
      status,
      data: {
        message: err.message,
        error: true
      }
    };
  }
}

module.exports = {TournamentApp, TournamentController};
