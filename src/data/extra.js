// Additional recognizable catalogue entries; descriptions are simplified gameplay summaries.
// The wiki page linked for each item remains the authority for detailed numbers and stacking.
const lines=`Stun Grenade|Common|Hits can briefly stun enemies.|Control
Personal Shield Generator|Common|Increases maximum shield.|Defense
Power Elixir|Common|Consumable heal when badly hurt.|Emergency healing
Warbanner|Common|Boosts nearby allies' attack and movement speed at activation events.|Team buff
Red Whip|Uncommon|Faster movement out of combat.|Mobility
Bandolier|Uncommon|Kills can drop packs that reset skills.|Cooldown
Squid Polyp|Uncommon|Activating interactables summons a temporary turret.|Summon
Old War Stealthkit|Uncommon|Low health can grant invisibility and movement speed.|Escape
Little Disciple|Boss|Fires projectiles while you sprint.|Sprint damage
Queen's Gland|Boss|Summons a friendly Beetle Guard.|Summon
Titanic Knurl|Boss|Improves health and regeneration.|Sustain
Molten Perforator|Boss|Hits can create magma balls.|On-hit
Charged Perforator|Boss|Hits can trigger lightning.|On-hit
Genesis Loop|Boss|At low health, charges a large explosion.|Emergency burst
Shatterspleen|Boss|Critical hits apply bleed; bleeding enemies can explode on death.|Bleed
Halcyon Seed|Boss|Can summon an ally during teleporter combat.|Boss support
Irradiant Pearl|Boss|Increases all stats.|Stats
Pearl|Boss|Increases maximum health.|Health
Happiest Mask|Legendary|Chance to spawn ghost allies after kills.|Summon
Frost Relic|Legendary|A damaging ice aura grows around you after kills.|AoE
Brainstalks|Legendary|Killing Elite monsters grants a powerful cooldown benefit.|Cooldown
Interstellar Desk Plant|Legendary|Kills grow healing plants.|Healing
N'kuhana's Opinion|Legendary|Healing contributes to skull attacks.|Healing to damage
Wake of Vultures|Legendary|Gain Elite powers temporarily after killing elites.|Elite
Defensive Microbots|Legendary|Automatically intercepts certain nearby projectiles.|Defense
H3AD-5T v2|Legendary|Stomping downward creates a powerful damage effect.|Movement
Bottled Chaos|Legendary|Equipment activations trigger extra random effects.|Equipment
Symbiotic Scorpion|Legendary|Hits can permanently weaken enemy armor.|Armor reduction
Laser Scope|Legendary|Increases critical-hit damage.|Crit
Spare Drone Parts|Legendary|Upgrades drones and provides support fire.|Drones
Runic Lens|Legendary|Large hits can call down runic meteors.|Burst
Eulogy Zero|Lunar|Chance for items to become Lunar items.|Lunar risk
Purity|Lunar|Reduces skill cooldowns but worsens random proc luck.|Cooldown trade-off
Light Flux Pauldron|Lunar|Cuts skill cooldowns while slowing attack speed.|Trade-off
Stone Flux Pauldron|Lunar|Greatly increases health but reduces movement speed.|Tank trade-off
Corpsebloom|Lunar|Amplifies healing but spreads it over time.|Healing trade-off
Brittle Crown|Lunar|Hits can grant gold but getting hit can cost gold.|Gold trade-off
Strides of Heresy|Lunar|Replaces Utility with Shadowfade.|Heresy
Visions of Heresy|Lunar|Replaces Primary with Hungering Gaze.|Heresy
Hooks of Heresy|Lunar|Replaces Secondary with Slicing Maelstrom.|Heresy
Essence of Heresy|Lunar|Replaces Special with Ruin.|Heresy
Focused Convergence|Lunar|Faster Teleporter charging with a smaller charge area.|Risk
Gnarled Woodsprite|Equipment|Heal yourself or an ally over time.|Healing
Disposable Missile Launcher|Equipment|Launches a volley of homing missiles.|Burst
Royal Capacitor|Equipment|Call lightning onto a targeted enemy.|Boss damage
Preon Accumulator|Equipment|Fire a huge charging electric projectile.|Burst
The Back-up|Equipment|Temporarily call Strike Drones to fight.|Summon
Ocular HUD|Equipment|Briefly gain guaranteed critical strikes.|Crit
Foreign Fruit|Equipment|Instantly heals part of your health.|Heal
Milky Chrysalis|Equipment|Allows temporary flight.|Mobility
Fuel Array|Equipment|Quest-related equipment that can explode dangerously.|Quest
Forgive Me Please|Equipment|Throws a doll that repeatedly triggers on-kill effects.|On-kill
Recycler|Equipment|Rerolls selected world item pickups within limits.|Utility
Remote Caffeinator|Equipment|Summons a vending machine providing a purchase and a healing zone.|Utility
Blast Shower|Equipment|Removes some debuffs and reduces certain cooldowns.|Utility
Volcanic Egg|Equipment|Become a fast-flying fireball temporarily.|Mobility
Goobo Jr.|Equipment|Creates a friendly clone of you.|Summon
Executive Card|Equipment|Lets multishops retain choices after buying and returns some gold.|Economy
Super Massive Leech|Equipment|Gain life steal briefly.|Healing
Trophy Hunter's Tricorn|Equipment|Can instantly kill a boss and provide its item.|Boss drop
Spinel Tonic|Equipment|A powerful temporary stat boost with a long-term drawback risk.|Lunar trade-off
Crowdfunder|Equipment|Spend gold to fire rapid bullets.|Economy
Eccentric Vase|Equipment|Creates a long-range quantum tunnel.|Movement
Volatile Lightning|Equipment|Damage-triggered lightning defensive ability.|Defense
Weeping Fungus|Void|Heals while sprinting, corrupts Bustling Fungus.|Healing
Lost Seer's Lenses|Void|Chance to instantly kill non-boss enemies, corrupts Lens-Maker's Glasses.|Execute
Tentabauble|Void|Chance to root enemies, corrupts Chronobauble.|Control
Singularity Band|Void|Large hits create a black hole, corrupts fire and ice bands.|Control
Voidsent Flame|Void|Triggers explosions on hitting healthy enemies, corrupts Will-o'-the-wisp.|Burst
Newly Hatched Zoea|Void|Summons Void allies, corrupts yellow boss items.|Summon
Benthic Bloom|Void|Upgrades a portion of items into higher rarity at each stage; corrupts 57 Leaf Clover.|Trade-off
Encrusted Key|Void|Unlocks Void Cache, corrupts Rusted Key.|Economy
Pluripotent Larva|Void|Revives you with corrupted items, corrupts Dio's Best Friend.|Revival
Lysate Cell|Void|Grants extra Special skill charges, corrupts Fuel Cell.|Cooldown
Wungus|Void|Alternate slang name for Weeping Fungus; use wiki title Weeping Fungus.|Alias`; 
const MAP={Common:'white',Uncommon:'green',Legendary:'red',Boss:'yellow',Lunar:'lunar',Void:'void',Equipment:'equipment'};
export const extra=lines.split('\n').map(l=>{const [name,rarity,desc,role]=l.split('|');return {name,rarity,tier:MAP[rarity],desc,role,dlc:rarity==='Void'?'Survivors of the Void':null}}).filter(x=>x.name!=='Wungus');
