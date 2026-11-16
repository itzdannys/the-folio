/* Milestone 16: original, spell-specific table guidance for all 339 bundled 2024 SRD spells.
   Mechanical authority: bundled CC-BY-4.0 Open5e spell descriptions (not this advice).
   The notes are tactical suggestions and limitations, not additional rules.
   See docs/SPELL_GUIDANCE_AUDIT.md and SPELL_DATA_LICENSE.md. */
(function(root){'use strict';
const entries={
 "srd-2024_acid-splash": {
  "use": "When several enemies stand within the small blast, use it for slot-free area damage.",
  "watch": "Place the 5-foot-radius sphere carefully; creatures in the area save, and it does not use an attack roll."
 },
 "srd-2024_chill-touch": {
  "use": "Use in melee when stopping an enemy from regaining Hit Points is worth approaching.",
  "watch": "This is a melee spell attack in the 2024 version; don't assume the old ranged version."
 },
 "srd-2024_dancing-lights": {
  "use": "Light dark passages or make moving signals without carrying a torch.",
  "watch": "The lights need concentration and are dim; don't treat them as bright illumination."
 },
 "srd-2024_druidcraft": {
  "use": "Use minor weather signs or natural effects to add practical wilderness flavour.",
  "watch": "These small tricks aren't a substitute for damaging or large-scale nature magic."
 },
 "srd-2024_eldritch-blast": {
  "use": "A dependable ranged attack cantrip, especially once it fires multiple beams.",
  "watch": "Make a separate attack roll for each beam; target choices and cover matter."
 },
 "srd-2024_elementalism": {
  "use": "Use its five distinct elemental tricks for harmless, creative environmental effects.",
  "watch": "Choose only an effect the spell lists; it doesn't directly deal damage."
 },
 "srd-2024_fire-bolt": {
  "use": "Attack from range or ignite an unattended flammable object when appropriate.",
  "watch": "Spell attacks can miss, and fire damage or ignition may be dangerous near allies."
 },
 "srd-2024_guidance": {
  "use": "Help someone just before an important ability check within its stated limits.",
  "watch": "Cast it ahead of relevant skill checks; you choose one skill and must maintain concentration."
 },
 "srd-2024_light": {
  "use": "Illuminate a dark space without occupying a hand with a torch.",
  "watch": "Casting on an object held by a hostile creature may require its Dexterity save."
 },
 "srd-2024_mage-hand": {
  "use": "Manipulate unattended objects or operate things from a safer distance.",
  "watch": "The hand has a strict weight limit and cannot attack or perform abilities not listed."
 },
 "srd-2024_mending": {
  "use": "Repair a single small break in equipment between encounters.",
  "watch": "It does not replace missing material or restore magic to a broken item."
 },
 "srd-2024_message": {
  "use": "Share a quiet instruction when speaking aloud would expose the party.",
  "watch": "Barriers and the spell's communication limits still apply; it isn't universal telepathy."
 },
 "srd-2024_minor-illusion": {
  "use": "Distract, conceal, or communicate with a small sound or image.",
  "watch": "The illusion cannot create arbitrary physical effects; interaction can reveal it."
 },
 "srd-2024_poison-spray": {
  "use": "Deal close-range poison damage against a foe vulnerable to it.",
  "watch": "Poison resistance or immunity is common; verify the 2024 range and save."
 },
 "srd-2024_prestidigitation": {
  "use": "Create a small sensory trick, clean an object, or embellish roleplay.",
  "watch": "Its effects are deliberately minor; it cannot replace stronger illusion spells."
 },
 "srd-2024_produce-flame": {
  "use": "Carry magical light and turn it into a ranged attack when needed.",
  "watch": "Hurling fire is a Magic action after you create the flame; the flame itself gives light but ignites nothing."
 },
 "srd-2024_ray-of-frost": {
  "use": "Slow an approaching enemy while dealing ranged cold damage.",
  "watch": "The speed reduction requires a hit and lasts only for the specified period."
 },
 "srd-2024_resistance": {
  "use": "Reduce incoming damage of a chosen type on an ally during a dangerous encounter.",
  "watch": "Choose one listed damage type when you cast this Action; its 1d4 reduction is limited to once per turn."
 },
 "srd-2024_sacred-flame": {
  "use": "Hit a creature with radiant damage using a Dexterity saving throw.",
  "watch": "The spell has its own cover interaction; it isn't a weapon or spell attack roll."
 },
 "srd-2024_shillelagh": {
  "use": "Make a club or quarterstaff a viable spellcasting-ability melee weapon.",
  "watch": "Check the weapon and casting duration; it does not create extra attacks by itself."
 },
 "srd-2024_shocking-grasp": {
  "use": "Shock an adjacent enemy and hinder its ability to make Opportunity Attacks.",
  "watch": "You still need to land the melee spell attack; avoid engaging if unsafe."
 },
 "srd-2024_sorcerous-burst": {
  "use": "Use a flexible damage-type cantrip with potential exploding damage dice.",
  "watch": "Resolve its rerolls and maximum extra dice exactly as the spell states."
 },
 "srd-2024_spare-the-dying": {
  "use": "Stabilize a creature at 0 Hit Points without expending a slot.",
  "watch": "Stabilizing doesn't restore Hit Points or bring a creature back into combat."
 },
 "srd-2024_starry-wisp": {
  "use": "Use radiant damage to expose a target to visible light after the hit.",
  "watch": "A missed ranged spell attack grants none of the listed on-hit effects."
 },
 "srd-2024_thaumaturgy": {
  "use": "Intimidate, signal, or dramatize a moment with supernatural flourishes.",
  "watch": "These are limited sensory effects, not automatic persuasion or fear."
 },
 "srd-2024_true-strike": {
  "use": "Make a weapon attack with your spellcasting ability instead of Strength or Dexterity.",
  "watch": "You must use the required weapon; extra damage scales with character level."
 },
 "srd-2024_vicious-mockery": {
  "use": "Hinder a dangerous attacker while inflicting psychic damage.",
  "watch": "The target must fail its Wisdom save; the attack disadvantage has a limited window."
 },
 "srd-2024_alarm": {
  "use": "Protect a camp, doorway, or stash with a magical intrusion warning.",
  "watch": "Set the area and chosen exceptions carefully; a ritual takes additional time."
 },
 "srd-2024_animal-friendship": {
  "use": "Calm a Beast so the group can pass or interact without fighting.",
  "watch": "It targets Beasts and charm can end if the creature is harmed."
 },
 "srd-2024_bane": {
  "use": "Reduce several enemies' attacks and saves early in a difficult fight.",
  "watch": "Each target gets its initial Charisma save, and the effect requires concentration."
 },
 "srd-2024_bless": {
  "use": "Improve several allies' attacks and saving throws during an important fight.",
  "watch": "Concentration conflicts with other ongoing spells such as Hunter's Mark."
 },
 "srd-2024_burning-hands": {
  "use": "Hit a cluster of nearby foes with a short cone of fire.",
  "watch": "The cone starts at you and can catch allies; successful saves reduce damage."
 },
 "srd-2024_charm-person": {
  "use": "Smooth a conversation with a Humanoid before a social challenge.",
  "watch": "It is not mind control, and the target learns it was charmed when the spell ends."
 },
 "srd-2024_chromatic-orb": {
  "use": "Pick a useful damage type and potentially bounce between enemies.",
  "watch": "Requires the specified diamond; later jumps depend on matching damage dice."
 },
 "srd-2024_color-spray": {
  "use": "Hinder clustered creatures by imposing temporary blindness.",
  "watch": "Target placement matters, and its short duration limits setup value."
 },
 "srd-2024_command": {
  "use": "Force a permitted brief command to disrupt an enemy's next turn.",
  "watch": "The target saves, must understand the command, and the spell limits harmful orders."
 },
 "srd-2024_comprehend-languages": {
  "use": "Read or understand unfamiliar languages while investigating.",
  "watch": "Understanding literal meaning does not automatically decode secret messages or magical scripts."
 },
 "srd-2024_create-or-destroy-water": {
  "use": "Produce potable water or remove water from a suitable area.",
  "watch": "The volume and container or rain restrictions control the effect."
 },
 "srd-2024_cure-wounds": {
  "use": "Restore substantial Hit Points to an ally you can touch.",
  "watch": "You must reach the target; this isn't a ranged emergency heal."
 },
 "srd-2024_detect-evil-and-good": {
  "use": "Scan for specific supernatural creature types or consecrated areas.",
  "watch": "It doesn't reveal moral alignment, and barriers can block detection."
 },
 "srd-2024_detect-magic": {
  "use": "Search a room for magical presences and inspect visible auras.",
  "watch": "Concentration and barriers matter; sensing magic isn't full item identification."
 },
 "srd-2024_detect-poison-and-disease": {
  "use": "Check supplies, creatures, and suspicious locations for toxins or illness.",
  "watch": "The detection range and blocking materials still apply."
 },
 "srd-2024_disguise-self": {
  "use": "Change your visible appearance for infiltration or misdirection.",
  "watch": "The disguise is visual, and physical inspection can expose it."
 },
 "srd-2024_dissonant-whispers": {
  "use": "Damage one foe and potentially force it to move using its reaction.",
  "watch": "Its movement follows exact rules and can differ from voluntary movement."
 },
 "srd-2024_divine-favor": {
  "use": "Add radiant damage to repeated weapon attacks without concentration.",
  "watch": "Only your qualifying weapon attacks gain the extra damage during the duration."
 },
 "srd-2024_divine-smite": {
  "use": "Spend a slot after a qualifying melee hit to add radiant burst damage.",
  "watch": "The 2024 version uses a Bonus Action; you cannot stack unlimited slotted spells in one turn."
 },
 "srd-2024_ensnaring-strike": {
  "use": "Pin a fleeing opponent after connecting with a weapon attack.",
  "watch": "The triggering hit and saving throw both matter; check how restraint ends."
 },
 "srd-2024_entangle": {
  "use": "Restrain several enemies and make an area hard to cross.",
  "watch": "Creatures save when affected and can escape; maintain concentration."
 },
 "srd-2024_expeditious-retreat": {
  "use": "Increase your mobility across multiple rounds of a chase.",
  "watch": "It uses concentration and Bonus Actions, competing with other uses of those resources."
 },
 "srd-2024_faerie-fire": {
  "use": "Reveal hidden or invisible enemies and improve allies' attack accuracy.",
  "watch": "Enemies can save to avoid it, and the glow requires concentration."
 },
 "srd-2024_false-life": {
  "use": "Give yourself a buffer of Temporary Hit Points before entering danger.",
  "watch": "Temporary HP do not add together with another temporary-HP source."
 },
 "srd-2024_feather-fall": {
  "use": "Save falling allies by reacting before they hit the ground.",
  "watch": "It works only on the stated falling targets and needs the reaction trigger."
 },
 "srd-2024_find-familiar": {
  "use": "Use a summoned companion for scouting, delivery, or the Help action.",
  "watch": "It normally cannot attack; check the spell's permitted delivery and dismissal options."
 },
 "srd-2024_floating-disk": {
  "use": "Move bulky equipment without carrying it yourself.",
  "watch": "The disk has weight, elevation, and distance-following limits."
 },
 "srd-2024_fog-cloud": {
  "use": "Block sightlines to escape, reposition, or protect against ranged threats.",
  "watch": "It can obstruct your allies too, and wind may disperse it."
 },
 "srd-2024_goodberry": {
  "use": "Create convenient food and small healing resources for travel.",
  "watch": "Track the berries' expiration and the action needed to consume one."
 },
 "srd-2024_grease": {
  "use": "Make a small area slippery to topple or delay advancing foes.",
  "watch": "The area is limited and saving throws determine whether targets fall Prone."
 },
 "srd-2024_guiding-bolt": {
  "use": "Deliver radiant burst damage and set up an ally's next attack.",
  "watch": "The follow-up Advantage depends on hitting; a miss gives no benefit."
 },
 "srd-2024_healing-word": {
  "use": "Revive a fallen ally at range using a Bonus Action.",
  "watch": "Healing is modest; check the one-spell-slot-per-turn limit."
 },
 "srd-2024_hellish-rebuke": {
  "use": "Punish a creature that damages you with immediate fire damage.",
  "watch": "You need the reaction trigger and a spell slot, so reserve your Reaction."
 },
 "srd-2024_heroism": {
  "use": "Shield someone from fear and refresh their temporary HP each turn.",
  "watch": "Requires concentration, and temporary HP don't stack with other temporary HP."
 },
 "srd-2024_hex": {
  "use": "Add necrotic damage to repeated hits and hinder a chosen ability's checks.",
  "watch": "It affects ability checks, not saving throws; the bonus damage needs your attack hit."
 },
 "srd-2024_hideous-laughter": {
  "use": "Temporarily take one foe out of the fight with incapacitating laughter.",
  "watch": "The target can get further saves, and damage can help it recover."
 },
 "srd-2024_hunters-mark": {
  "use": "Improve repeated attacks on a priority target and aid tracking.",
  "watch": "Requires concentration; moving the mark uses a Bonus Action after its trigger."
 },
 "srd-2024_ice-knife": {
  "use": "Combine a direct ranged hit with a small icy burst around the target.",
  "watch": "The explosion can affect creatures even if the attack misses; position carefully."
 },
 "srd-2024_identify": {
  "use": "Learn the magic properties and usage of an item more precisely than Detect Magic.",
  "watch": "Check the pearl requirement and limits; it doesn't automatically expose every curse."
 },
 "srd-2024_illusory-script": {
  "use": "Hide a written message behind magical appearance for chosen readers.",
  "watch": "It disguises text rather than encrypting it against every magical detection method."
 },
 "srd-2024_inflict-wounds": {
  "use": "Deal strong necrotic damage to a target at close range.",
  "watch": "The 2024 version uses a saving throw; do not assume the older melee attack."
 },
 "srd-2024_jump": {
  "use": "Give a creature improved jumping as a mobility tool.",
  "watch": "Movement still obeys the spell's distance and landing conditions."
 },
 "srd-2024_longstrider": {
  "use": "Improve a creature's speed before exploration or combat.",
  "watch": "It increases speed, not teleportation or immunity to movement hazards."
 },
 "srd-2024_mage-armor": {
  "use": "Give an unarmored creature durable magical AC for the day.",
  "watch": "It doesn't work with worn armor; calculate AC from the spell's formula."
 },
 "srd-2024_magic-missile": {
  "use": "Deal reliable force damage without a spell attack against valid targets.",
  "watch": "The Shield spell can negate the darts; choose targets you can see."
 },
 "srd-2024_protection-from-evil-and-good": {
  "use": "Defend an ally against specified supernatural creature types.",
  "watch": "It requires concentration and a consumed material component in some rules text; check exact entry."
 },
 "srd-2024_purify-food-and-drink": {
  "use": "Cleanse a meal, water supply, or provisions before use.",
  "watch": "Only the food and drink specified by the spell are affected."
 },
 "srd-2024_ray-of-sickness": {
  "use": "Damage and potentially poison a single target from range.",
  "watch": "On a hit the target takes damage and becomes Poisoned until the end of your next turn; no separate save is listed."
 },
 "srd-2024_sanctuary": {
  "use": "Protect a vulnerable ally while they retreat or recover.",
  "watch": "The protection has exceptions and can end when the warded creature acts offensively."
 },
 "srd-2024_searing-smite": {
  "use": "Add fire damage on a melee hit and continue burning the target.",
  "watch": "It takes a triggering Bonus Action; the target can save to end lingering damage."
 },
 "srd-2024_shield": {
  "use": "Protect yourself from a triggering attack or Magic Missile with a Reaction.",
  "watch": "You must react at the stated trigger; AC bonus lasts only until your next turn."
 },
 "srd-2024_shield-of-faith": {
  "use": "Add a quick +2 AC defensive boost to a creature in range.",
  "watch": "Concentration ends if you start concentrating on another spell."
 },
 "srd-2024_silent-image": {
  "use": "Create a larger movable visual illusion to distract or conceal.",
  "watch": "It makes an image but no inherent sound or physical barrier."
 },
 "srd-2024_sleep": {
  "use": "Disable vulnerable targets after they fail the spell's saving throw sequence.",
  "watch": "The 2024 version is not an automatic hit-point pool; check the new staged effects."
 },
 "srd-2024_speak-with-animals": {
  "use": "Question nearby Beasts for clues about events or paths.",
  "watch": "Beasts aren't necessarily knowledgeable, friendly, or precise."
 },
 "srd-2024_thunderwave": {
  "use": "Push adjacent threats away while damaging an area.",
  "watch": "The origin and cube shape matter; its loud boom may attract attention."
 },
 "srd-2024_unseen-servant": {
  "use": "Delegate simple chores or manipulating ordinary objects for an hour.",
  "watch": "The servant cannot fight and is limited by distance and task complexity."
 },
 "srd-2024_acid-arrow": {
  "use": "Pressure a target with an acid hit that also damages it next turn.",
  "watch": "A miss deals only reduced initial damage; it doesn't apply the delayed damage."
 },
 "srd-2024_aid": {
  "use": "Boost a party's current and maximum Hit Points for many hours.",
  "watch": "Unlike temporary HP, its increase ends when the spell expires; recalculate carefully."
 },
 "srd-2024_alter-self": {
  "use": "Adapt with underwater breathing, natural weapons, or a changed body.",
  "watch": "It changes your actual physical form only in the listed ways, not all equipment."
 },
 "srd-2024_animal-messenger": {
  "use": "Send a short warning or request through a travelling Tiny Beast.",
  "watch": "Travel time, range, and the recipient's location make delivery uncertain."
 },
 "srd-2024_arcane-lock": {
  "use": "Secure a door, chest, or other closure against mundane entry.",
  "watch": "Keep the password and designated creatures in mind; Knock can counter it."
 },
 "srd-2024_arcanists-magic-aura": {
  "use": "Hide or falsify magical information to deceive divination.",
  "watch": "It changes what certain detection magic reads, not the item's real powers."
 },
 "srd-2024_augury": {
  "use": "Check whether an imminent plan seems favourable before committing.",
  "watch": "The omen is limited to a near-term action and can be uncertain."
 },
 "srd-2024_barkskin": {
  "use": "Raise a lightly armored creature's AC without outfitting them in armor.",
  "watch": "The spell sets a minimum AC; it doesn't stack as a separate numeric bonus."
 },
 "srd-2024_blindnessdeafness": {
  "use": "Disable a sight-dependent foe without using concentration.",
  "watch": "The target repeats its saving throw; choose between Blinded and Deafened."
 },
 "srd-2024_blur": {
  "use": "Make your character harder to hit while surviving incoming attacks.",
  "watch": "Requires concentration and doesn't fool creatures with certain special senses."
 },
 "srd-2024_calm-emotions": {
  "use": "Suppress hostility or fear/charm effects across a group.",
  "watch": "Creatures save, and a suppressed condition can return when the spell ends."
 },
 "srd-2024_continual-flame": {
  "use": "Make permanent-seeming magical light for a base or carried object.",
  "watch": "It requires costly consumed material, and some darkness effects can suppress it."
 },
 "srd-2024_darkness": {
  "use": "Create an area of magical darkness to block enemy vision.",
  "watch": "It also blinds allies without a way to see through magical darkness."
 },
 "srd-2024_darkvision": {
  "use": "Give a creature sight in darkness before entering unlit places.",
  "watch": "Darkvision doesn't turn darkness into bright light or reveal every hidden thing."
 },
 "srd-2024_detect-thoughts": {
  "use": "Probe surface thoughts or focus on one mind for social investigation.",
  "watch": "Deeper probing has saves and can reveal the intrusion; concentration is required."
 },
 "srd-2024_dragons-breath": {
  "use": "Let a creature exhale repeated elemental cones across combat.",
  "watch": "The target must use the specified action; avoid catching allies in its breath."
 },
 "srd-2024_enhance-ability": {
  "use": "Improve a chosen ability's checks before a skill-heavy challenge.",
  "watch": "It affects ability checks, not all saving throws; concentration lasts for the duration."
 },
 "srd-2024_enlargereduce": {
  "use": "Change size to aid grappling, mobility, damage, or fitting through spaces.",
  "watch": "Object and creature rules differ; note how space and equipment change."
 },
 "srd-2024_enthrall": {
  "use": "Divert observers' attention to help someone slip past unnoticed.",
  "watch": "This isn't invisibility or mind control; hostile or unaffected creatures may still notice."
 },
 "srd-2024_find-steed": {
  "use": "Summon a mount for travel and coordinated mounted combat.",
  "watch": "Review the steed's stat block, initiative, and how it disappears or returns."
 },
 "srd-2024_find-traps": {
  "use": "Get a warning about some nearby traps before passing through danger.",
  "watch": "The spell doesn't automatically reveal exact trap positions or mechanisms."
 },
 "srd-2024_flame-blade": {
  "use": "Make a fiery melee spell attack option without needing a weapon.",
  "watch": "Requires concentration; use the spell's attack instead of normal Extra Attack assumptions."
 },
 "srd-2024_flaming-sphere": {
  "use": "Block corridors or repeatedly burn enemies with a movable sphere.",
  "watch": "Moving or ramming it uses your Bonus Action and concentration."
 },
 "srd-2024_gentle-repose": {
  "use": "Preserve remains until revival magic or proper burial is possible.",
  "watch": "It doesn't revive anyone; remember the body and component requirements."
 },
 "srd-2024_gust-of-wind": {
  "use": "Clear gas or push a line of enemies away from the party.",
  "watch": "The line originates from you and requires concentration to sustain."
 },
 "srd-2024_heat-metal": {
  "use": "Pressure an armored or armed enemy through searing metal.",
  "watch": "Needs a manufactured metal target and concentration; bonus actions sustain its impact."
 },
 "srd-2024_hold-person": {
  "use": "Paralyze a Humanoid to create a decisive opening for melee allies.",
  "watch": "Only Humanoids qualify, and repeated Wisdom saves can free the target."
 },
 "srd-2024_invisibility": {
  "use": "Help a scout slip into place or disengage from sight-based threats.",
  "watch": "Attacking or casting spells can end it, and invisible doesn't mean undetectable."
 },
 "srd-2024_knock": {
  "use": "Open a stubborn lock or magically sealed closure in a hurry.",
  "watch": "The loud sound can ruin stealth and may alert guards."
 },
 "srd-2024_lesser-restoration": {
  "use": "End a debilitating condition and return an ally to action.",
  "watch": "It removes only one condition on its list, not any disease or curse automatically."
 },
 "srd-2024_levitate": {
  "use": "Raise an ally out of danger or hold an enemy off the ground.",
  "watch": "Unwilling targets save; horizontal travel is limited without another force."
 },
 "srd-2024_locate-animals-or-plants": {
  "use": "Find a particular kind of local animal or plant to forage or track.",
  "watch": "It gives direction and distance only for the specified kind, not a map."
 },
 "srd-2024_locate-object": {
  "use": "Trace a familiar item or the nearest item of a type.",
  "watch": "Lead and other listed barriers can block detection; concentration is required."
 },
 "srd-2024_magic-mouth": {
  "use": "Create a triggered spoken warning or message on an object.",
  "watch": "The trigger is limited to observable circumstances as written."
 },
 "srd-2024_magic-weapon": {
  "use": "Improve an ordinary weapon before facing resistant enemies.",
  "watch": "The 2024 spell does not require concentration; check higher-slot bonus thresholds."
 },
 "srd-2024_mind-spike": {
  "use": "Damage one foe while tracking its position for a period.",
  "watch": "The location sense depends on failing the save and maintaining concentration."
 },
 "srd-2024_mirror-image": {
  "use": "Deflect some incoming attacks with copies that can be destroyed.",
  "watch": "Illusions are not extra HP and some senses bypass the decoy mechanic."
 },
 "srd-2024_misty-step": {
  "use": "Teleport out of a grappled position or into advantageous terrain.",
  "watch": "You need to see an empty destination; it takes your Bonus Action."
 },
 "srd-2024_moonbeam": {
  "use": "Punish enemies who start within or move into a focused radiant beam.",
  "watch": "Moving the beam costs an action; track when damage triggers carefully."
 },
 "srd-2024_pass-without-trace": {
  "use": "Make party stealth much more reliable for infiltration or escape.",
  "watch": "Concentration and staying within the area matter; it doesn't make anyone invisible."
 },
 "srd-2024_phantasmal-force": {
  "use": "Trap a target in a personally convincing damaging illusion.",
  "watch": "The target can investigate the illusion; the GM adjudicates believable details."
 },
 "srd-2024_prayer-of-healing": {
  "use": "Give the group a strong rest-like recovery during a quiet interval.",
  "watch": "The casting takes 1 minute in this 2024 dataset, and each creature benefits only once per Long Rest."
 },
 "srd-2024_protection-from-poison": {
  "use": "Remove a poisoned condition and ward against further poison.",
  "watch": "It isn't universal immunity; distinguish poison damage resistance from the condition."
 },
 "srd-2024_ray-of-enfeeblement": {
  "use": "Reduce one enemy's physical offence with a debilitating curse.",
  "watch": "The target saves and can recover; check exactly which attacks are penalized."
 },
 "srd-2024_rope-trick": {
  "use": "Hide the party in a temporary extradimensional refuge.",
  "watch": "Creatures still must climb up and fit; the refuge expires after its duration."
 },
 "srd-2024_scorching-ray": {
  "use": "Make several fire attacks and distribute them across multiple targets.",
  "watch": "Each ray has its own attack roll; missing one doesn't negate the others."
 },
 "srd-2024_see-invisibility": {
  "use": "Spot invisible creatures and into the Ethereal Plane nearby.",
  "watch": "Seeing invisible creatures doesn't automatically remove all concealment or cover."
 },
 "srd-2024_shatter": {
  "use": "Blast clustered enemies or fragile objects with thunder damage.",
  "watch": "Creatures save, and the sound plus object damage can cause collateral effects."
 },
 "srd-2024_shining-smite": {
  "use": "Reveal a dangerous foe and help allies land follow-up attacks.",
  "watch": "Concentration is needed for the ongoing glow; it begins after a qualifying hit."
 },
 "srd-2024_silence": {
  "use": "Shut down verbal spellcasting or hide sounds in a designated area.",
  "watch": "It can hinder allied casters too and does not stop spells without verbal components."
 },
 "srd-2024_spider-climb": {
  "use": "Traverse walls and ceilings to scout or bypass obstacles.",
  "watch": "Concentration ends the benefit; be careful about falling from a height."
 },
 "srd-2024_spike-growth": {
  "use": "Control a choke point and punish creatures that move through it.",
  "watch": "Allies can suffer from the spikes too; position and forced movement need care."
 },
 "srd-2024_spiritual-weapon": {
  "use": "Add a continuing melee spell attack from a conjured spectral weapon.",
  "watch": "The 2024 version requires concentration; don't rely on older no-concentration advice."
 },
 "srd-2024_suggestion": {
  "use": "Nudge a target toward a plausible course of action in or out of combat.",
  "watch": "It must be an achievable suggestion; target comprehension and saves apply."
 },
 "srd-2024_warding-bond": {
  "use": "Protect one ally by sharing the damage they take.",
  "watch": "The caster also suffers matching damage; range and paired rings are crucial."
 },
 "srd-2024_web": {
  "use": "Restrain clustered enemies and create hazardous difficult terrain.",
  "watch": "Fire can burn webs away, and allies can also be caught or impeded."
 },
 "srd-2024_zone-of-truth": {
  "use": "Question suspects when deliberate lying would matter.",
  "watch": "Targets may evade questions, remain silent, or pass the Charisma save."
 },
 "srd-2024_animate-dead": {
  "use": "Create persistent undead helpers for hauling, guarding, or fighting.",
  "watch": "Maintain control as the spell requires; undead are not harmless companions."
 },
 "srd-2024_beacon-of-hope": {
  "use": "Set up a healing-intensive battle and protect allies against critical saves.",
  "watch": "It requires concentration, and its healing benefit applies while active."
 },
 "srd-2024_bestow-curse": {
  "use": "Debilitate a dangerous single creature with a chosen curse effect.",
  "watch": "You must touch the target; read the selected curse's save and duration rules."
 },
 "srd-2024_blink": {
  "use": "Protect yourself from attacks by periodically shifting into the Ethereal Plane.",
  "watch": "The shift is based on a die roll, so you cannot depend on vanishing every round."
 },
 "srd-2024_call-lightning": {
  "use": "Sustain repeated lightning strikes when enemies will remain in one area.",
  "watch": "Requires concentration and appropriate space for the storm cloud."
 },
 "srd-2024_clairvoyance": {
  "use": "Inspect or listen to an inaccessible location without entering it.",
  "watch": "You choose hearing or sight and need an eligible sensor location."
 },
 "srd-2024_conjure-animals": {
  "use": "Place a damaging spectral animal effect in a crowded battlefield.",
  "watch": "The 2024 spell is not a menu for summoning numerous beast stat blocks."
 },
 "srd-2024_counterspell": {
  "use": "Interrupt a visible creature casting a spell at a decisive moment.",
  "watch": "The target gets the 2024 Constitution save; do not assume automatic cancellation."
 },
 "srd-2024_create-food-and-water": {
  "use": "Sustain travellers when ordinary provisions run out.",
  "watch": "The amount and duration are specified; it isn't a combat healing spell."
 },
 "srd-2024_daylight": {
  "use": "Light a large region to counter ordinary darkness and expose threats.",
  "watch": "Despite its name, not every effect treats it as actual sunlight."
 },
 "srd-2024_dispel-magic": {
  "use": "End an active spell that is blocking travel or harming the party.",
  "watch": "It affects spells, not every magical effect; higher-level spells can require a check."
 },
 "srd-2024_fear": {
  "use": "Force nearby enemies to flee and drop what they hold.",
  "watch": "The cone affects a limited area, and targets can later escape the condition."
 },
 "srd-2024_fireball": {
  "use": "Hit multiple enemies at once with a large burst of fire.",
  "watch": "Choose the centre carefully; allies and flammable surroundings may be affected."
 },
 "srd-2024_fly": {
  "use": "Grant flight to reach terrain, cross gaps, or evade ground-only threats.",
  "watch": "Concentration loss can cause a dangerous fall."
 },
 "srd-2024_gaseous-form": {
  "use": "Slip through narrow openings and escape physical confinement.",
  "watch": "The gaseous creature has restricted actions and special movement limits."
 },
 "srd-2024_glyph-of-warding": {
  "use": "Prepare a protective or harmful trigger for a location in advance.",
  "watch": "Long casting time, costly materials, and movement restrictions make it a trap, not a quick bomb."
 },
 "srd-2024_haste": {
  "use": "Enhance one ally's movement and action economy during an important fight.",
  "watch": "When the spell ends, the target loses a turn of action and movement as specified."
 },
 "srd-2024_hypnotic-pattern": {
  "use": "Temporarily disable a large group without directly damaging them.",
  "watch": "Allies can break the effect by damaging or waking the targets."
 },
 "srd-2024_lightning-bolt": {
  "use": "Strike clustered enemies in a straight line with heavy lightning damage.",
  "watch": "Line placement is crucial; creatures on the line make Dexterity saves."
 },
 "srd-2024_magic-circle": {
  "use": "Protect or imprison the specified otherworldly creature types.",
  "watch": "Plan the orientation and casting time; it isn't a last-second combat shield."
 },
 "srd-2024_major-image": {
  "use": "Create a believable multisensory illusion across a sizable area.",
  "watch": "Physical contact or investigative scrutiny can reveal the deception."
 },
 "srd-2024_mass-healing-word": {
  "use": "Revive multiple downed allies quickly without using your action.",
  "watch": "The healing per person is modest; choose visible recipients in range."
 },
 "srd-2024_meld-into-stone": {
  "use": "Hide yourself inside a stone surface during surveillance or emergencies.",
  "watch": "Damage and environmental changes can expel or harm you; read the exit rules."
 },
 "srd-2024_nondetection": {
  "use": "Hide a creature or object from divination tracking and sensors.",
  "watch": "It doesn't confer invisibility; the consumed material component matters."
 },
 "srd-2024_phantom-steed": {
  "use": "Provide fast temporary transport for scouting and travel.",
  "watch": "The steed disappears under its specified conditions, so plan the dismount."
 },
 "srd-2024_plant-growth": {
  "use": "Turn vegetation into a travel barrier or enrich land over time.",
  "watch": "The immediate growth requires an area with plants; distinguish both casting modes."
 },
 "srd-2024_protection-from-energy": {
  "use": "Shield one ally against a chosen elemental damage type.",
  "watch": "It grants resistance to one selected type and requires concentration."
 },
 "srd-2024_remove-curse": {
  "use": "End a curse on a creature or object when possible.",
  "watch": "Some curses have special removal requirements; don't assume all magical afflictions qualify."
 },
 "srd-2024_revivify": {
  "use": "Bring back a recently dead companion before the short time limit expires.",
  "watch": "You need the consumed diamond and the qualifying body within the deadline."
 },
 "srd-2024_sending": {
  "use": "Send a short long-distance message and receive a response.",
  "watch": "The message has a strict word limit and possible planar complications."
 },
 "srd-2024_sleet-storm": {
  "use": "Break enemy concentration and hamper movement over a broad area.",
  "watch": "The storm also interferes with allied visibility and travel."
 },
 "srd-2024_slow": {
  "use": "Weaken several opponents without requiring them to cluster tightly.",
  "watch": "Enemies save and can recover; check the precise action and movement restrictions."
 },
 "srd-2024_speak-with-dead": {
  "use": "Question a corpse about past events without reviving it.",
  "watch": "It answers only from its former knowledge and isn't compelled to be truthful."
 },
 "srd-2024_speak-with-plants": {
  "use": "Gather local information or influence nearby vegetation.",
  "watch": "Plants' knowledge and the spell's control are limited to its descriptions."
 },
 "srd-2024_spirit-guardians": {
  "use": "Protect a frontline caster with sustained damaging close-range spirits.",
  "watch": "Concentration, emanation movement, and damage timing all matter."
 },
 "srd-2024_stinking-cloud": {
  "use": "Force enemies to waste turns in a nauseating, obscuring cloud.",
  "watch": "Wind and poison-related protections may reduce effectiveness."
 },
 "srd-2024_tiny-hut": {
  "use": "Create a safe temporary campsite when the group can pause.",
  "watch": "Casting time and placement prevent using it as an instant combat dome."
 },
 "srd-2024_tongues": {
  "use": "Bridge spoken or signed language gaps in a negotiation.",
  "watch": "It helps understanding and communication, not reading unknown written languages."
 },
 "srd-2024_vampiric-touch": {
  "use": "Sustain melee necrotic damage while healing yourself on hits.",
  "watch": "You must stay within melee reach and concentrate to repeat the attack."
 },
 "srd-2024_water-breathing": {
  "use": "Prepare the party for a submerged expedition or ambush.",
  "watch": "It grants breathing, not a swim speed or protection from underwater hazards."
 },
 "srd-2024_water-walk": {
  "use": "Cross water, mud, or similar surfaces as solid ground.",
  "watch": "It does not prevent heat damage from lava or other hazardous surfaces."
 },
 "srd-2024_wind-wall": {
  "use": "Block ordinary arrows, gas, or small flying creatures along a boundary.",
  "watch": "It is not an absolute barrier to every spell or projectile."
 },
 "srd-2024_arcane-eye": {
  "use": "Scout dangerous passages with an invisible mobile magical sensor.",
  "watch": "The eye has sight limitations, and using it keeps your concentration occupied."
 },
 "srd-2024_aura-of-life": {
  "use": "Protect clustered allies from necrotic harm and dropping out of the fight.",
  "watch": "Keep allies inside the moving aura and maintain concentration."
 },
 "srd-2024_banishment": {
  "use": "Remove a powerful outsider or other foe temporarily to swing action economy.",
  "watch": "The target gets a Charisma save; permanent exile has additional requirements."
 },
 "srd-2024_black-tentacles": {
  "use": "Trap multiple foes in a dangerous restrained zone.",
  "watch": "Your allies must avoid the difficult terrain and ongoing effect."
 },
 "srd-2024_blight": {
  "use": "Deal high necrotic damage to a priority target.",
  "watch": "Its special plant interaction is useful but doesn't apply to every creature."
 },
 "srd-2024_charm-monster": {
  "use": "Improve negotiations with a non-Humanoid creature.",
  "watch": "In combat the target may have Advantage on its save, and charm isn't obedience."
 },
 "srd-2024_compulsion": {
  "use": "Steer several creatures' movement away from objectives or into bad positions.",
  "watch": "Targets can save; don't assume you control their entire turns."
 },
 "srd-2024_confusion": {
  "use": "Disrupt enemy coordination when several creatures cluster together.",
  "watch": "Results are random and affected targets can regain control."
 },
 "srd-2024_conjure-minor-elementals": {
  "use": "Add elemental damage to your own attacks in a close-range fight.",
  "watch": "The 2024 version is a damaging emanation, not separate summons; concentration required."
 },
 "srd-2024_conjure-woodland-beings": {
  "use": "Create a moving fey-themed damage and protection zone.",
  "watch": "The 2024 effect does not summon multiple independent fey stat blocks."
 },
 "srd-2024_control-water": {
  "use": "Manipulate a significant body of water to open or block passage.",
  "watch": "It works only on appropriate water and follows the listed effect options."
 },
 "srd-2024_death-ward": {
  "use": "Give an ally one emergency safeguard against being dropped or killed.",
  "watch": "It triggers only once and then ends; apply the exact trigger conditions."
 },
 "srd-2024_dimension-door": {
  "use": "Teleport yourself and potentially one companion past a major obstacle.",
  "watch": "You don't need to see the destination, but arriving inside matter is dangerous."
 },
 "srd-2024_divination": {
  "use": "Seek a cryptic answer about a future goal or event.",
  "watch": "The GM supplies an omen, not an infallible detailed prediction."
 },
 "srd-2024_dominate-beast": {
  "use": "Control a Beast's actions for a limited time.",
  "watch": "It gets a Wisdom save and further chances under the spell's conditions."
 },
 "srd-2024_fabricate": {
  "use": "Turn raw materials into useful crafted objects during downtime.",
  "watch": "You need sufficient materials and relevant tool proficiency for fine craftsmanship."
 },
 "srd-2024_faithful-hound": {
  "use": "Guard a location with a spectral watchdog that can attack intruders.",
  "watch": "It stays in place and follows specific detection and attack restrictions."
 },
 "srd-2024_fire-shield": {
  "use": "Punish attackers and gain resistance to one element while enduring melee.",
  "watch": "The damage triggers only under listed circumstances, not every attack at range."
 },
 "srd-2024_freedom-of-movement": {
  "use": "Keep an ally mobile against restraint, difficult terrain, or underwater hazards.",
  "watch": "It covers specific hindrances; it doesn't grant blanket condition immunity."
 },
 "srd-2024_giant-insect": {
  "use": "Turn nearby insects into an allied combat force.",
  "watch": "Use the spell's supplied creature rules; duration and concentration apply."
 },
 "srd-2024_greater-invisibility": {
  "use": "Allow an ally to attack while still benefiting from invisibility.",
  "watch": "Concentration and see-invisibility counters still matter."
 },
 "srd-2024_guardian-of-faith": {
  "use": "Station a radiant guardian at a choke point for a coming fight.",
  "watch": "It has a limited total damage budget and remains at its location."
 },
 "srd-2024_hallucinatory-terrain": {
  "use": "Make an area look, sound, and smell like different terrain.",
  "watch": "The underlying terrain doesn't physically change; creatures can investigate."
 },
 "srd-2024_ice-storm": {
  "use": "Deal mixed damage and make a wide area temporarily hard to cross.",
  "watch": "Allies in the blast save too; terrain obstruction doesn't persist indefinitely."
 },
 "srd-2024_locate-creature": {
  "use": "Track a known creature's direction within the spell's specified range.",
  "watch": "Running water and other blocking conditions can interfere."
 },
 "srd-2024_phantasmal-killer": {
  "use": "Terrify a creature with a painful personal illusion.",
  "watch": "Repeated saves can end it; it requires concentration."
 },
 "srd-2024_polymorph": {
  "use": "Turn a creature into a Beast for survival, scouting, or tactical disruption.",
  "watch": "The new form's stat block replaces key capabilities; concentration and saves matter."
 },
 "srd-2024_private-sanctum": {
  "use": "Protect a room against spying and certain teleportation or planar access.",
  "watch": "A long setup time and restricted area make it an advance preparation tool."
 },
 "srd-2024_resilient-sphere": {
  "use": "Temporarily isolate a creature or protect it from external effects.",
  "watch": "The sphere also blocks the trapped creature's attacks and movement options."
 },
 "srd-2024_secret-chest": {
  "use": "Hide an important chest on the Ethereal Plane for later retrieval.",
  "watch": "You need the costly paired chests and must respect retrieval time limits."
 },
 "srd-2024_stone-shape": {
  "use": "Make an opening, seal a passage, or reshape a useful stone object.",
  "watch": "There are size restrictions, and fine mechanical details may be impossible."
 },
 "srd-2024_stoneskin": {
  "use": "Protect a frontline ally against physical weapon damage.",
  "watch": "It has material-component requirements and concentration; check damage types precisely."
 },
 "srd-2024_vitriolic-sphere": {
  "use": "Blast a group with acid and lingering injury on failed saves.",
  "watch": "A successful save changes follow-up damage; read the two-stage timing."
 },
 "srd-2024_wall-of-fire": {
  "use": "Divide a battlefield and hurt enemies on one side of a flaming barrier.",
  "watch": "Set which side burns and avoid damaging allies through poor placement."
 },
 "srd-2024_animate-objects": {
  "use": "Turn loose unattended objects into several allied attackers.",
  "watch": "Object size controls numbers; concentration and action commands matter."
 },
 "srd-2024_antilife-shell": {
  "use": "Keep living enemies out of close quarters while withdrawing or defending.",
  "watch": "The barrier has creature-type exceptions and can be disrupted by moving it onto foes."
 },
 "srd-2024_arcane-hand": {
  "use": "Manipulate, block, push, or strike using a large magical hand.",
  "watch": "Commands compete for your Bonus Action and options have different checks."
 },
 "srd-2024_awaken": {
  "use": "Give an eligible animal or plant intelligence and agency over a long-term story.",
  "watch": "Expensive components and a long casting time make it a narrative tool."
 },
 "srd-2024_cloudkill": {
  "use": "Force foes away from a location with lingering poisonous gas.",
  "watch": "Poison immunity, terrain, wind, and drifting cloud movement are major factors."
 },
 "srd-2024_commune": {
  "use": "Ask a deity or divine agents direct questions during preparation.",
  "watch": "Responses are limited and repeated castings may become unreliable."
 },
 "srd-2024_commune-with-nature": {
  "use": "Learn broad geographic and ecological facts across a wide region.",
  "watch": "It informs you about the region, not every creature's exact position."
 },
 "srd-2024_cone-of-cold": {
  "use": "Deliver a large burst of cold damage against a packed enemy front.",
  "watch": "A cone originates from you and can catch allies."
 },
 "srd-2024_conjure-elemental": {
  "use": "Control territory with an elemental-themed persistent hazard.",
  "watch": "The 2024 spell creates an effect rather than a summoned creature stat block."
 },
 "srd-2024_contact-other-plane": {
  "use": "Get unusual information by questioning an extraplanar intelligence.",
  "watch": "The spell includes a dangerous Intelligence save and possible mental harm."
 },
 "srd-2024_contagion": {
  "use": "Inflict a debilitating magical disease-like condition on one enemy.",
  "watch": "The effect has attack/save stages and particular duration rules."
 },
 "srd-2024_creation": {
  "use": "Make a temporary object of useful material when supplies are missing.",
  "watch": "Duration depends on material type; components and size limits still apply."
 },
 "srd-2024_dispel-evil-and-good": {
  "use": "Defend against supernatural intruders or send them away.",
  "watch": "Effects target specified creature types and can require touch or saves."
 },
 "srd-2024_dominate-person": {
  "use": "Force a Humanoid to obey commands while you concentrate.",
  "watch": "Its Wisdom save and repeat-save triggers limit sustained control."
 },
 "srd-2024_dream": {
  "use": "Send a message or troubling vision to a sleeping creature far away.",
  "watch": "The nightmare option has saves and specific creature or sleep restrictions."
 },
 "srd-2024_flame-strike": {
  "use": "Damage a clustered group with mixed fire and radiant energy.",
  "watch": "Place the cylinder carefully and apply the separate damage types."
 },
 "srd-2024_geas": {
  "use": "Impose a powerful longer-term command in a story or negotiation.",
  "watch": "This is not total mind control; charm, duration, and penalty rules constrain it."
 },
 "srd-2024_greater-restoration": {
  "use": "Remove severe debuffs that Lesser Restoration cannot address.",
  "watch": "It requires costly consumed diamond dust and only covers listed effects."
 },
 "srd-2024_hallow": {
  "use": "Bless or ward a site for a campaign base, temple, or sanctuary.",
  "watch": "Casting takes a day and costly components; effects are location-bound."
 },
 "srd-2024_hold-monster": {
  "use": "Paralyze a dangerous creature beyond the Humanoid-only restriction.",
  "watch": "The target can repeat its save; paralysis may create huge melee opportunities."
 },
 "srd-2024_insect-plague": {
  "use": "Create a damaging swarming area to discourage pursuit.",
  "watch": "The area hampers allies too; concentration limits other active spells."
 },
 "srd-2024_legend-lore": {
  "use": "Learn important lore about a notable person, place, or object.",
  "watch": "The subject must be sufficiently significant; answers can be cryptic."
 },
 "srd-2024_mass-cure-wounds": {
  "use": "Restore many teammates' Hit Points in the middle of a large battle.",
  "watch": "All targets must be within the chosen area, and healing doesn't remove every condition."
 },
 "srd-2024_mislead": {
  "use": "Disappear from sight and send an illusory double to distract watchers.",
  "watch": "Controlling the duplicate can occupy your action and concentration."
 },
 "srd-2024_modify-memory": {
  "use": "Alter an eligible creature's recollection of a particular event.",
  "watch": "The target saves and changes are bounded by event length and plausibility."
 },
 "srd-2024_passwall": {
  "use": "Open a short passage through an otherwise solid wall or obstruction.",
  "watch": "It has depth and material limits, and the passage closes afterward."
 },
 "srd-2024_planar-binding": {
  "use": "Hold a summoned or otherworldly creature to extended service.",
  "watch": "Requires long casting, expensive components, and a target kept in range."
 },
 "srd-2024_raise-dead": {
  "use": "Restore someone dead for several days when Revivify is too late.",
  "watch": "Requires a costly diamond and a viable soul; recovery penalties apply."
 },
 "srd-2024_reincarnate": {
  "use": "Return a dead Humanoid to life in a new body.",
  "watch": "The new body's traits may differ, and valuable components are consumed."
 },
 "srd-2024_scrying": {
  "use": "Watch a distant known subject while planning the next move.",
  "watch": "The target can save, and familiarity or a personal connection changes success chances."
 },
 "srd-2024_seeming": {
  "use": "Disguise an entire group for a coordinated infiltration.",
  "watch": "Willing and unwilling targets have different interactions; appearance isn't substance."
 },
 "srd-2024_summon-dragon": {
  "use": "Bring a scalable draconic ally into a sustained encounter.",
  "watch": "Maintain concentration and use its stat block, not an adult dragon's statistics."
 },
 "srd-2024_telekinesis": {
  "use": "Move obstacles or contest a foe's position without touching them.",
  "watch": "Some effects require checks and repeated actions; concentration matters."
 },
 "srd-2024_telepathic-bond": {
  "use": "Connect the party for silent coordination across long distances.",
  "watch": "Only the chosen linked creatures communicate, and planar separation has limits."
 },
 "srd-2024_teleportation-circle": {
  "use": "Travel to a permanent known circle when an escape or shortcut is needed.",
  "watch": "It requires a sigil sequence and costly components; its portal opens only briefly."
 },
 "srd-2024_tree-stride": {
  "use": "Use trees as stepping stones through a forest battlefield.",
  "watch": "Tree size, species, distance and remaining movement restrict each jump."
 },
 "srd-2024_wall-of-force": {
  "use": "Separate enemies from a fight with an almost impassable invisible wall.",
  "watch": "Concentration is required, and clever opponents may use countermeasures like teleportation."
 },
 "srd-2024_wall-of-stone": {
  "use": "Build a sturdy obstruction or structure during downtime or combat.",
  "watch": "Its panels and connection rules matter; permanence requires concentration for the full duration."
 },
 "srd-2024_blade-barrier": {
  "use": "Set a wall of magical blades to block movement through a choke point.",
  "watch": "The wall damages creatures at specified trigger points, not continuously every moment."
 },
 "srd-2024_chain-lightning": {
  "use": "Strike multiple separated targets without needing a traditional circular blast.",
  "watch": "Secondary bolts must satisfy the target and distance restrictions."
 },
 "srd-2024_circle-of-death": {
  "use": "Clear a vast area of enemies with necrotic magic.",
  "watch": "Its very large sphere can easily include allies or bystanders."
 },
 "srd-2024_conjure-fey": {
  "use": "Create a mobile fey-themed supernatural effect that pressures enemies.",
  "watch": "The 2024 version is not a separately controlled fey creature stat block."
 },
 "srd-2024_contingency": {
  "use": "Prepare a defensive or escape spell to trigger under chosen circumstances.",
  "watch": "The paired spell must satisfy the level and targeting requirements."
 },
 "srd-2024_create-undead": {
  "use": "Recruit stronger undead servants for sustained operations.",
  "watch": "Time of casting, expensive components, and control renewal are essential."
 },
 "srd-2024_disintegrate": {
  "use": "Hit a priority target or destroy an eligible nonmagical obstacle.",
  "watch": "The target gets a Dexterity save, and destruction effects follow strict rules."
 },
 "srd-2024_eyebite": {
  "use": "Use a sustained magical gaze to disable one enemy after another.",
  "watch": "You need concentration and spend actions to apply subsequent effects."
 },
 "srd-2024_find-the-path": {
  "use": "Locate a viable route toward a familiar destination through difficult territory.",
  "watch": "The location must meet the spell's familiarity rules; it isn't generic GPS."
 },
 "srd-2024_flesh-to-stone": {
  "use": "Petrify a foe through a sequence of Constitution saving throws.",
  "watch": "The transformation is staged; the target may escape before becoming stone."
 },
 "srd-2024_forbiddance": {
  "use": "Protect a large location against planar incursions and teleportation.",
  "watch": "Long casting, materials, and site-specific restrictions make it preparation magic."
 },
 "srd-2024_freezing-sphere": {
  "use": "Blast a large area or freeze water for unusual battlefield control.",
  "watch": "Its delayed globe option and the freezing-water rules need careful timing."
 },
 "srd-2024_globe-of-invulnerability": {
  "use": "Protect clustered allies from lower-level spells in a crucial fight.",
  "watch": "The globe doesn't block every spell level and requires concentration."
 },
 "srd-2024_guards-and-wards": {
  "use": "Turn a stronghold into a maze of magical security effects.",
  "watch": "Casting and coverage require time and planning; defenders need to know its layout."
 },
 "srd-2024_harm": {
  "use": "Cut into one creature's Hit Points with major necrotic damage.",
  "watch": "A Constitution save affects damage and the spell has restrictions on HP reduction."
 },
 "srd-2024_heal": {
  "use": "Restore a large amount of HP and end listed conditions in one action.",
  "watch": "It is not a universal curse breaker; use only the stated condition removals."
 },
 "srd-2024_heroes-feast": {
  "use": "Prepare the entire party for a major dangerous expedition.",
  "watch": "Its benefits take time and an expensive consumed component."
 },
 "srd-2024_instant-summons": {
  "use": "Mark an item for later recall across distance.",
  "watch": "The paired sapphire and conditions for another creature holding the item matter."
 },
 "srd-2024_irresistible-dance": {
  "use": "Force one creature into a distracting dance that hinders its actions.",
  "watch": "The target has a chance to break the effect; concentration is required."
 },
 "srd-2024_magic-jar": {
  "use": "Attempt to possess another Humanoid while your body remains vulnerable.",
  "watch": "The spell has intricate possession, soul, and container failure conditions."
 },
 "srd-2024_mass-suggestion": {
  "use": "Influence many creatures toward one reasonable course without concentration.",
  "watch": "Targets must understand the instruction, and reasonable wording matters."
 },
 "srd-2024_move-earth": {
  "use": "Reshape dirt, sand, or clay for fortifications or excavation.",
  "watch": "Changes take time, and the spell does not control solid rock."
 },
 "srd-2024_planar-ally": {
  "use": "Seek aid from a divine or extraplanar servant for a significant task.",
  "watch": "The visitor can negotiate payment and is not automatically under your control."
 },
 "srd-2024_programmed-illusion": {
  "use": "Set up a persistent illusion that triggers when conditions are met.",
  "watch": "Triggers and repeating behaviour are limited to the scripted details."
 },
 "srd-2024_sunbeam": {
  "use": "Sweep a radiant beam across enemies over several rounds.",
  "watch": "Reuse costs an action and concentration; check sunlight interactions."
 },
 "srd-2024_transport-via-plants": {
  "use": "Move the party between familiar living plants on the same plane.",
  "watch": "Both plants must qualify, and the portal duration is brief."
 },
 "srd-2024_true-seeing": {
  "use": "Give a scout the ability to pierce many magical visual deceptions.",
  "watch": "Truesight has a range and doesn't confer omniscience or automatic detection."
 },
 "srd-2024_wall-of-ice": {
  "use": "Create a cold-damage wall that blocks movement and sightlines.",
  "watch": "Breaking sections can leave dangerous cold air and cause further effects."
 },
 "srd-2024_wall-of-thorns": {
  "use": "Trap or redirect foes with a sharply damaging hedge.",
  "watch": "Your own allies may be harmed crossing or standing near the barrier."
 },
 "srd-2024_wind-walk": {
  "use": "Travel enormous distances as cloud forms with several companions.",
  "watch": "Changing into and out of cloud form takes time; it isn't instant combat flight."
 },
 "srd-2024_word-of-recall": {
  "use": "Escape with a group back to a designated sanctuary.",
  "watch": "You must establish the sanctuary in advance and keep travellers close."
 },
 "srd-2024_arcane-sword": {
  "use": "Create a floating weapon to attack targets over successive rounds.",
  "watch": "It needs concentration; moving and reattacking use the specified Bonus Action."
 },
 "srd-2024_conjure-celestial": {
  "use": "Call forth a celestial-themed powerful support or damaging effect.",
  "watch": "The 2024 rules do not grant an independent celestial monster stat block."
 },
 "srd-2024_delayed-blast-fireball": {
  "use": "Plant an explosion that grows stronger while you maintain it.",
  "watch": "Concentration can end the countdown early, and others may interact with the bead."
 },
 "srd-2024_divine-word": {
  "use": "Disrupt or banish foes depending on their remaining Hit Points.",
  "watch": "Different HP bands have distinct effects; check target hearing and creature type."
 },
 "srd-2024_etherealness": {
  "use": "Phase into the Ethereal Plane for scouting or travel.",
  "watch": "You have limited interaction with the Material Plane while away."
 },
 "srd-2024_finger-of-death": {
  "use": "Deal massive necrotic damage and perhaps create an undead servant.",
  "watch": "The zombie rider has a specific kill condition; don't assume every death qualifies."
 },
 "srd-2024_fire-storm": {
  "use": "Arrange several fiery areas to damage enemies while avoiding parts of the field.",
  "watch": "Shape placement and creature saving throws still govern each affected area."
 },
 "srd-2024_forcecage": {
  "use": "Imprison a major threat without needing ongoing concentration.",
  "watch": "Size and cage/box choice matter; teleportation can have a save or limitation."
 },
 "srd-2024_magnificent-mansion": {
  "use": "Give the party comfortable extradimensional shelter for rest or social scenes.",
  "watch": "Only permitted entrances and occupants apply; the mansion expires afterward."
 },
 "srd-2024_mirage-arcane": {
  "use": "Transform the experience of a large landscape for an illusion-heavy plan.",
  "watch": "It has unusual sensory and physical interactions; consult the full text carefully."
 },
 "srd-2024_plane-shift": {
  "use": "Travel to another plane or attempt to expel a hostile creature.",
  "watch": "Voluntary travel and unwilling banishment have different targeting and saves."
 },
 "srd-2024_prismatic-spray": {
  "use": "Blast enemies with randomly assigned coloured magical effects.",
  "watch": "Each ray colour has its own resolution; randomness makes damage unpredictable."
 },
 "srd-2024_project-image": {
  "use": "Appear remotely to speak and observe without entering danger.",
  "watch": "The image's sensory limits and concentration prevent treating it as a body."
 },
 "srd-2024_regenerate": {
  "use": "Restore ongoing healing and recover missing body parts over time.",
  "watch": "Initial and continuing healing have distinct timing; check how injuries regrow."
 },
 "srd-2024_resurrection": {
  "use": "Restore a long-dead creature after lesser revival spells no longer qualify.",
  "watch": "It requires expensive components and may not undo death from old age."
 },
 "srd-2024_reverse-gravity": {
  "use": "Lift a crowd or objects into the air to control a battlefield.",
  "watch": "Ceilings, falling damage, and reactions to hold on can change the outcome."
 },
 "srd-2024_sequester": {
  "use": "Hide and suspend a willing creature or object for long-term protection.",
  "watch": "A condition for ending it and costly materials must be chosen in advance."
 },
 "srd-2024_simulacrum": {
  "use": "Make a duplicate ally for a complex long-term plan.",
  "watch": "The duplicate has restrictions on recovery, spell slots, and replacement."
 },
 "srd-2024_symbol": {
  "use": "Set a powerful magical trap with an effect chosen at casting.",
  "watch": "Its triggers, expensive components, and target area require preparation."
 },
 "srd-2024_teleport": {
  "use": "Transport a group rapidly to a distant destination.",
  "watch": "Mishap and off-target risks depend on destination familiarity."
 },
 "srd-2024_animal-shapes": {
  "use": "Transform multiple willing allies into Beasts for coordinated action.",
  "watch": "Form and Challenge Rating limits apply; concentration is needed."
 },
 "srd-2024_antimagic-field": {
  "use": "Disable magic in a moving zone around yourself.",
  "watch": "Your own spells and magical items can be suppressed too."
 },
 "srd-2024_antipathysympathy": {
  "use": "Set a long-lasting attraction or repulsion effect on a target or location.",
  "watch": "The chosen creature type and save rules determine who is influenced."
 },
 "srd-2024_befuddlement": {
  "use": "Cripple an enemy caster's ability to use magic while dealing psychic damage.",
  "watch": "An Intelligence save applies, and effects may persist until removal."
 },
 "srd-2024_clone": {
  "use": "Prepare a backup body for a character long before it might be needed.",
  "watch": "The clone needs substantial time and a protected vessel to mature."
 },
 "srd-2024_control-weather": {
  "use": "Change dangerous regional weather during travel or large-scale planning.",
  "watch": "Weather shifts gradually, not with precise instantaneous tactical control."
 },
 "srd-2024_demiplane": {
  "use": "Open access to a private extradimensional space for storage or refuge.",
  "watch": "The door lasts briefly; occupants must plan how to get back out."
 },
 "srd-2024_dominate-monster": {
  "use": "Seize control of almost any creature for a high-stakes encounter.",
  "watch": "The target saves and receives further chances; concentration is required."
 },
 "srd-2024_earthquake": {
  "use": "Ruin terrain and structures across a wide region in a siege.",
  "watch": "It threatens allies, buildings, and the ground itself indiscriminately."
 },
 "srd-2024_glibness": {
  "use": "Make a negotiator consistently persuasive or deceptive in a crucial scene.",
  "watch": "It affects specific Charisma checks and isn't automatic mind control."
 },
 "srd-2024_holy-aura": {
  "use": "Give allies strong protection against hostile attacks and supernatural threats.",
  "watch": "Stay within the aura's range, and preserve concentration."
 },
 "srd-2024_incendiary-cloud": {
  "use": "Fill an area with lingering fire that moves across the battlefield.",
  "watch": "The cloud moves and can spread danger into allied positions."
 },
 "srd-2024_maze": {
  "use": "Remove a dangerous foe from the battlefield temporarily.",
  "watch": "The target can escape through its prescribed check rather than a normal initial save."
 },
 "srd-2024_mind-blank": {
  "use": "Protect a key person against psychic intrusion and mental detection for a day.",
  "watch": "Its protections are specific; it does not grant immunity to every enchantment."
 },
 "srd-2024_power-word-stun": {
  "use": "Incapacitate a target with a powerful verbal command.",
  "watch": "The spell has an HP threshold and repeated saving throws to escape."
 },
 "srd-2024_sunburst": {
  "use": "Blind and devastate foes in a huge flash of radiant energy.",
  "watch": "Its area is enormous; successful saves and creature traits matter."
 },
 "srd-2024_tsunami": {
  "use": "Use an immense moving water wall to devastate an open battlefield.",
  "watch": "The wave persists and moves over rounds, creating major collateral damage."
 },
 "srd-2024_astral-projection": {
  "use": "Send the party to the Astral Plane without moving their physical bodies.",
  "watch": "Silver cords and bodies left behind create serious campaign-level risks."
 },
 "srd-2024_foresight": {
  "use": "Protect one ally with extraordinary insight for an entire adventuring day.",
  "watch": "It is powerful but single-target and requires a lengthy casting time."
 },
 "srd-2024_gate": {
  "use": "Open a planar portal or call a specific powerful creature.",
  "watch": "Planar rulers and named creature interactions can block or complicate it."
 },
 "srd-2024_imprisonment": {
  "use": "Confine a major enemy through a chosen long-term magical prison.",
  "watch": "The option, costly component, and release condition have strict requirements."
 },
 "srd-2024_mass-heal": {
  "use": "Restore an enormous total pool of HP across several allies.",
  "watch": "Divide the healing among eligible creatures and respect the spell's target limits."
 },
 "srd-2024_meteor-swarm": {
  "use": "Devastate many distant points with enormous fire and bludgeoning damage.",
  "watch": "Large overlapping areas can threaten allies and surroundings."
 },
 "srd-2024_power-word-heal": {
  "use": "Instantly restore one creature's health and relieve listed conditions.",
  "watch": "Read its eligibility and conditions; it is not universal resurrection."
 },
 "srd-2024_power-word-kill": {
  "use": "Finish a creature that meets the spell's low-HP requirement.",
  "watch": "It fails to kill targets above the stated HP threshold."
 },
 "srd-2024_prismatic-wall": {
  "use": "Protect a location with layered colours and punishing defences.",
  "watch": "Each colour has its own counter and effect; resolution is deliberately complex."
 },
 "srd-2024_shapechange": {
  "use": "Take on powerful creature forms while retaining selected capabilities.",
  "watch": "Form eligibility and what traits you keep require close rules reading."
 },
 "srd-2024_storm-of-vengeance": {
  "use": "Create a vast storm for battlefield- or siege-scale attrition.",
  "watch": "Effects change round by round; concentration and collateral damage matter."
 },
 "srd-2024_time-stop": {
  "use": "Take several turns to reposition and prepare without enemies acting.",
  "watch": "The spell ends early if you affect another creature or its possessions."
 },
 "srd-2024_true-polymorph": {
  "use": "Turn a creature or object into a lasting new form.",
  "watch": "Challenge Rating, target type, and concentration for permanence are crucial."
 },
 "srd-2024_true-resurrection": {
  "use": "Restore someone who died long ago, even with a missing body under conditions.",
  "watch": "Old-age restrictions and extraordinarily costly materials apply."
 },
 "srd-2024_weird": {
  "use": "Overwhelm many enemies with terrifying personal illusions.",
  "watch": "The 2024 version's damage and conditions follow repeated Wisdom saves."
 },
 "srd-2024_wish": {
  "use": "Duplicate another spell or attempt an exceptional reality-altering request.",
  "watch": "Non-duplicate uses are risky and subject to the spell's express limitations."
 }
};
function resolve(sp){
 const text=String(sp?.description||sp?.detail||'');
 const cues=[];
 if(/ranged spell attack/i.test(text))cues.push('Ranged spell attack');
 if(/melee spell attack/i.test(text))cues.push('Melee spell attack');
 if(/weapon attack/i.test(text)&&!cues.length)cues.push('Weapon attack as described');
 const abilities=['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'];
 const found=abilities.filter(ability=>new RegExp('\\b'+ability+'\\s+saving throw','i').test(text));
 if(found.length)cues.push(found.join(' / ')+' saving throw'+(found.length===1?'':'s'));
 else if(/saving throws?/i.test(text))cues.push('Saving throw(s) as described');
 if(!cues.length)return 'See the full rules for any checks, triggers, or automatic effects.';
 return 'Involves '+cues.join(' and ')+'. Check the full rules for timing, outcomes, and exceptions.';
}
function preview(sp){
 const source=String(sp?.description||sp?.detail||'').replace(/\s+/g,' ').trim();
 if(!source)return 'See the full spell description below.';
 // Extract opening sentences only; do not invent or silently reinterpret mechanics.
 const sentences=source.split(/(?<=[.!?])\s+(?=[A-Z])/);
 const opening=sentences.slice(0,2).join(' ');
 if(opening.length<=480)return opening;
 const boundary=opening.slice(0,480).lastIndexOf(' ');
 return opening.slice(0,boundary>250?boundary:480).trimEnd()+'…';
}
function get(key){return entries[key]||null;}
function coverage(catalog){
 const spells=Array.isArray(catalog)?catalog:[];
 const unique=new Set(spells.map(s=>s.key));
 return {total:spells.length,guides:Object.keys(entries).length,missing:spells.filter(s=>!entries[s.key]).map(s=>s.name),extra:Object.keys(entries).filter(k=>!unique.has(k)),duplicates:spells.length-unique.size};
}
root.FolioSpellAudit={entries,get,resolve,preview,coverage};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioSpellAudit;
})(typeof window!=='undefined'?window:globalThis);
