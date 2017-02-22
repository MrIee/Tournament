document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById(C.START_BUTTON_ID);
  const teamsPerMatch = document.getElementById(C.TEAMS_PER_MATCH_ID);
  const numberOfTeams = document.getElementById(C.NUMBER_OF_TEAMS_ID);

  const submitOnEnter = (e) => {
    if (e.which === 13) {
      startButton.click();
    }
  }

  teamsPerMatch.addEventListener('keyup', submitOnEnter);
  numberOfTeams.addEventListener('keyup', submitOnEnter);

  startButton.addEventListener('click', async () => {
    const newTournament =
      new Tournament(parseInt(teamsPerMatch.value), parseInt(numberOfTeams.value));
    await newTournament.run();
    console.log('Done');
  })
});