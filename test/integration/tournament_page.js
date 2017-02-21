const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;

class TournamentPage {
  constructor(driver, port) {
    this.driver = driver;
    this.url = 'http://localhost:' + port + '/';
    this.teamsPerMatchInputSelector = By.id('teamsPerMatch');
    this.numberOfTeamsInputSelector = By.id('numberOfTeams');
    this.startButtonSelector = By.id('start');
    this.winnerSelector = By.id('winner');
  }

  goAndWaitForNumberOfTeamsInput() {
    this.driver.get(this.url);
    return this.driver.wait(until.elementLocated(this.startButtonSelector), 2000);
  }

  setTeamsPerMatch(teamsPerMatch) {
    return this.driver.findElement(this.teamsPerMatchInputSelector).sendKeys(teamsPerMatch);
  }

  setNumberOfTeams(numberOfTeams) {
    return this.driver.findElement(this.numberOfTeamsInputSelector).sendKeys(numberOfTeams);
  }

  clickGoAndWaitForWinner() {
    this.driver.findElement(this.startButtonSelector).click();
    this.driver.wait(until.elementLocated(this.winnerSelector), 2000);
    const winnerElement = this.driver.findElement(this.winnerSelector);
    return this.driver.wait(until.elementTextMatches(winnerElement, /.+/), 2000);
  }

  getWinner() {
    return this.driver.findElement(this.winnerSelector).getText();
  }
}

module.exports = TournamentPage;
