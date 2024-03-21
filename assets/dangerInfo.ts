import { DangerInfo } from "../src/generic_helpers/types";
import { color } from "./colors";

interface DangerTable {
  noRating: DangerInfo,
  lowDangerPockets: DangerInfo,
  lowDanger: DangerInfo,
  moderateDangerPockets: DangerInfo,
  moderateDanger: DangerInfo,
  considerableDangerPockets: DangerInfo,
  considerableDanger: DangerInfo,
  highDangerPockets: DangerInfo,
  highDanger: DangerInfo,
  extremeDangerPockets: DangerInfo,
  extremeDanger: DangerInfo,
}

/**
 * This is a table with all of the recommendations from UAC for each danger level.
 */
export const dangerTable: DangerTable = {
  noRating: {
    shortDescription: "No rating",
    color: color.LightBG,
    travelAdvice: "N/A",
    likeLihood: "N/A",
    sizeAndDistribution: "N/A",
  },
  lowDangerPockets: {
    shortDescription: "Pockets of low danger",
    color: color.Green,
    travelAdvice: `Generally safe avalanche conditions. Watch for unstable snow on isolated terrain features.`,
    likeLihood: `Natural and human-triggered avalanches unlikely.`,
    sizeAndDistribution: `Small avalanches in isolated areas or extreme terrain.`
  },
  lowDanger: {
    shortDescription: "Low danger",
    color: color.Green,
    travelAdvice: `Generally safe avalanche conditions. Watch for unstable snow on isolated terrain features.`,
    likeLihood: `Natural and human-triggered avalanches unlikely.`,
    sizeAndDistribution: `Small avalanches in isolated areas or extreme terrain.`
  },
  moderateDangerPockets: {
    shortDescription: "Pockets of moderate danger",
    color: color.Yellow,
    travelAdvice: `Heighened avalance conditions on specific terrain features. Evaluate snow and terrain carefully; identify features of concern.`,
    likeLihood: `Natural avalanches unlikely; human-triggered avalanches possible.`,
    sizeAndDistribution: `Small avalanches in specific areas; or large avalanches in isolated areas.`
  },
  moderateDanger: {
    shortDescription: "Moderate danger",
    color: color.Yellow,
    travelAdvice: `Heighened avalance conditions on specific terrain features. Evaluate snow and terrain carefully; identify features of concern.`,
    likeLihood: `Natural avalanches unlikely; human-triggered avalanches possible.`,
    sizeAndDistribution: `Small avalanches in specific areas; or large avalanches in isolated areas.`,
  },
  considerableDangerPockets: {
    shortDescription: "Pockets of considerable danger",
    color: color.Orange,
    travelAdvice: `Dangerous avalanche conditions. Careful snowpack evaluation, cautious route-finding, and conservative decision-making essential.`,
    likeLihood: `Natural avalanches possible; human-triggered avalanches likely.`,
    sizeAndDistribution: `Small avalanches in many areas; or large avalanches in specific areas; or large avalanches in isolated areas.`
  },
  considerableDanger: {
    shortDescription: "Considerable danger",
    color: color.Orange,
    travelAdvice: `Dangerous avalanche conditions. Careful snowpack evaluation, cautious route-finding, and conservative decision-making essential.`,
    likeLihood: `Natural avalanches possible; human-triggered avalanches likely.`,
    sizeAndDistribution: `Small avalanches in many areas; or large avalanches in specific areas; or large avalanches in isolated areas.`
  },
  highDangerPockets: {
    shortDescription: "Pockets of high danger",
    color: color.Red,
    travelAdvice: `Very dangerous avalanche conditions. Travel in avalanche terrain not recommended.`,
    likeLihood: `Natural avalanches likely; human-triggered avalanches likely.`,
    sizeAndDistribution: `Large avalanches in many areas; or very large avalanches in specific areas.`
  },
  highDanger: {
    shortDescription: "High danger",
    color: color.Red,
    travelAdvice: `Very dangerous avalanche conditions. Travel in avalanche terrain not recommended.`,
    likeLihood: `Natural avalanches likely; human-triggered avalanches likely.`,
    sizeAndDistribution: `Large avalanches in many areas; or very large avalanches in specific areas.`
  },
  extremeDangerPockets: {
    shortDescription: "Pockets of extreme danger",
    color: color.Black,
    travelAdvice: `Extraordinarily dangerous avalanche conditions. Avoid all avalanche terrain.`,
    likeLihood: `Natural and human-triggered avalanches certain.`,
    sizeAndDistribution: `Very large avalanches in many areas.`
  },
  extremeDanger: {
    shortDescription: "Extreme danger",
    color: color.Black,
    travelAdvice: `Extraordinarily dangerous avalanche conditions. Avoid all avalanche terrain.`,
    likeLihood: `Natural and human-triggered avalanches certain.`,
    sizeAndDistribution: `Very large avalanches in many areas.`
  }
}
