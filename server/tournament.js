const TeamNameGenerator = require('./teamNameGenerator');

const TOURNAMENT_ERROR_TYPE = {
  INVALID: 'INVALID',
  NOT_FOUND: 'NOT_FOUND'
};

class TournamentManager {
  constructor() {
    this.tournaments = [];
  }

  createTournament(teamsPerMatch, numberOfTeams, options = {}) {
    const teamNameGenerator = TeamNameGenerator.create();

    let defaultOptions = {
      getWinningScore: ((teamScores, matchScore) => teamScores.sort((a, b) => Math.abs(a - matchScore) - Math.abs(b - matchScore)).shift()),
      getTeamName: () => teamNameGenerator.next(),
      getTeamId: index => index,
      getTeamScore: () => Math.round(Math.random() * 100),
      getMatchScore: () => Math.round(Math.random() * 100)
    };

    return Tournament.create(numberOfTeams, teamsPerMatch, Object.assign(defaultOptions, options));
  }

  addTournament(tournament) {
    const tournamentId = this.tournaments.length;
    this.tournaments.push(tournament);
    return tournamentId;
  }

  getTournament(tournamentId) {
    tournamentId = Math.floor(tournamentId || undefined);

    if (isNaN(tournamentId)) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.INVALID, 'Looks like you\'re missing a tournament ID');
    }
    const tournament = this.tournaments[tournamentId];
    if (tournament == null) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.NOT_FOUND, 'Are you sure that\'s the right tournament ID?');
    }
    return tournament;
  }
}

class Tournament {
  constructor(teams, matches, firstRoundMatchUps, getWinningScore, teamsPerMatch) {
    this.teams = teams;
    this.matches = matches;
    this.firstRoundMatchUps = firstRoundMatchUps;
    this.getWinningScore = getWinningScore;
    this.teamsPerMatch = teamsPerMatch;
  }

  static create(numberOfTeams, teamsPerMatch, options) {
    const {getTeamName, getTeamId, getTeamScore, getMatchScore, getWinningScore} = options;
    teamsPerMatch = Math.floor(teamsPerMatch || undefined);
    numberOfTeams = Math.floor(numberOfTeams || undefined);

    if (isNaN(teamsPerMatch)) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.INVALID, 'Oops, you forgot to give me the teams per match');
    }

    if (teamsPerMatch <= 1) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.INVALID, `Can\'t run a tournament with 1 or fewer teams per match, and you tried with ${teamsPerMatch}`);
    }

    if (isNaN(numberOfTeams)) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.INVALID, 'Oops, you forgot to give me the number of teams in the tournament');
    }

    const numberOfRounds = this.getNumberOfRounds(teamsPerMatch, numberOfTeams);

    if (numberOfRounds == null || numberOfRounds <= 0) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.INVALID, 'Wait... you can\'t make a knockout tournament with that number of teams');
    }

    const teams = [];
    for (let i = 0; i < numberOfTeams; i++) {
      const teamId = getTeamId(i);
      teams.push(new Team(teamId, getTeamName(i, teamId), getTeamScore(i, teamId)));
    }

    const matches = [];
    let numberOfMatchesThisRound = numberOfTeams;
    for (let round = 0; round < numberOfRounds; round++) {
      matches[round] = [];
      numberOfMatchesThisRound /= teamsPerMatch;
      for (let match = 0; match < numberOfMatchesThisRound; match++) {
        matches[round].push(new Match(getMatchScore(round, match)));
      }
    }

    const teamsInMatchUp = [];
    const firstRoundMatchUps = [];

    for (let j = 0; j < teams.length; j++) {
      teamsInMatchUp.push(teams[j].teamId);
      if (teamsInMatchUp.length === teamsPerMatch) {
        firstRoundMatchUps.push({
          match: firstRoundMatchUps.length,
          teamIds: teamsInMatchUp.splice(0)
        });
      }
    }

    return new Tournament(teams, matches, firstRoundMatchUps, getWinningScore, teamsPerMatch);
  }

  // This is a long way of doing Math.log(numberOfTeams) / Math.log(teamsPerMatch).
  // Because floating point in JS, Math.log(9) / Math.log(3) => 2.0000000000000004
  // We need to be guaranteed an integer to know if the server should error.
  static getNumberOfRounds(teamsPerMatch, numberOfTeams) {
    let rounds = 1;
    let teamCount;

    for(teamCount = teamsPerMatch; teamCount < numberOfTeams; teamCount *= teamsPerMatch) {
      rounds++;
    }

    return teamCount === numberOfTeams
        ? rounds
        : null;
  }

  getMatchUps() {
    return this.firstRoundMatchUps;
  };

  getWinner(teamScores, matchScore) {
    if (!Array.isArray(teamScores) || teamScores.length !== this.teamsPerMatch) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.INVALID, 'You need to give me the scores for all teams - no more, no less');
    }

    teamScores = teamScores.map(teamScore => Math.floor(teamScore || undefined));
    if (teamScores.some(isNaN)) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.INVALID, 'Whoa, those scores don\'t look right');
    }
    matchScore = Math.floor(matchScore || undefined);
    if (isNaN(matchScore)) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.INVALID, 'I can\'t very well tell you the winner without the match score!');
    }

    return {
      score: this.getWinningScore(teamScores, matchScore)
    };
  }

  getTeam(teamId) {
    teamId = Math.floor(teamId || undefined);
    if (isNaN(teamId)) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.INVALID, 'Hmm, I think you were supposed to give me a team ID');
    }
    const team = this.teams.filter(team => team.teamId === teamId).shift();

    if (team == null) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.NOT_FOUND, 'I can\'t find that team anywhere!');
    }

    return team;
  }

  getMatch(round, match) {
    round = Math.floor(round || undefined);
    match = Math.floor(match || undefined);

    if (isNaN(round) || isNaN(match)) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.INVALID, 'For me to give up the match data, you need to tell me the round and match numbers');
    }

    if (!this.matches[round]) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.NOT_FOUND, 'That round does not exist in this tournament');
    }

    if (!this.matches[round][match]) {
      throw new TournamentError(TOURNAMENT_ERROR_TYPE.NOT_FOUND, 'That match does not exist in this round');
    }

    return this.matches[round][match];
  }
}

class Team {
  constructor(teamId, name, score) {
    this.teamId = teamId;
    this.name = name;
    this.score = score;
  }
}

class Match {
  constructor(score) {
    this.score = score;
  }
}

class TournamentError {
  constructor(type, message) {
    this.type = type;
    this.message = message;
  }
}

module.exports = {TournamentManager, TournamentError, TOURNAMENT_ERROR_TYPE};
