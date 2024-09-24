import { useReplays } from "./ReplaysContext";
// import { getDemosInflicted, getDemosTaken } from "./utils";
import { wrappedUtils } from "./utils";

function DateStats() {
  const { replays, playerName } = useReplays();

  function groupReplaysByDate() {
    const dateGroups = {};
    replays.forEach((replay) => {
      const date = wrappedUtils.splitReplayDate(replay);
      if (!dateGroups[date]) {
        dateGroups[date] = [];
      }
      dateGroups[date].push(replay);
    });
    return dateGroups;
  }

  function groupWinsByDate(dateGroups) {
    const winsByDate = {};
    for (const date in dateGroups) {
      winsByDate[date] = dateGroups[date].reduce((count, replay) => {
        return (
          count + (wrappedUtils.isPlayerWinner(replay, playerName) ? 1 : 0)
        );
      }, 0);
    }
    return winsByDate;
  }

  function dateWithMostWins(winsByDate) {
    return Object.entries(winsByDate).reduce(
      (acc, [date, wins]) => {
        if (wins > acc.maxVal) {
          acc.maxVal = wins;
          acc.maxKeys = [date];
        } else if (wins === acc.maxVal) {
          acc.maxKeys.push(date);
        }
        return acc;
      },
      { maxVal: 0, maxKeys: [] }
    );
  }

  // look over this function
  const dateWithMostReplays = (dateGroups) => {
    return Object.entries(dateGroups).reduce(
      (acc, [date, replays]) => {
        console.log("acc:", acc);
        console.log("date:", date);
        console.log("acc:", replays);
        const count = replays.length;
        if (count > acc.maxVal) {
          acc.maxVal = count;
          acc.maxKeys = [date];
        } else if (count === acc.maxVal) {
          acc.maxKeys.push(date);
        }
        return acc;
      },
      { maxVal: 0, maxKeys: [] }
    );
  };

  function formatDateWithMostWins() {
    const dateGroups = groupReplaysByDate(replays);
    const winsByDate = groupWinsByDate(dateGroups);
    const { maxVal, maxKeys } = dateWithMostWins(winsByDate);

    return (
      "date(s) with most wins: " +
      maxKeys
        .map((key) => {
          const keyDate = new Date(key).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return `${keyDate}, with ${maxVal} wins`;
        })
        .join(", ")
    );
  }

  function getAllWinStreaks() {
    let currentStreak = 0;
    const streaks = {};
    let id = 0;

    // replays.map((replay) => {
    //   console.log("replay", replay);
    // });

    replays.reverse().forEach((replay) => {
      const date = wrappedUtils.splitReplayDate(replay);
      // console.log(replay.data.date);
      if (!wrappedUtils.isPlayerWinner(replay, playerName)) {
        // if loss

        // record streak before resetting
        if (`${id}` in streaks) {
          // if loss is the end of a streak

          // streaks[`${id}`].endDate = replay.data.date;
          streaks[`${id}`].endDate = date;
          streaks[`${id}`].winStreak = currentStreak;
        } else {
          // first game is loss or first game after end of streak is another loss

          streaks[`${id}`] = {};
          // streaks[`${id}`].endDate = replay.data.date;
          streaks[`${id}`].endDate = date;
          streaks[`${id}`].winStreak = currentStreak;
        }

        // reset streak counter
        currentStreak = 0;
        id++;
      } else {
        // if a win

        if (currentStreak < 1) {
          // on first win of win streak

          // will always need new obj created for id in this case
          streaks[`${id}`] = {};
          // record start date
          // streaks[`${id}`].startDate = replay.data.date;
          streaks[`${id}`].startDate = date;
        }
        // increase streak
        currentStreak++;
      }
    });
    // console.log("all streaks:", streaks);
    return streaks;
  }

  function getHighestWinStreak(winStreaks) {
    let maxWinStreak = -Infinity;
    let objectsWithMaxWinStreak = [];

    for (const id in winStreaks) {
      if (winStreaks[id].winStreak > maxWinStreak) {
        maxWinStreak = winStreaks[id].winStreak;
        objectsWithMaxWinStreak = [winStreaks[id]];
      } else if (winStreaks[id].winStreak === maxWinStreak) {
        objectsWithMaxWinStreak.push(winStreaks[id]);
      }
    }

    return { maxWinStreak, objectsWithMaxWinStreak };
  }

  function formatHighestWinStreak() {
    const winStreaks = getAllWinStreaks();
    const { maxWinStreak, objectsWithMaxWinStreak } =
      getHighestWinStreak(winStreaks);

    return (
      "largest win streak(s): " +
      maxWinStreak +
      " " +
      "wins " +
      objectsWithMaxWinStreak
        .map((obj) => {
          const startDate = new Date(obj.startDate).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          );
          const endDate = new Date(obj.endDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return `from ${startDate} to ${endDate}.`;
        })
        .join(", ")
    );
  }

  function avgGamesPlayedPerSession() {
    const dateGroups = groupReplaysByDate(replays);
    // console.log("date groups arr:", dateGroups);

    let gamesPlayed = [];
    Object.entries(dateGroups).forEach((date) => {
      // console.log("date", date[1].length);
      gamesPlayed.push(date[1].length);
    });

    // console.log("games played:", gamesPlayed);

    const sum = gamesPlayed.reduce((sum, date) => sum + date, 0);
    const avg = sum / gamesPlayed.length;
    return avg.toFixed(2);
  }

  function avgGamesPlayedPerDay() {
    const dateGroups = groupReplaysByDate(replays);
    // console.log("date groups arr:", dateGroups);

    const dates = Object.keys(dateGroups).sort();
    const firstDate = new Date(dates[0]);
    const lastDate = new Date(dates[dates.length - 1]);

    let currentDate = new Date(firstDate);
    let gamesPlayed = [];

    while (currentDate <= lastDate) {
      const dateString = currentDate.toISOString().split("T")[0];
      if (dateGroups[dateString]) {
        gamesPlayed.push(dateGroups[dateString].length);
      } else {
        gamesPlayed.push(0);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // console.log("games played:", gamesPlayed);

    const sum = gamesPlayed.reduce((sum, games) => sum + games, 0);
    const avg = sum / gamesPlayed.length;
    return avg.toFixed(2);
  }

  function formatDateWithMostReplays() {
    const dateGroups = groupReplaysByDate(replays);
    const { maxVal, maxKeys } = dateWithMostReplays(dateGroups);

    return (
      "date(s) with most played games: " +
      maxKeys
        .map((key) => {
          // add time zone to prevent subtracting a day from date
          const keyDate = new Date(key + "T00:00:00").toLocaleDateString(
            "en-US",
            {
              timeZone: "UTC",
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          );
          return `${keyDate}, with ${maxVal} games`;
        })
        .join(", ")
    );
  }

  return (
    <div>
      <h2>Date Stats</h2>
      <br />
      {formatHighestWinStreak()}
      <br />
      <br />
      average ranked games played per session: {avgGamesPlayedPerSession()}
      <br />
      <br />
      average ranked games played per day: {avgGamesPlayedPerDay()}
      <br />
      <br />
      {formatDateWithMostReplays()}
      <br />
      <br />
      {formatDateWithMostWins()}
    </div>
  );
}

export default DateStats;
