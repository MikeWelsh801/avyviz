enum standards {
  US = "en-US",
}
enum timeZones {
  MST = "MST",
}

/**
 * @returns the current date in MM-DD-YYYY format
 */
function getTodaysDate(standard: standards, timeZone: timeZones) {
  let dateUSFormat = new Date().toLocaleDateString(standard, {
    timeZone: timeZone,
  });
  let slashRegex = new RegExp("/", "g");
  let formattedDate = dateUSFormat.replace(slashRegex, "-");
  return formattedDate;
}

export { getTodaysDate, standards, timeZones };
