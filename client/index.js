document.addEventListener('DOMContentLoaded', () => {
  document.querySelector(C.START_BUTTON).addEventListener('click', async () => {
    const teamsPerMatch = document.querySelector(C.TEAMS_PER_MATCH_FIELD);
    const numberOfTeams = document.querySelector(C.NUMBER_OF_TEAMS_FIELD);

    const api = new Fetch();
    const newTournament = new Tournament(teamsPerMatch.value, numberOfTeams.value, api);
    await newTournament.run();
    console.log('Done');
  })
});