enum AvalancheCenter {
  UAC = "UAC",
}

/**
 *
 * @param avalancheCenter A Avalanche Center Acronym
 * @returns an array of regions the avalanche center reports
 */
function getAvalancheCenterRegions(avalancheCenter: AvalancheCenter) {
  if ((avalancheCenter == AvalancheCenter.UAC)) {
    return ["salt-lake", "logan", "abajos", "moab", "ogden", "provo", "skyline", "southwest", "uintas"];
  }
  return [];
}

export { getAvalancheCenterRegions, AvalancheCenter };
