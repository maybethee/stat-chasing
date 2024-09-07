import { useReplays } from "./ReplaysContext";
// import { isPlayerWinner } from "./utils";
import { wrappedUtils } from "./utils";

function OvertimeStats() {
  const { replays, playerName } = useReplays();

  function formatOvertime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  const getOvertimes = () => {
    return replays.filter((replay) => wrappedUtils.getOvertimeSeconds(replay));
  };

  function overtimeGamesPercent() {
    const overtimePercent = (getOvertimes().length / replays.length) * 100;
    return overtimePercent.toFixed(2);
  }

  function overtimWinRate() {
    const overtimeWins = replays.filter((replay) => {
      const isWinner = wrappedUtils.isPlayerWinner(replay, playerName);
      const overtimeSeconds = wrappedUtils.getOvertimeSeconds(replay);
      return isWinner && overtimeSeconds > 0;
    });
    const winRate = overtimeWins.length / getOvertimes().length;
    return winRate.toFixed(2);
  }

  function longestOvertime() {
    const overtimes = getOvertimes().map((replay) =>
      parseInt(wrappedUtils.getOvertimeSeconds(replay), 10)
    );
    // console.log("Filtered Overtimes:", overtimes);
    const longestOvertimeSeconds = Math.max(...overtimes);
    return formatOvertime(longestOvertimeSeconds);
  }

  function longestOvertimeWin() {
    const overtimes = replays
      .filter((replay) => {
        const isWinner = wrappedUtils.isPlayerWinner(replay, playerName);
        const overtimeSeconds = wrappedUtils.getOvertimeSeconds(replay);
        return isWinner && overtimeSeconds > 0;
      })
      .map((replay) => {
        const overtimeSeconds = wrappedUtils.getOvertimeSeconds(replay);
        return parseInt(overtimeSeconds, 10);
      });

    // console.log("Filtered Overtimes:", overtimes);
    const longestOvertimeSeconds = Math.max(...overtimes);
    return formatOvertime(longestOvertimeSeconds);
  }

  function longestOvertimeLoss() {
    const overtimes = replays
      .filter((replay) => {
        const isLoser = !wrappedUtils.isPlayerWinner(replay, playerName);
        const overtimeSeconds = wrappedUtils.getOvertimeSeconds(replay);
        return isLoser && overtimeSeconds > 0;
      })
      .map((replay) => {
        const overtimeSeconds = wrappedUtils.getOvertimeSeconds(replay);
        return parseInt(overtimeSeconds, 10);
      });

    // console.log("Filtered Overtimes:", overtimes);
    const longestOvertimeSeconds = Math.max(...overtimes);
    return formatOvertime(longestOvertimeSeconds);
  }
  return (
    <div>
      <h2>Overtime Stats</h2>
      <br />

      <ul>
        <li>% games go to overtime: {overtimeGamesPercent()}</li>
        <li>longest overtime: {longestOvertime()}</li>
        <li>longest overtime win: {longestOvertimeWin()}</li>
        <li>longest overtime loss: {longestOvertimeLoss()}</li>
        <li>overtime win rate: {overtimWinRate()}</li>
      </ul>
    </div>
  );
}

export default OvertimeStats;
