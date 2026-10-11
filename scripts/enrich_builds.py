"""Editorial build presets: editable source for the self-contained game.json catalog.
Run only when updating presets: python scripts/enrich_builds.py
Recommendations are suggestions, not measured optimal builds.
"""
import json
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'src/data/game.json'
d=json.loads(p.read_text())
# Two carefully differentiated existing builds are complemented with a third for every survivor.
third={
'acrid':('Melee lifesteal predator','DANGEROUS / CLOSE RANGE','Fight in melee with Frenzied Leap, Ravenous Bite and self-healing to survive close contact.', ['Focus Crystal','Leeching Seed','Harvester\'s Scythe','Lens-Maker\'s Glasses','Soldier\'s Syringe','Tougher Times','Hardlight Afterburner','Stained Scimitar'], ['Poison','Vicious Wounds','Ravenous Bite','Frenzied Leap','Epidemic'], 'Leap into groups, bite weakened targets for sustain, and dodge before ranged attacks converge.', 'Safer in shorter runs; dangerous against flying enemies and long-range bosses.'),
'enforcer':('Mobile parry commander','CO-OP / MOVEMENT','Use the shield in bursts instead of remaining stationary; parry and rally allies.', ['Paul\'s Goat Hoof','Hopoo Feather','Hardlight Afterburner','Tougher Times','AtG Missile Mk. 1','Ukulele','Vengeful Spirit','Spare Drone Parts'], ['Trenchbroom','Steel Protection','Ripcord','Rally Point'], 'Block a dangerous volley, parry as you exit stance, pull enemies together and regroup with Rally Point.', 'You lose sustained protection every time you reposition.'),
'commando':('Crit velocity','RAPID FIRE / CRIT','Turn fast Double Tap fire into critical-hit chains, bonus speed and healing.', ['Lens-Maker\'s Glasses','Predatory Instincts','Harvester\'s Scythe','Soldier\'s Syringe','Mocha','Ukulele','Polylute','57 Leaf Clover'], ['Double Tap','Phase Blast','Tactical Slide','Suppressive Fire'], 'Maintain fast fire on a big enemy while sliding away from telegraphed hits.', 'Crit items compete with early movement and defense investments.'),
'huntress':('Ballista boss hunter','SINGLE TARGET / CRIT','Quickly target dangerous elites and bosses with Flurry and Ballista.', ['Lens-Maker\'s Glasses','Crowbar','Armor-Piercing Rounds','Kjaro\'s Band','Runald\'s Band','Backup Magazine','Hopoo Feather','Runic Lens'], ['Flurry','Laser Glaive','Phase Blink','Ballista'], 'Stay mobile with Phase Blink; use Ballista on high priority targets and clean up groups with Glaive.', 'Needs crit investment to make Flurry excellent.'),
'bandit':('Backstab assassin','HIGH RISK / BURST','Use stealth, guaranteed backstab crits and huge single-target finishers.', ['Crowbar','Kjaro\'s Band','Runald\'s Band','Armor-Piercing Rounds','Backup Magazine','Shuriken','Delicate Watch','Hopoo Feather'], ['Blast','Serrated Shiv','Smoke Bomb','Desperado'], 'Approach from behind under Smoke Bomb, land heavy hits and build Desperado stacks.', 'Weak positioning and missed finishers waste time and damage.'),
'mult':('Rebar artillery','LONG RANGE / BURST','Switch to Rebar Puncher for piercing long-range shots with burst multipliers.', ['Crowbar','Armor-Piercing Rounds','Kjaro\'s Band','Runald\'s Band','Shuriken','Backup Magazine','Hopoo Feather','Brilliant Behemoth'], ['Rebar Puncher','Blast Canister','Transport Mode','Retool'], 'Line up piercing shots through crowds and finish bosses with bands.', 'Slower shooting makes some on-hit items less effective.'),
'engineer':('Mobile harpoon hunter','ACTIVE ENGINEER','Use Spider Mines, Thermal Harpoons and mobile turrets to keep fighting on the move.', ['Backup Magazine','Hardlight Afterburner','Ukulele','AtG Missile Mk. 1','Soldier\'s Syringe','Hopoo Feather','Tougher Times','Polylute'], ['Bouncing Grenades','Spider Mines','Thermal Harpoons','TR58 Carbonizer Turret'], 'Keep moving, lock on with Thermal Harpoons, and move your turrets through incoming attacks.', 'Mobile turrets lose much of Bustling Fungus stationary healing synergy.'),
'artificer':('Ice sniper','CONTROL / PRECISION','Freeze threats with Snapfreeze and use burst damage while airborne.', ['Crowbar','Backup Magazine','Armor-Piercing Rounds','Kjaro\'s Band','Runald\'s Band','Runic Lens','Hopoo Feather','Alien Head'], ['Flame Bolt','Cast Nano-Spear','Snapfreeze','Ion Surge'], 'Hover above enemies, line up Nano-Spear, freeze the most dangerous targets and dodge.', 'Whiffed precision attacks cost valuable cooldowns.'),
'mercenary':('Skill cooldown duelist','INVULNERABILITY / SPEED','Cycle mobility and invulnerability skills to stay on the attack.', ['Alien Head','Hardlight Afterburner','Backup Magazine','Lysate Cell','Ukulele','AtG Missile Mk. 1','Hopoo Feather','Tougher Times'], ['Laser Sword','Whirlwind','Blinding Assault','Eviscerate'], 'Dash through packs, weave Eviscerate at dangerous moments, then disengage before cooldowns expire.', 'Timing mistakes can be fatal in melee.'),
'rex':('Sustain root controller','SUPPORT / CONTROL','Use healing and entangling plants to pin down packs while trading some health.', ['Bustling Fungus','Leeching Seed','Harvester\'s Scythe','Rejuvenation Rack','Backup Magazine','Ukulele','Topaz Brooch','Razorwire'], ['DIRECTIVE: Inject','Seed Barrage','Bramble Volley','Tangling Growth'], 'Root groups in a vine, recover health and keep pressure on elites.', 'Self-damage skill costs can become dangerous at low HP.'),
'loader':('Thunder slam crowd clearer','AREA DAMAGE','Trade single-punch specialization for fast movement and huge area slams.', ['Hardlight Afterburner','Crowbar','Focus Crystal','Kjaro\'s Band','Runald\'s Band','Hopoo Feather','Brilliant Behemoth','Earthbound Vessel'], ['Knuckleboom','Spiked Fist','Thunder Gauntlet','Thunderslam'], 'Grapple above a group and slam through the center, then immediately relocate.', 'Landing in the wrong spot may leave you surrounded.'),
'captain':('Equipment fire support','EQUIPMENT / TEAM','Combine his drone defenses and equipment bursts with repeated active attacks.', ['Fuel Cell','Gesture of the Drowned','Royal Capacitor','Soulbound Catalyst','Pocket I.C.B.M.','Spare Drone Parts','Ukulele','Hopoo Feather'], ['Vulcan Shotgun','Power Tazer','Orbital Probe','Hacking Beacon'], 'Use Hacking Beacon to accelerate item economy, then zap bosses with equipment and orbs.', 'Equipment access is inconsistent, and some stages disable orbital skills.'),
'railgunner':('Marksman chain crit','AIM / CONSISTENCY','Use quicker scoped fire and crit multipliers to sweep high priority targets.', ['Laser Scope','Crowbar','Armor-Piercing Rounds','Runic Lens','Kjaro\'s Band','Runald\'s Band','Mocha','Hopoo Feather'], ['XQR Smart Round System','HH44 Marksman','Concussion Device','Cryocharge'], 'Hit weak points, use concussion to change sightlines and Cryocharge on large threats.', 'Requires steady aim and good positioning.'),
'voidfiend':('Corrupted burst engine','RISK / OFFENSE','Lean into the corrupted form for fast damage while carefully watching corruption.', ['Shaped Glass','Tougher Times','Mocha','Tri-Tip Dagger','Ukulele','Polylute','AtG Missile Mk. 1','Safer Spaces'], ['Drown','Flood','Trespass','Suppress'], 'Build corruption, burn priority targets during the transformed window, then retreat.', 'Shaped Glass is extremely dangerous; do not stack it casually.'),
'seeker':('Team guardian','CO-OP / SUPPORT','Prioritize survival and team-wide buffs while applying steady pressure.', ['Topaz Brooch','Lepton Daisy','Rejuvenation Rack','Ukulele','AtG Missile Mk. 1','Tougher Times','Hopoo Feather','Vengeful Spirit'], ['Spirit Punch','Unseen Hand','Sojourn','Meditate'], 'Stay near teammates for Meditate support and dive in with Sojourn when enemies group up.', 'Support power depends on teammates positioning together.'),
'falseson':('Lunar spike artillery','RANGED CONTROL','Fight from safer distances with Lunar Spikes and sustained laser pressure.', ['Backup Magazine','Soldier\'s Syringe','Mocha','Crowbar','AtG Missile Mk. 1','Shattering Justice','Hopoo Feather','Runic Lens'], ['Club of the Forsaken','Lunar Spikes','Step of the Brothers','Laser of the Father'], 'Throw spikes first, line up your laser on key targets, then reposition.', 'Positioning is important; do not overcommit with little mobility.'),
'chef':('Fire & chain combustion','AOE / BURN','Combine Sear’s fire pressure with burn amplifiers and chain explosions.', ['Ignition Tank','Gasoline','Will-o\'-the-wisp','Ukulele','Backup Magazine','Leeching Seed','Hopoo Feather','Nightmare Demon'], ['Dice','Sear','Roll','Glaze'], 'Cover enemies in burns, use Glaze to prepare a finish, and make chain kills spread through the pack.', 'Burn-focused setups depend on getting the right uncommon item.'),
'operator':('Drone command specialist','SUMMON / CONTROL','Improve drone damage while using your commands to cover weaknesses.', ['Spare Drone Parts','Pocket I.C.B.M.','Ukulele','AtG Missile Mk. 1','Hopoo Feather','Tougher Times','Lepton Daisy','Vengeful Spirit'], ['H3-11 OCR Custom','CMD-SWARM','Drone command mobility','Amp Core'], 'Stay alive, manage drone targets and use the swarm to put pressure on dangerous enemies.', 'Drones are vulnerable to large area damage.'),
'drifter':('Scrap-supplied support','LOOT / TEAM','Generate and convert scrap frequently to build a flexible co-op economy.', ['Shipping Request Form','Regenerating Scrap','Ghor\'s Tome','Paul\'s Goat Hoof','Hopoo Feather','Ukulele','AtG Missile Mk. 1','Totem of Avarice'], ['Blunt Force','Junk Cube','Repossess','Salvage'], 'Gather scrap, use Salvage early and feed the team steady items before late-game fights.', 'Direct damage may lag if you neglect conventional damage items.'),
'acolyte':('Survivable sacrifice loop','HEALING / TANK','Keep enough healing to safely trigger sacrifices and stay in melee range.', ['Rejuvenation Rack','Leeching Seed','Harvester\'s Scythe','Topaz Brooch','Tougher Times','Sanguine Chalice','Earthbound Vessel','Stained Scimitar'], ["N'kuhana's Grace",'Blade Slice','Soul Jar','Javelin','Anima Harvester'], 'Stay mobile, build souls safely, and use your big finisher when enemies are grouped.', 'Healing-reduction Hexes are especially hazardous.'),
'heretic':('Equipment ritualist','LUNAR / ABILITIES','Lean on Ruin and equipment cooldowns with enough mobility to survive.', ['Fuel Cell','Gesture of the Drowned','Royal Capacitor','Alien Head','Backup Magazine','Hopoo Feather','Tougher Times','Transcendence'], ['Hungering Gaze','Slicing Maelstrom','Shadowfade','Ruin'], 'Accumulate Ruin stacks with your kit, detonate and use Shadowfade to escape.', 'Only accessible by collecting all four Heresy Lunar items in a run.')
}
# All other build variants must have loadouts that reflect their stated playstyle.
loadouts={
'acrid':[['Poison','Vicious Wounds','Neurotoxin','Caustic Leap','Epidemic'],['Blight','Vicious Wounds','Neurotoxin','Caustic Leap','Cloying Breath']],
'enforcer':[['Trenchbroom','Steel Protection','Shield Tackle','Rally Point'],['Shrapnel Grenade','Steel Protection','Shield Tackle','Crash Point']],
'commando':[['Double Tap','Phase Blast','Tactical Slide','Suppressive Fire'],['Double Tap','Phase Blast','Tactical Slide','Frag Grenade']],
'huntress':[['Strafe','Laser Glaive','Phase Blink','Ballista'],['Flurry','Laser Glaive','Phase Blink','Ballista']],
'bandit':[['Burst','Serrated Dagger','Smoke Bomb','Desperado'],['Blast','Serrated Shiv','Smoke Bomb','Lights Out']],
'mult':[['Auto-Nailgun','Blast Canister','Transport Mode','Power Mode'],['Power-Saw','Blast Canister','Transport Mode','Power Mode']],
'engineer':[['Bouncing Grenades','Pressure Mines','Bubble Shield','TR12 Gauss Auto-Turret'],['Bouncing Grenades','Spider Mines','Thermal Harpoons','TR58 Carbonizer Turret']],
'artificer':[['Flame Bolt','Charged Nano-Bomb','Snapfreeze','Ion Surge'],['Plasma Bolt','Charged Nano-Bomb','Snapfreeze','Flamethrower']],
'mercenary':[['Laser Sword','Whirlwind','Blinding Assault','Eviscerate'],['Laser Sword','Rising Thunder','Focused Assault','Slicing Winds']],
'rex':[['DIRECTIVE: Inject','Seed Barrage','DIRECTIVE: Disperse','Tangling Growth'],['DIRECTIVE: Inject','DIRECTIVE: Drill','Proliferation','DIRECTIVE: Harvest']],
'loader':[['Knuckleboom','Spiked Fist','Charged Gauntlet','M551 Pylon'],['Knuckleboom','Grapple Fist','Thunder Gauntlet','Thunderslam']],
'captain':[['Vulcan Shotgun','Power Tazer','Orbital Probe','Hacking Beacon'],['Vulcan Shotgun','Power Tazer','Diablo Strike','Shock Beacon']],
'railgunner':[['XQR Smart Round System','M99 Sniper','Concussion Device','Supercharge'],['XQR Smart Round System','HH44 Marksman','Polar Field Device','Cryocharge']],
'voidfiend':[['Drown','Flood','Trespass','Suppress'],['Drown','Flood','Trespass','Suppress']],
'seeker':[['Spirit Punch','Unseen Hand','Sojourn','Meditate'],['Spirit Punch','Unseen Hand','Sojourn','Meditate']],
'falseson':[['Club of the Forsaken','Lunar Spikes','Step of the Brothers','Laser of the Father'],['Club of the Forsaken','Lunar Spikes','Step of the Brothers','Laser of the Father']],
'chef':[['Dice','Sear','Roll','Glaze'],['Dice','Sear','Roll','Glaze']],
'operator':[['H3-11 OCR Custom','ADMIN-OVERRIDE','Drone command mobility','Amp Core'],['H3-11 OCR Custom','CMD-SWARM','Drone command mobility','Amp Core']],
'drifter':[['Blunt Force','Cleanup','Repossess','Salvage'],['Blunt Force','Junk Cube','Tornado Slam','Tinker']],
'acolyte':[["N'kuhana's Grace",'Blade Slice','Bola Throw','Blade Sling','Anima Harvester'],["N'kuhana's Favor",'Blade Slice','Soul Jar','Javelin','Anima Harvester']],
'heretic':[['Hungering Gaze','Slicing Maelstrom','Shadowfade','Ruin'],['Hungering Gaze','Slicing Maelstrom','Shadowfade','Ruin']]
}
play={
'acrid': [('Open with Epidemic on a crowd, poison priority targets, leap out, and let your on-kill items finish enemies.', 'Poison cannot kill on its own; prioritize reliable finishing effects.'),('Trap bosses or elite packs in Cloying Breath to rapidly stack Blight, then keep applying skills.', 'Blight is less effective on bosses with extremely large health pools than percent-health Poison.')],
'enforcer':[('Face the largest threat, enter shield stance, keep the piercing shotgun firing and parry when you must move.', 'The shield protects its facing direction, not your sides or back.'),('Fire burst grenades at packed enemies and use Crash Point for a big hit to activate the bands.', 'Charging into a bad position can get you surrounded.')],
'commando':[('Keep Double Tap hitting bosses to activate proc items; slide away from incoming shots.', 'Build struggles if you neglect survival while chasing chance-to-trigger items.'),('Position grenades under packed enemies, trigger big fire/ice band hits, and keep moving.', 'Fragmentation can miss moving or flying targets.')],
'huntress':[('Stay mobile and use Glaive between Strafe shots to rapidly clear crowds.', 'Lock-on helps aim, but Huntress has a low base health pool.'),('Use Flurry with critical chance and Ballista to burst dangerous monsters.', 'Crit-based builds are weaker before you find critical chance items.')],
'bandit':[('Backstab for crits, stack Desperado damage over a run, and reset stealth as needed.', 'Dangerous if you cannot reach enemies from behind.'),('Use Lights Out executions for cooldown resets and chain into the next enemy.', 'Finishing blows are inconsistent if the team steals kills.')],
'mult':[('Hold Power Mode with nailguns to fire rapidly and stack missiles and bleed.', 'Staying stationary makes incoming attacks more dangerous.'),('Use Power-Saw near targets for sustained melee hits, then escape before they surround you.', 'You need more defensive items than a ranged build.')],
'engineer':[('Place static turrets on safe ground; their copies inherit your items, including Bustling Fungus.', 'Turrets need good placement and can be destroyed.'),('Send mobile turrets with you and fire Thermal Harpoons from movement.', 'Stationary healing strategies lose value with mobile turrets.')],
'artificer':[('Stack heavy burns with Flame Bolt while controlling threats from the air.', 'Her skills have cooldown windows: move defensively between casts.'),('Use Plasma Bolt and big direct bursts to kill groups quickly.', 'Riskier at close range and less dependent on burn synergies.')],
'mercenary':[('Use Eviscerate to avoid damage during dangerous windows while proc items trigger.', 'Highly positional; timing is more important than raw item count.'),('Apply Expose and hit large groups with Slicing Winds to maintain ranged pressure.', 'Less invulnerability than the Eviscerate build.')],
'rex':[('Use Tangling Growth to control enemies, then recover with Harvest and regeneration.', 'Do not spend too much health when near lethal damage.'),('Use DIRECTIVE: Drill and new Proliferation for repeated damage and proc interactions.', 'Needs precise management of life-spending abilities.')],
'loader':[('Swing to build speed, then hit priority targets with Charged Gauntlet and bands.', 'Don’t waste burst hits on tiny enemies.'),('Brawl with quicker punches, then disengage with grapple before damage builds.', 'Less efficient against ranged enemies.')],
'captain':[('Open early multishops with Hacking Beacon and fire the shotgun close enough for many pellets.', 'Your orbital skills are unavailable in certain hidden realms.'),('Choose Diablo Strike and damage multipliers to burst large bosses.', 'Long windup makes the strike difficult to land.')],
'railgunner':[('Land weak-point charged shots with a burst multiplier on bosses.', 'Missing weak points wastes most of your build advantage.'),('Use quick scoped shots for steadier damage; freeze or control threats if needed.', 'Relies on consistent aim and access to clean sightlines.')],
'voidfiend':[('Play from a distance and choose healing when you need to reduce corruption.', 'Corruption changes abilities; healing can shorten damage windows.'),('Build toward frequent transformed bursts with on-hit items.', 'Careful: healing choices and corruption interact with your rotation.')],
'seeker':[('Use Meditate regularly to support the party and stay alive while applying damage.', 'Needs team discipline to maximize value.'),('Use Sojourn offensively to clear groups while maintaining protection.', 'Hard to control if you overextend.')],
'falseson':[('Stay aggressive near enemies and chain club hits with Lunar Spikes.', 'Getting surrounded can punish slow repositioning.'),('Use slow/control effects to keep enemies within high damage laser windows.', 'Positioning and skill management matter more than rarity alone.')],
'chef':[('Apply fire with Sear, use Glaze, and finish through fire/item chains.', 'Burn builds are weaker without Ignition Tank.'),('Use rapid hits and procs for close combat damage.', 'Avoid remaining in unsafe melee range.')],
'operator':[('Use your drone commands frequently and keep drones alive to maximize support fire.', 'Drone AI and positioning can be unpredictable.'),('Lean into swarms and chain effects with item-triggered attacks.', 'Requires access to drone-related items.')],
'drifter':[('Focus on loot generation and support early; pick up damage items as the stage advances.', 'Can fall behind in damage without a balanced inventory.'),('Use physical attacks and burst/control abilities in a mobile rotation.', 'Riskier in melee and less supportive to the team.')],
'acolyte':[('Fight in melee while restoring HP and managing sacrifices carefully.', 'Healing-denial effects directly undermine the build.'),('Use Soul Jar and long-range tools to maintain damage while preparing Anima Harvester.', 'Recent DLC kit is subject to balance changes.')],
'heretic':[('Use Shadowfade to survive, then detonate Ruin on important threats.', 'All Heretic skills require collecting the four Heresy items.'),('Use carefully chosen damage items and equipment to support hit-and-run play.', 'The Heretic is only accessible in-run.')]
}
reasons={
'Gasoline':'On-kill burning spreads through packed monsters and creates chain clears.',
"Will-o'-the-wisp":'One death makes an explosion that can trigger subsequent deaths.',
'Ukulele':'Direct hits can arc lightning through nearby enemies.',
'Tri-Tip Dagger':'Adds bleed from eligible direct hits; helps finish poisoned targets.',
'Ignition Tank':'Greatly strengthens burn damage from Gasoline or fire skills.',
'Hopoo Feather':'Extra jump helps avoid attacks while staying offensive.',
'Death Mark':'Rewards applying four different debuff types to one target.',
'Nightmare Demon':'The Hallowed item can activate on-kill effects through haunting.',
'Backup Magazine':'Extra secondary charges give more offensive and control options.',
"Soldier's Syringe":'Higher attack speed increases the number of direct hits you can land.',
'Leeching Seed':'Repeated hits return health; effectiveness depends on hit behavior.',
'Shattering Justice':'Sustained hits shred target armor and amplify follow-up damage.',
'Vile Censer':'Adds disruptive black smoke and stuns to repeated hits.',
'Earthbound Vessel':'Additional jumps and armor while jumps remain available.',
'Focus Crystal':'Increases close-range damage and rewards melee positioning.',
"Harvester's Scythe":'Critical hits return health, rewarding crit investment.',
"Lens-Maker's Glasses":'Adds 10% crit chance per stack, until the usual cap.',
'Tougher Times':'Chance to block a hit; benefits diminish at high stack counts.',
'Hardlight Afterburner':'Extra utility charges make dives and escapes more frequent.',
'AtG Missile Mk. 1':'Eligible hits can launch high-damage missiles; stacks increase damage.',
"Paul's Goat Hoof":'Move faster to reposition and evade attacks.',
'Energy Drink':'Increases sprinting speed for kiting and escaping.',
'Kjaro\'s Band':'Big individual hits create a damaging fire tornado.',
'Runald\'s Band':'Big individual hits trigger ice damage and slowing.',
'Crowbar':'Bonus damage to enemies at high health favors opening burst hits.',
'Armor-Piercing Rounds':'Direct bonus damage versus Teleporter bosses and boss enemies.',
'Predatory Instincts':'Critical hits build attack-speed momentum.',
'Polylute':'On-hit stacking lightning bursts focus damage on one enemy.',
'Rejuvenation Rack':'Increases received healing from other items and skills.',
'Bustling Fungus':'Heals after standing still, especially strong on stationary Engineer turrets.',
'Weeping Fungus':'Heals during sprinting; great for mobile ranged builds.',
'Runic Lens':'Larger damage instances improve runic meteor opportunities.',
'Pocket I.C.B.M.':'Boosts missile-oriented builds and drone missile damage.',
'Fuel Cell':'Extra equipment charges and shorter equipment cooldowns.',
'Spare Drone Parts':'Significantly boosts allied drones and support fire.',
'Safer Spaces':'Grants a recharging hit block rather than probability-based blocking.',
'Sanguine Chalice':'Bleed-themed Hallowed item with sustain synergy.',
'Stained Scimitar':'Lifesteal and ghost swords feed aggressive close-range play.',
'Vengeful Spirit':'A protective spirit can absorb some incoming damage.',
'Totem of Avarice':'Large direct hits can transform enemies into lucrative targets.',
'57 Leaf Clover':'Improves rolls for eligible chance-based effects.',
'Mocha':'Combines movement speed with attack speed.',
'Brilliant Behemoth':'Creates extra explosions from most direct attacks.',
'Royal Capacitor':'Equipment burst on a targeted boss.',
'Gesture of the Drowned':'Automatically uses equipment when ready at a lower cooldown.',
'Laser Scope':'Dramatically increases the damage of critical hits.',
'Topaz Brooch':'Kills grant temporary barrier to survive crowded encounters.',
}
stack={
"Lens-Maker's Glasses":'Aim toward 10 total for normal attacks (100% base crit chance); Railgunner treats crit differently.',
'Tri-Tip Dagger':'Add several; a 1.0 proc hit reaches 100% bleed chance at 10 stacks.',
"Soldier's Syringe":'3–6+ as attack-speed budget allows.',
"Paul's Goat Hoof":'2–4+, then reassess movement handling.',
'Energy Drink':'1–3 for sprint mobility.',
'Gasoline':'1–4; each copy scales burn.',
'Ukulele':'1–3 for area chaining.',
"Will-o'-the-wisp":'1–3+ for stronger clears.',
'Ignition Tank':'At least 1 for strong burns; more scales burn further.',
'Backup Magazine':'1–3, based on secondary rotation.',
'AtG Missile Mk. 1':'1–4; additional copies increase missile damage.',
'Crowbar':'2–5 when relying on first big hits.',
"Kjaro's Band":'1–3; heavy single hits activate it.',
"Runald's Band":'1–3; pair with heavy single hits.',
'Focus Crystal':'2–5 if fighting close.',
'Armor-Piercing Rounds':'2–5 for boss-heavy runs.',
'Tougher Times':'1–7; each stack has diminishing block returns.',
'Hopoo Feather':'1–2 early is often enough.',
'Polylute':'1–3+ for focused proc damage.',
'Leeching Seed':'1–3, preferably with rapid proc-capable hits.',
'Death Mark':'1 only until you can reliably apply four different debuffs.',
'57 Leaf Clover':'1 is very valuable when your build has many random procs.',
'Fuel Cell':'1–3 for active equipment-focused builds.',
'Hardlight Afterburner':'1 or more for extra utility charges.',
'Runic Lens':'1+; rare-item luxury.',
'Vengeful Spirit':'1+ when available.',
'Earthbound Vessel':'1+ when available.'
}
# Extra alternative build for favourites: four practical ways to play instead of two.
extra_fourth={
'acrid':('Epidemic cooldown spam','PROC / SKILL CYCLING','Repeat Epidemic frequently, hit groups and escape between casts.', ['Alien Head','Lysate Cell','Ukulele','AtG Missile Mk. 1','Polylute','Mocha','Hopoo Feather','Vengeful Spirit'], ['Poison','Vicious Wounds','Neurotoxin','Caustic Leap','Epidemic'],'Spam Epidemic in crowds and use movement to survive the gap between casts.','Special cooldowns require luck with rare items.'),
'enforcer':('Rapid-fire on-hit shredder','OFFENSIVE / ATTACK SPEED','Stay in defensive stance long enough to use multi-projectile attacks for repeated proc opportunities.', ["Soldier's Syringe",'Mocha','Tri-Tip Dagger','Lens-Maker\'s Glasses','Predatory Instincts','Shattering Justice','Polylute','Sanguine Chalice'], ['Trenchbroom','Steel Protection','Shield Tackle','Rally Point'],'Face the enemy, use rapid defensive-stance shells and finish with barrier-backed pressure.','Attack speed is great but cannot replace mobility or rear protection.')
}
for s in d['survivors']:
 sid=s['id']; item=third[sid]
 def make_tuple(v):
  title,style,desc,items,skills,combo,risk=v
  return dict(title=title,style=style,desc=desc,items=items,skillNames=skills,how=combo,risk=risk)
 if len(s['builds'])<3:s['builds'].append(make_tuple(item))
 if sid in extra_fourth and len(s['builds'])<4:s['builds'].append(make_tuple(extra_fourth[sid]))
 for i,b in enumerate(s['builds']):
  names=b.get('skillNames') or loadouts[sid][i]
  picks=[]
  for k,options in enumerate(s['skills']):
   nm=names[k] if k<len(names) else options[0]
   if nm not in options:raise ValueError(f'{sid} preset {i}: invalid skill {nm}, valid {options}')
   picks.append(options.index(nm))
  b['skillChoices']=picks
  if i<2:
   b['how'],b['risk']=play[sid][i]
  b['core']=b['items'][:3]
  b['priority']=[{'name':n,'why':reasons.get(n,'Supports this build’s attack pattern, mobility or survival.'),'target':stack.get(n,'1–2 copies initially; adjust to drops and synergy.')} for n in b['items']]
  b['difficulty']=('Advanced' if ('EXPERIMENTAL' in b['style'] or 'RISK' in b['style'] or sid in ('heretic',)) else ('Easy' if i==0 else 'Intermediate'))
p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
print(f"Updated {len(d['survivors'])} survivors / {sum(len(s['builds']) for s in d['survivors'])} detailed build paths")
