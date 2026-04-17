// PokeAPI move slugs for ~200 commonly used competitive moves.
// Names come from PokeAPI at seed time — we only carry the slug list.

export const moveSlugs: string[] = [
  // Signature / high-usage damage moves
  'tackle', 'scratch', 'quick-attack', 'bite', 'crunch', 'body-slam',
  'double-edge', 'hyper-beam', 'giga-impact', 'return', 'facade', 'u-turn',
  'volt-switch', 'flip-turn', 'knock-off', 'pursuit', 'sucker-punch',
  'play-rough', 'dazzling-gleam', 'moonblast', 'fairy-wind', 'draining-kiss',
  // Fire
  'ember', 'flamethrower', 'fire-blast', 'heat-wave', 'overheat',
  'flare-blitz', 'fire-punch', 'will-o-wisp', 'sunny-day', 'scorching-sands',
  // Water
  'water-gun', 'surf', 'hydro-pump', 'scald', 'waterfall', 'aqua-jet',
  'liquidation', 'muddy-water', 'rain-dance', 'aqua-tail',
  // Grass
  'vine-whip', 'razor-leaf', 'energy-ball', 'giga-drain', 'leaf-storm',
  'leaf-blade', 'power-whip', 'seed-bomb', 'solar-beam', 'spore',
  'sleep-powder', 'leech-seed',
  // Electric
  'thunder-shock', 'thunderbolt', 'thunder', 'discharge', 'volt-tackle',
  'thunder-wave', 'wild-charge', 'thunder-punch',
  // Ice
  'ice-beam', 'blizzard', 'ice-punch', 'icicle-crash', 'freeze-dry',
  'icy-wind', 'ice-shard', 'hail',
  // Fighting
  'close-combat', 'drain-punch', 'brick-break', 'superpower', 'aura-sphere',
  'focus-blast', 'high-jump-kick', 'mach-punch', 'low-kick', 'cross-chop',
  // Poison
  'sludge-bomb', 'sludge-wave', 'gunk-shot', 'poison-jab', 'toxic',
  'toxic-spikes', 'cross-poison',
  // Ground
  'earthquake', 'earth-power', 'high-horsepower', 'bulldoze', 'stone-edge',
  'spikes', 'sand-tomb',
  // Flying
  'air-slash', 'hurricane', 'brave-bird', 'drill-peck', 'acrobatics',
  'roost', 'dual-wingbeat',
  // Psychic
  'psychic', 'psyshock', 'zen-headbutt', 'future-sight', 'expanding-force',
  'psystrike', 'calm-mind', 'stored-power',
  // Bug
  'bug-buzz', 'x-scissor', 'leech-life', 'megahorn', 'first-impression',
  'u-turn',
  // Rock
  'rock-slide', 'stone-edge', 'rock-blast', 'head-smash', 'stealth-rock',
  'power-gem', 'meteor-beam',
  // Ghost
  'shadow-ball', 'shadow-claw', 'shadow-sneak', 'poltergeist', 'hex',
  'phantom-force',
  // Dragon
  'dragon-pulse', 'dragon-claw', 'outrage', 'draco-meteor', 'dragon-dance',
  'clanging-scales',
  // Dark
  'dark-pulse', 'foul-play', 'sucker-punch', 'knock-off', 'crunch',
  'throat-chop', 'lash-out',
  // Steel
  'iron-head', 'flash-cannon', 'meteor-mash', 'iron-tail', 'heavy-slam',
  'steel-beam', 'bullet-punch',
  // Setup / status
  'swords-dance', 'nasty-plot', 'bulk-up', 'calm-mind', 'agility',
  'iron-defense', 'substitute', 'protect', 'detect', 'recover',
  'roost', 'synthesis', 'moonlight', 'wish', 'taunt', 'encore',
  'reflect', 'light-screen', 'aurora-veil', 'trick-room', 'tailwind',
  'defog', 'rapid-spin', 'haze', 'heal-bell', 'aromatherapy',
  // Normal utility
  'hyper-voice', 'boomburst', 'body-press', 'extreme-speed', 'fake-out',
  'helping-hand', 'follow-me', 'rage-powder', 'me-first',
  // Gen 8/9 staples
  'stamping-tantrum', 'scale-shot', 'triple-axel', 'ice-hammer',
  'pyro-ball', 'terrain-pulse', 'rising-voltage', 'misty-explosion',
  'mystical-fire', 'scorching-sands',
  'tera-blast', 'revival-blessing', 'make-it-rain', 'chilling-water',
  'kowtow-cleave', 'jet-punch', 'ice-spinner', 'trailblaze',
  'pounce', 'silk-trap', 'comeuppance', 'spin-out', 'last-respects',
  'axe-kick',
];

// Dedup while preserving order.
export const uniqueMoveSlugs: string[] = Array.from(new Set(moveSlugs));
