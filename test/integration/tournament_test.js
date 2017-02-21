const path = require('path');
const staticPath = path.resolve(path.dirname(__dirname) + '/..');
const TournamentTestServer = require('./tournament_test_server');
const TournamentPage = require('./tournament_page');

const webdriver = require('selenium-webdriver');
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();
const expect = chai.expect;


describe('Tournament', function() {
  let driver;
  let tournamentPage;
  let port;
  let tournamentTestServer;
  const getNumberOfTeamsFromRounds = ({teamsPerMatch, numberOfRounds}) => Math.pow(teamsPerMatch, numberOfRounds);

  before(function() {
    port = 9876;
    tournamentTestServer = new TournamentTestServer();
    tournamentTestServer.init(staticPath, port);

    driver = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .build();

    return driver.getWindowHandle();
  });

  after(function() {
    tournamentTestServer.close();
    return driver.quit();
  });

  beforeEach(function() {
    tournamentTestServer.reset();
    tournamentPage = new TournamentPage(driver, port);
    tournamentPage.goAndWaitForNumberOfTeamsInput();
  });

  it('selects the correct winner of a single match tournament', function() {
    this.timeout(5000);
    const teamsPerMatch = 2;
    const numberOfRounds = 1;
    const numberOfTeams = getNumberOfTeamsFromRounds({teamsPerMatch, numberOfRounds});

    // This means Team 1 will always win.
    tournamentTestServer.setMatchScoreGetter(() => 1);

    tournamentPage.setTeamsPerMatch(teamsPerMatch);
    tournamentPage.setNumberOfTeams(numberOfTeams);
    tournamentPage.clickGoAndWaitForWinner();
    const winner = tournamentPage.getWinner();

    return expect(winner).to.eventually.equal('Team 1');
  });

  it('selects the correct winner of a tie break', function() {
    this.timeout(5000);
    const teamsPerMatch = 2;
    const numberOfRounds = 1;
    const numberOfTeams = getNumberOfTeamsFromRounds({teamsPerMatch, numberOfRounds});

    // This means all teams will tie, and we want the lowest ID to win.
    tournamentTestServer.setMatchScoreGetter(() => 1);

    // This means Tied Team 1 will have the lowest ID.
    tournamentTestServer.setTeamIdGetter(i => numberOfTeams - i - 1);
    tournamentTestServer.setTeamNameGetter(i => `Tied Team ${i}`);
    tournamentTestServer.setTeamScoreGetter(() => 1);

    tournamentPage.setTeamsPerMatch(teamsPerMatch);
    tournamentPage.setNumberOfTeams(numberOfTeams);
    tournamentPage.clickGoAndWaitForWinner();
    const winner = tournamentPage.getWinner();

    return expect(winner).to.eventually.equal('Tied Team 1');
  });

  it('selects the correct winner of a 4 round tournament', function() {
    this.timeout(5000);
    const teamsPerMatch = 2;
    const numberOfRounds = 4;
    const numberOfTeams = getNumberOfTeamsFromRounds({teamsPerMatch, numberOfRounds});

    // This means Team 12 will always win.
    tournamentTestServer.setMatchScoreGetter(() => 12);

    tournamentPage.setTeamsPerMatch(teamsPerMatch);
    tournamentPage.setNumberOfTeams(numberOfTeams);
    tournamentPage.clickGoAndWaitForWinner();
    const winner = tournamentPage.getWinner();
    return expect(winner).to.eventually.equal('Team 12');
  });

  it('uses the server winning score to determine the winner', function() {
    this.timeout(5000);
    const teamsPerMatch = 2;
    const numberOfRounds = 4;
    const numberOfTeams = getNumberOfTeamsFromRounds({teamsPerMatch, numberOfRounds});

    // This means ultimately Team 8 will always win.
    tournamentTestServer.setWinningScoreGetter(teamScores => {
      const targetScore = 8;
      return teamScores.indexOf(targetScore) >= 0 ? targetScore : teamScores.pop();
    });

    tournamentPage.setTeamsPerMatch(teamsPerMatch);
    tournamentPage.setNumberOfTeams(numberOfTeams);
    tournamentPage.clickGoAndWaitForWinner();

    const winner = tournamentPage.getWinner();
    return expect(winner).to.eventually.equal('Team 8');
  });

  it('uses the server team name to determine the winner', function() {
    this.timeout(5000);
    const teamsPerMatch = 2;
    const numberOfRounds = 4;
    const numberOfTeams = getNumberOfTeamsFromRounds({teamsPerMatch, numberOfRounds});

    tournamentTestServer.setTeamNameGetter((index, teamId) => `Alternate Team Name ${teamId}`);

    // This means Team 3 will always win.
    tournamentTestServer.setMatchScoreGetter(() => 3);

    tournamentPage.setTeamsPerMatch(teamsPerMatch);
    tournamentPage.setNumberOfTeams(numberOfTeams);
    tournamentPage.clickGoAndWaitForWinner();
    const winner = tournamentPage.getWinner();
    return expect(winner).to.eventually.equal('Alternate Team Name 3');
  });

  it('uses the server team score to determine the winner', function() {
    this.timeout(5000);
    const teamsPerMatch = 2;
    const numberOfRounds = 4;
    const numberOfTeams = getNumberOfTeamsFromRounds({teamsPerMatch, numberOfRounds});

    tournamentTestServer.setTeamScoreGetter((index, teamId) => teamId * 10);
    // This means Team 9 will always win.
    tournamentTestServer.setMatchScoreGetter(() => 93);

    tournamentPage.setTeamsPerMatch(teamsPerMatch);
    tournamentPage.setNumberOfTeams(numberOfTeams);
    tournamentPage.clickGoAndWaitForWinner();
    const winner = tournamentPage.getWinner();
    return expect(winner).to.eventually.equal('Team 9');
  });

  it('handles larger values of teamsPerMatch', function() {
    this.timeout(5000);
    const teamsPerMatch = 3;
    const numberOfRounds = 4;
    const numberOfTeams = getNumberOfTeamsFromRounds({teamsPerMatch, numberOfRounds});

    // This means Team 8 will always win.
    tournamentTestServer.setMatchScoreGetter(() => 8);

    tournamentPage.setTeamsPerMatch(teamsPerMatch);
    tournamentPage.setNumberOfTeams(numberOfTeams);
    tournamentPage.clickGoAndWaitForWinner();
    const winner = tournamentPage.getWinner();
    return expect(winner).to.eventually.equal('Team 8');
  });
});
