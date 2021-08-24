export const SKILLS_TYPES = {
  ARCHERY_FIGHTING: "ARCHERY_FIGHTING",
  AXE_FIGHTING: "AXE_FIGHTING",
  BLACKSMITHING: "BLACKSMITHING",
  FIST_FIGHTING: "FIST_FIGHTING",
  LUMBERJACKING: "LUMBERJACKING",
  MINING: "MINING",
  PIKE_FIGHTING: "PIKE_FIGHTING",
  SHIELD_DEFENDING: "SHIELD_DEFENDING",
  SWORD_FIGHTING: "SWORD_FIGHTING",
  WOODWORKING: "WOODWORKING",
};

const LEVEL_TYPES = {
  // junior levels
  NOOB: "NOOB",
  BEGINNER: "BEGINNER",
  // regular levels
  REGULAR: "REGULAR",
  ADVANCED: "ADVANCED",
  // senior levels
  EXPERT: "EXPERT",
  MASTER: "MASTER",
};

const LEVELS = [
  {
    name: LEVEL_TYPES.NOOB,
    displayName: "noob",
    minPoints: 0,
    maxPoints: 10,
  },
  {
    name: LEVEL_TYPES.BEGINNER,
    displayName: "beginner",
    minPoints: 10,
    maxPoints: 100,
  },
  {
    name: LEVEL_TYPES.REGULAR,
    displayName: "regular",
    minPoints: 100,
    maxPoints: 1000,
  },
  {
    name: LEVEL_TYPES.ADVANCED,
    displayName: "advanced",
    minPoints: 1000,
    maxPoints: 10000,
  },
  {
    name: LEVEL_TYPES.EXPERT,
    displayName: "expert",
    minPoints: 10000,
    maxPoints: 100000,
  },
  {
    name: LEVEL_TYPES.MASTER,
    displayName: "master",
    minPoints: 100000,
    maxPoints: Infinity,
  },
];

const getLevelProgress = (points, level) =>
  Math.floor(
    ((points - level.minPoints) / (level.maxPoints - level.minPoints)) * 100
  );

const getLevel = (points) =>
  LEVELS.find(
    ({ minPoints, maxPoints }) => !!(points >= minPoints && points < maxPoints)
  );

export const skillIncrease = (skills, { name, pointsToGain }) => {
  const skill = skills[name];

  return {
    name,
    skill: { ...skill, points: skill.points + pointsToGain },
  };
};

export const skillsSchema = {
  [SKILLS_TYPES.ARCHERY_FIGHTING]: {
    displayName: "archery fighting",
    points: 0,
  },
  [SKILLS_TYPES.AXE_FIGHTING]: {
    displayName: "axe fighting",
    points: 0,
  },
  [SKILLS_TYPES.BLACKSMITHING]: {
    displayName: "blacksmithing",
    points: 0,
  },
  [SKILLS_TYPES.FIST_FIGHTING]: {
    displayName: "fist fighting",
    points: 0,
  },
  [SKILLS_TYPES.LUMBERJACKING]: {
    displayName: "lumberjacking",
    points: 0,
  },
  [SKILLS_TYPES.MINING]: {
    displayName: "mining",
    points: 0,
  },
  [SKILLS_TYPES.PIKE_FIGHTING]: {
    displayName: "pike fighting",
    points: 0,
  },
  [SKILLS_TYPES.SHIELD_DEFENDING]: {
    displayName: "shield defending",
    points: 0,
  },
  [SKILLS_TYPES.SWORD_FIGHTING]: {
    displayName: "sword fighting",
    points: 0,
  },
  [SKILLS_TYPES.WOODWORKING]: {
    displayName: "woodworking",
    points: 0,
  },
};

export const shapeSkillsForClient = (skills) =>
  Object.values(skills).map(({ displayName, points }) => {
    const level = getLevel(points);
    return {
      name: displayName,
      levelName: level.displayName,
      progressInPerc: points === 0 ? 0 : getLevelProgress(points, level),
    };
  });
