(function(root){'use strict';
// M17.4: openly licensed SRD 5.2.1 equipment metadata; guidance is original, short-form.
// Commercial sourcebooks remain outside the installed catalogue unless the user supplies permitted content.
const records=[
 {
  "key": "armor:padded-armor",
  "name": "Padded Armor",
  "category": "armor",
  "group": "Light Armor",
  "cost": "5 GP",
  "weight": "8 lb.",
  "weightLb": 8,
  "armor": {
   "kind": "light",
   "baseAC": 11,
   "enhancement": 0,
   "strength": 0,
   "stealthDisadvantage": true
  },
  "use": "Light armor adds your full Dexterity modifier to base AC.",
  "rules": "1 minute to don or doff"
 },
 {
  "key": "armor:leather-armor",
  "name": "Leather Armor",
  "category": "armor",
  "group": "Light Armor",
  "cost": "10 GP",
  "weight": "10 lb.",
  "weightLb": 10,
  "armor": {
   "kind": "light",
   "baseAC": 11,
   "enhancement": 0,
   "strength": 0,
   "stealthDisadvantage": false
  },
  "use": "Light armor adds your full Dexterity modifier to base AC.",
  "rules": "1 minute to don or doff"
 },
 {
  "key": "armor:studded-leather-armor",
  "name": "Studded Leather Armor",
  "category": "armor",
  "group": "Light Armor",
  "cost": "45 GP",
  "weight": "13 lb.",
  "weightLb": 13,
  "armor": {
   "kind": "light",
   "baseAC": 12,
   "enhancement": 0,
   "strength": 0,
   "stealthDisadvantage": false
  },
  "use": "Light armor adds your full Dexterity modifier to base AC.",
  "rules": "1 minute to don or doff"
 },
 {
  "key": "armor:hide-armor",
  "name": "Hide Armor",
  "category": "armor",
  "group": "Medium Armor",
  "cost": "10 GP",
  "weight": "12 lb.",
  "weightLb": 12,
  "armor": {
   "kind": "medium",
   "baseAC": 12,
   "enhancement": 0,
   "strength": 0,
   "stealthDisadvantage": false
  },
  "use": "Medium armor adds at most +2 Dexterity to base AC.",
  "rules": "5 minutes to don; 1 minute to doff"
 },
 {
  "key": "armor:chain-shirt",
  "name": "Chain Shirt",
  "category": "armor",
  "group": "Medium Armor",
  "cost": "50 GP",
  "weight": "20 lb.",
  "weightLb": 20,
  "armor": {
   "kind": "medium",
   "baseAC": 13,
   "enhancement": 0,
   "strength": 0,
   "stealthDisadvantage": false
  },
  "use": "Medium armor adds at most +2 Dexterity to base AC.",
  "rules": "5 minutes to don; 1 minute to doff"
 },
 {
  "key": "armor:scale-mail",
  "name": "Scale Mail",
  "category": "armor",
  "group": "Medium Armor",
  "cost": "50 GP",
  "weight": "45 lb.",
  "weightLb": 45,
  "armor": {
   "kind": "medium",
   "baseAC": 14,
   "enhancement": 0,
   "strength": 0,
   "stealthDisadvantage": true
  },
  "use": "Medium armor adds at most +2 Dexterity to base AC.",
  "rules": "5 minutes to don; 1 minute to doff"
 },
 {
  "key": "armor:breastplate",
  "name": "Breastplate",
  "category": "armor",
  "group": "Medium Armor",
  "cost": "400 GP",
  "weight": "20 lb.",
  "weightLb": 20,
  "armor": {
   "kind": "medium",
   "baseAC": 14,
   "enhancement": 0,
   "strength": 0,
   "stealthDisadvantage": false
  },
  "use": "Medium armor adds at most +2 Dexterity to base AC.",
  "rules": "5 minutes to don; 1 minute to doff"
 },
 {
  "key": "armor:half-plate-armor",
  "name": "Half Plate Armor",
  "category": "armor",
  "group": "Medium Armor",
  "cost": "750 GP",
  "weight": "40 lb.",
  "weightLb": 40,
  "armor": {
   "kind": "medium",
   "baseAC": 15,
   "enhancement": 0,
   "strength": 0,
   "stealthDisadvantage": true
  },
  "use": "Medium armor adds at most +2 Dexterity to base AC.",
  "rules": "5 minutes to don; 1 minute to doff"
 },
 {
  "key": "armor:ring-mail",
  "name": "Ring Mail",
  "category": "armor",
  "group": "Heavy Armor",
  "cost": "30 GP",
  "weight": "40 lb.",
  "weightLb": 40,
  "armor": {
   "kind": "heavy",
   "baseAC": 14,
   "enhancement": 0,
   "strength": 0,
   "stealthDisadvantage": true
  },
  "use": "Heavy armor sets AC without Dexterity. Check Strength and stealth restrictions.",
  "rules": "10 minutes to don; 5 minutes to doff"
 },
 {
  "key": "armor:chain-mail",
  "name": "Chain Mail",
  "category": "armor",
  "group": "Heavy Armor",
  "cost": "75 GP",
  "weight": "55 lb.",
  "weightLb": 55,
  "armor": {
   "kind": "heavy",
   "baseAC": 16,
   "enhancement": 0,
   "strength": 13,
   "stealthDisadvantage": true
  },
  "use": "Heavy armor sets AC without Dexterity. Check Strength and stealth restrictions.",
  "rules": "10 minutes to don; 5 minutes to doff"
 },
 {
  "key": "armor:splint-armor",
  "name": "Splint Armor",
  "category": "armor",
  "group": "Heavy Armor",
  "cost": "200 GP",
  "weight": "60 lb.",
  "weightLb": 60,
  "armor": {
   "kind": "heavy",
   "baseAC": 17,
   "enhancement": 0,
   "strength": 15,
   "stealthDisadvantage": true
  },
  "use": "Heavy armor sets AC without Dexterity. Check Strength and stealth restrictions.",
  "rules": "10 minutes to don; 5 minutes to doff"
 },
 {
  "key": "armor:plate-armor",
  "name": "Plate Armor",
  "category": "armor",
  "group": "Heavy Armor",
  "cost": "1,500 GP",
  "weight": "65 lb.",
  "weightLb": 65,
  "armor": {
   "kind": "heavy",
   "baseAC": 18,
   "enhancement": 0,
   "strength": 15,
   "stealthDisadvantage": true
  },
  "use": "Heavy armor sets AC without Dexterity. Check Strength and stealth restrictions.",
  "rules": "10 minutes to don; 5 minutes to doff"
 },
 {
  "key": "armor:shield",
  "name": "Shield",
  "category": "shield",
  "group": "Shield",
  "cost": "10 GP",
  "weight": "6 lb.",
  "weightLb": 6,
  "armor": {
   "kind": "shield",
   "baseAC": 2,
   "enhancement": 0,
   "strength": 0,
   "stealthDisadvantage": false
  },
  "use": "Wield one shield. The +2 bonus requires shield training and the Utilize action to don or doff.",
  "rules": "Utilize action to don or doff"
 },
 {
  "key": "tool:alchemist-s-supplies",
  "name": "Alchemist’s Supplies",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "50 GP",
  "weight": "8 lb.",
  "weightLb": 8,
  "use": "Identify a substance (DC 15); assist with starting a fire (DC 15)",
  "tool": {
   "ability": "Intelligence",
   "utilize": "Identify a substance (DC 15); assist with starting a fire (DC 15)",
   "craft": "Acid, oil, alchemical supplies"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:brewer-s-supplies",
  "name": "Brewer’s Supplies",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "20 GP",
  "weight": "9 lb.",
  "weightLb": 9,
  "use": "Find poison in a drink (DC 15) or identify an alcoholic drink (DC 10)",
  "tool": {
   "ability": "Intelligence",
   "utilize": "Find poison in a drink (DC 15) or identify an alcoholic drink (DC 10)",
   "craft": "Antitoxin"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:calligrapher-s-supplies",
  "name": "Calligrapher’s Supplies",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "10 GP",
  "weight": "5 lb.",
  "weightLb": 5,
  "use": "Create flourished writing that resists forgery (DC 15)",
  "tool": {
   "ability": "Dexterity",
   "utilize": "Create flourished writing that resists forgery (DC 15)",
   "craft": "Ink and spell scrolls"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:carpenter-s-tools",
  "name": "Carpenter’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "8 GP",
  "weight": "6 lb.",
  "weightLb": 6,
  "use": "Seal or pry a door or container (DC 20)",
  "tool": {
   "ability": "Strength",
   "utilize": "Seal or pry a door or container (DC 20)",
   "craft": "Wooden objects and simple wooden weapons"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:cartographer-s-tools",
  "name": "Cartographer’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "15 GP",
  "weight": "6 lb.",
  "weightLb": 6,
  "use": "Create a map of a small area (DC 15)",
  "tool": {
   "ability": "Wisdom",
   "utilize": "Create a map of a small area (DC 15)",
   "craft": "Maps"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:cobbler-s-tools",
  "name": "Cobbler’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "5 GP",
  "weight": "5 lb.",
  "weightLb": 5,
  "use": "Improve footwear for one Acrobatics check (DC 10)",
  "tool": {
   "ability": "Dexterity",
   "utilize": "Improve footwear for one Acrobatics check (DC 10)",
   "craft": "Climber’s kits"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:cook-s-utensils",
  "name": "Cook’s Utensils",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "1 GP",
  "weight": "8 lb.",
  "weightLb": 8,
  "use": "Improve food (DC 10) or spot unsafe food (DC 15)",
  "tool": {
   "ability": "Wisdom",
   "utilize": "Improve food (DC 10) or spot unsafe food (DC 15)",
   "craft": "Rations"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:glassblower-s-tools",
  "name": "Glassblower’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "30 GP",
  "weight": "5 lb.",
  "weightLb": 5,
  "use": "Identify what glass held within 24 hours (DC 15)",
  "tool": {
   "ability": "Intelligence",
   "utilize": "Identify what glass held within 24 hours (DC 15)",
   "craft": "Glass bottles, vials, spyglasses"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:jeweler-s-tools",
  "name": "Jeweler’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "25 GP",
  "weight": "2 lb.",
  "weightLb": 2,
  "use": "Estimate gem value (DC 15)",
  "tool": {
   "ability": "Intelligence",
   "utilize": "Estimate gem value (DC 15)",
   "craft": "Jewelry and some spellcasting foci"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:leatherworker-s-tools",
  "name": "Leatherworker’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "5 GP",
  "weight": "5 lb.",
  "weightLb": 5,
  "use": "Decorate a leather item (DC 10)",
  "tool": {
   "ability": "Dexterity",
   "utilize": "Decorate a leather item (DC 10)",
   "craft": "Leather armor and leather gear"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:mason-s-tools",
  "name": "Mason’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "10 GP",
  "weight": "8 lb.",
  "weightLb": 8,
  "use": "Cut a shape into stone (DC 10)",
  "tool": {
   "ability": "Strength",
   "utilize": "Cut a shape into stone (DC 10)",
   "craft": "Stone-related fixtures"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:painter-s-supplies",
  "name": "Painter’s Supplies",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "10 GP",
  "weight": "5 lb.",
  "weightLb": 5,
  "use": "Paint a familiar likeness (DC 10)",
  "tool": {
   "ability": "Wisdom",
   "utilize": "Paint a familiar likeness (DC 10)",
   "craft": "Decorative foci and symbols"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:potter-s-tools",
  "name": "Potter’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "10 GP",
  "weight": "3 lb.",
  "weightLb": 3,
  "use": "Read traces left in ceramic (DC 15)",
  "tool": {
   "ability": "Intelligence",
   "utilize": "Read traces left in ceramic (DC 15)",
   "craft": "Jugs, lamps"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:smith-s-tools",
  "name": "Smith’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "20 GP",
  "weight": "8 lb.",
  "weightLb": 8,
  "use": "Force a container or door (DC 20)",
  "tool": {
   "ability": "Strength",
   "utilize": "Force a container or door (DC 20)",
   "craft": "Metal weapons and armor"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:tinker-s-tools",
  "name": "Tinker’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "50 GP",
  "weight": "10 lb.",
  "weightLb": 10,
  "use": "Assemble a short-lived tiny device (DC 20)",
  "tool": {
   "ability": "Dexterity",
   "utilize": "Assemble a short-lived tiny device (DC 20)",
   "craft": "Locks, tools, metal small gear"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:weaver-s-tools",
  "name": "Weaver’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "1 GP",
  "weight": "5 lb.",
  "weightLb": 5,
  "use": "Repair fabric or sew a pattern (DC 10)",
  "tool": {
   "ability": "Dexterity",
   "utilize": "Repair fabric or sew a pattern (DC 10)",
   "craft": "Textiles, tents, padded armor"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:woodcarver-s-tools",
  "name": "Woodcarver’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "1 GP",
  "weight": "5 lb.",
  "weightLb": 5,
  "use": "Carve a small wooden design (DC 10)",
  "tool": {
   "ability": "Dexterity",
   "utilize": "Carve a small wooden design (DC 10)",
   "craft": "Wooden weapons and ammunition"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:disguise-kit",
  "name": "Disguise Kit",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "25 GP",
  "weight": "3 lb.",
  "weightLb": 3,
  "use": "Apply makeup (DC 10)",
  "tool": {
   "ability": "Charisma",
   "utilize": "Apply makeup (DC 10)",
   "craft": "Costumes"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:forgery-kit",
  "name": "Forgery Kit",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "15 GP",
  "weight": "5 lb.",
  "weightLb": 5,
  "use": "Imitate up to ten words (DC 15) or forge a seal (DC 20)",
  "tool": {
   "ability": "Dexterity",
   "utilize": "Imitate up to ten words (DC 15) or forge a seal (DC 20)",
   "craft": "No standard craft list"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:herbalism-kit",
  "name": "Herbalism Kit",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "5 GP",
  "weight": "3 lb.",
  "weightLb": 3,
  "use": "Identify a plant (DC 10)",
  "tool": {
   "ability": "Intelligence",
   "utilize": "Identify a plant (DC 10)",
   "craft": "Healing potions, antitoxin, healer’s kits"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:navigator-s-tools",
  "name": "Navigator’s Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "25 GP",
  "weight": "2 lb.",
  "weightLb": 2,
  "use": "Plot a course (DC 10) or navigate by stars (DC 15)",
  "tool": {
   "ability": "Wisdom",
   "utilize": "Plot a course (DC 10) or navigate by stars (DC 15)",
   "craft": "Maps"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:poisoner-s-kit",
  "name": "Poisoner’s Kit",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "50 GP",
  "weight": "2 lb.",
  "weightLb": 2,
  "use": "Detect poison on an object (DC 10)",
  "tool": {
   "ability": "Intelligence",
   "utilize": "Detect poison on an object (DC 10)",
   "craft": "Basic poison"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:thieves-tools",
  "name": "Thieves’ Tools",
  "category": "tools",
  "group": "Tools & Kits",
  "cost": "25 GP",
  "weight": "1 lb.",
  "weightLb": 1,
  "use": "Pick a lock (DC 15) or disarm a trap (DC 15)",
  "tool": {
   "ability": "Dexterity",
   "utilize": "Pick a lock (DC 15) or disarm a trap (DC 15)",
   "craft": "No standard craft list"
  },
  "rules": "The relevant tool proficiency adds PB; an overlapping skill proficiency can grant Advantage. Crafting also requires time and materials."
 },
 {
  "key": "tool:dice-set",
  "name": "Dice Set",
  "category": "tools",
  "group": "Gaming Sets",
  "cost": "1 SP",
  "weight": "—",
  "use": "Play this game using Wisdom; proficiency is specific to this set.",
  "tool": {
   "ability": "Wisdom",
   "utilize": "Spot cheating (DC 10) or play to win (DC 20)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:dragonchess-set",
  "name": "Dragonchess Set",
  "category": "tools",
  "group": "Gaming Sets",
  "cost": "1 GP",
  "weight": "—",
  "use": "Play this game using Wisdom; proficiency is specific to this set.",
  "tool": {
   "ability": "Wisdom",
   "utilize": "Spot cheating (DC 10) or play to win (DC 20)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:playing-card-set",
  "name": "Playing Card Set",
  "category": "tools",
  "group": "Gaming Sets",
  "cost": "5 SP",
  "weight": "—",
  "use": "Play this game using Wisdom; proficiency is specific to this set.",
  "tool": {
   "ability": "Wisdom",
   "utilize": "Spot cheating (DC 10) or play to win (DC 20)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:three-dragon-ante-set",
  "name": "Three-Dragon Ante Set",
  "category": "tools",
  "group": "Gaming Sets",
  "cost": "1 GP",
  "weight": "—",
  "use": "Play this game using Wisdom; proficiency is specific to this set.",
  "tool": {
   "ability": "Wisdom",
   "utilize": "Spot cheating (DC 10) or play to win (DC 20)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:bagpipes",
  "name": "Bagpipes",
  "category": "tools",
  "group": "Musical Instruments",
  "cost": "30 GP",
  "weight": "6 lb.",
  "use": "Play a tune or improvise with Charisma; proficiency is specific to this instrument.",
  "tool": {
   "ability": "Charisma",
   "utilize": "Perform a known tune (DC 10) or improvise (DC 15)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:drum",
  "name": "Drum",
  "category": "tools",
  "group": "Musical Instruments",
  "cost": "6 GP",
  "weight": "3 lb.",
  "use": "Play a tune or improvise with Charisma; proficiency is specific to this instrument.",
  "tool": {
   "ability": "Charisma",
   "utilize": "Perform a known tune (DC 10) or improvise (DC 15)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:dulcimer",
  "name": "Dulcimer",
  "category": "tools",
  "group": "Musical Instruments",
  "cost": "25 GP",
  "weight": "10 lb.",
  "use": "Play a tune or improvise with Charisma; proficiency is specific to this instrument.",
  "tool": {
   "ability": "Charisma",
   "utilize": "Perform a known tune (DC 10) or improvise (DC 15)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:flute",
  "name": "Flute",
  "category": "tools",
  "group": "Musical Instruments",
  "cost": "2 GP",
  "weight": "1 lb.",
  "use": "Play a tune or improvise with Charisma; proficiency is specific to this instrument.",
  "tool": {
   "ability": "Charisma",
   "utilize": "Perform a known tune (DC 10) or improvise (DC 15)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:horn",
  "name": "Horn",
  "category": "tools",
  "group": "Musical Instruments",
  "cost": "3 GP",
  "weight": "2 lb.",
  "use": "Play a tune or improvise with Charisma; proficiency is specific to this instrument.",
  "tool": {
   "ability": "Charisma",
   "utilize": "Perform a known tune (DC 10) or improvise (DC 15)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:lute",
  "name": "Lute",
  "category": "tools",
  "group": "Musical Instruments",
  "cost": "35 GP",
  "weight": "2 lb.",
  "use": "Play a tune or improvise with Charisma; proficiency is specific to this instrument.",
  "tool": {
   "ability": "Charisma",
   "utilize": "Perform a known tune (DC 10) or improvise (DC 15)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:lyre",
  "name": "Lyre",
  "category": "tools",
  "group": "Musical Instruments",
  "cost": "30 GP",
  "weight": "2 lb.",
  "use": "Play a tune or improvise with Charisma; proficiency is specific to this instrument.",
  "tool": {
   "ability": "Charisma",
   "utilize": "Perform a known tune (DC 10) or improvise (DC 15)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:pan-flute",
  "name": "Pan Flute",
  "category": "tools",
  "group": "Musical Instruments",
  "cost": "12 GP",
  "weight": "2 lb.",
  "use": "Play a tune or improvise with Charisma; proficiency is specific to this instrument.",
  "tool": {
   "ability": "Charisma",
   "utilize": "Perform a known tune (DC 10) or improvise (DC 15)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:shawm",
  "name": "Shawm",
  "category": "tools",
  "group": "Musical Instruments",
  "cost": "2 GP",
  "weight": "1 lb.",
  "use": "Play a tune or improvise with Charisma; proficiency is specific to this instrument.",
  "tool": {
   "ability": "Charisma",
   "utilize": "Perform a known tune (DC 10) or improvise (DC 15)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "tool:viol",
  "name": "Viol",
  "category": "tools",
  "group": "Musical Instruments",
  "cost": "30 GP",
  "weight": "1 lb.",
  "use": "Play a tune or improvise with Charisma; proficiency is specific to this instrument.",
  "tool": {
   "ability": "Charisma",
   "utilize": "Perform a known tune (DC 10) or improvise (DC 15)",
   "craft": "—"
  },
  "rules": "Consult the official tool entry for relevant check DCs."
 },
 {
  "key": "gear:acid",
  "name": "Acid",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "25 GP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "See the PHB 24 rules for activation, DC, duration, uses, and consumption before applying an effect.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:alchemist-s-fire",
  "name": "Alchemist’s Fire",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "50 GP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "See the PHB 24 rules for activation, DC, duration, uses, and consumption before applying an effect.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:antitoxin",
  "name": "Antitoxin",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "50 GP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:backpack",
  "name": "Backpack",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 GP",
  "weight": "5 lb.",
  "weightLb": 5.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:ball-bearings",
  "name": "Ball Bearings",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "2 lb.",
  "weightLb": 2.0,
  "use": "See the PHB 24 rules for activation, DC, duration, uses, and consumption before applying an effect.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:barrel",
  "name": "Barrel",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 GP",
  "weight": "70 lb.",
  "weightLb": 70.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:basket",
  "name": "Basket",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "4 SP",
  "weight": "2 lb.",
  "weightLb": 2.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:bedroll",
  "name": "Bedroll",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "7 lb.",
  "weightLb": 7.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:bell",
  "name": "Bell",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:blanket",
  "name": "Blanket",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 SP",
  "weight": "3 lb.",
  "weightLb": 3.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:block-and-tackle",
  "name": "Block and Tackle",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "5 lb.",
  "weightLb": 5.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:book",
  "name": "Book",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "25 GP",
  "weight": "5 lb.",
  "weightLb": 5.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:bottle-glass",
  "name": "Bottle, Glass",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 GP",
  "weight": "2 lb.",
  "weightLb": 2.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:bucket",
  "name": "Bucket",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 CP",
  "weight": "2 lb.",
  "weightLb": 2.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:burglar-s-pack",
  "name": "Burglar’s Pack",
  "category": "gear",
  "group": "Equipment Packs",
  "cost": "16 GP",
  "weight": "42 lb.",
  "weightLb": 42.0,
  "use": "Pack is represented as one carried item; expand contents manually if tracking individual supplies.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:caltrops",
  "name": "Caltrops",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "2 lb.",
  "weightLb": 2.0,
  "use": "See the PHB 24 rules for activation, DC, duration, uses, and consumption before applying an effect.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:candle",
  "name": "Candle",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 CP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:case-crossbow-bolt",
  "name": "Case, Crossbow Bolt",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:case-map-or-scroll",
  "name": "Case, Map or Scroll",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:chain",
  "name": "Chain",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 GP",
  "weight": "10 lb.",
  "weightLb": 10.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:chest",
  "name": "Chest",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 GP",
  "weight": "25 lb.",
  "weightLb": 25.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:climber-s-kit",
  "name": "Climber’s Kit",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "25 GP",
  "weight": "12 lb.",
  "weightLb": 12.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:clothes-fine",
  "name": "Clothes, Fine",
  "category": "clothing",
  "group": "Adventuring Gear",
  "cost": "15 GP",
  "weight": "6 lb.",
  "weightLb": 6.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:clothes-traveler-s",
  "name": "Clothes, Traveler’s",
  "category": "clothing",
  "group": "Adventuring Gear",
  "cost": "2 GP",
  "weight": "4 lb.",
  "weightLb": 4.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:component-pouch",
  "name": "Component Pouch",
  "category": "focus",
  "group": "Adventuring Gear",
  "cost": "25 GP",
  "weight": "2 lb.",
  "weightLb": 2.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:costume",
  "name": "Costume",
  "category": "clothing",
  "group": "Adventuring Gear",
  "cost": "5 GP",
  "weight": "4 lb.",
  "weightLb": 4.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:crowbar",
  "name": "Crowbar",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 GP",
  "weight": "5 lb.",
  "weightLb": 5.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:diplomat-s-pack",
  "name": "Diplomat’s Pack",
  "category": "gear",
  "group": "Equipment Packs",
  "cost": "39 GP",
  "weight": "39 lb.",
  "weightLb": 39.0,
  "use": "Pack is represented as one carried item; expand contents manually if tracking individual supplies.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:dungeoneer-s-pack",
  "name": "Dungeoneer’s Pack",
  "category": "gear",
  "group": "Equipment Packs",
  "cost": "12 GP",
  "weight": "55 lb.",
  "weightLb": 55.0,
  "use": "Pack is represented as one carried item; expand contents manually if tracking individual supplies.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:entertainer-s-pack",
  "name": "Entertainer’s Pack",
  "category": "gear",
  "group": "Equipment Packs",
  "cost": "40 GP",
  "weight": "58½ lb.",
  "weightLb": 580.5,
  "use": "Pack is represented as one carried item; expand contents manually if tracking individual supplies.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:explorer-s-pack",
  "name": "Explorer’s Pack",
  "category": "gear",
  "group": "Equipment Packs",
  "cost": "10 GP",
  "weight": "55 lb.",
  "weightLb": 55.0,
  "use": "Pack is represented as one carried item; expand contents manually if tracking individual supplies.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:flask",
  "name": "Flask",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 CP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:grappling-hook",
  "name": "Grappling Hook",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 GP",
  "weight": "4 lb.",
  "weightLb": 4.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:healer-s-kit",
  "name": "Healer’s Kit",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 GP",
  "weight": "3 lb.",
  "weightLb": 3.0,
  "use": "See the PHB 24 rules for activation, DC, duration, uses, and consumption before applying an effect.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:holy-water",
  "name": "Holy Water",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "25 GP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "See the PHB 24 rules for activation, DC, duration, uses, and consumption before applying an effect.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:hunting-trap",
  "name": "Hunting Trap",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 GP",
  "weight": "25 lb.",
  "weightLb": 25.0,
  "use": "See the PHB 24 rules for activation, DC, duration, uses, and consumption before applying an effect.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:ink",
  "name": "Ink",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "10 GP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:ink-pen",
  "name": "Ink Pen",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 CP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:jug",
  "name": "Jug",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 CP",
  "weight": "4 lb.",
  "weightLb": 4.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:ladder",
  "name": "Ladder",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 SP",
  "weight": "25 lb.",
  "weightLb": 25.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:lamp",
  "name": "Lamp",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 SP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:lantern-bullseye",
  "name": "Lantern, Bullseye",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "10 GP",
  "weight": "2 lb.",
  "weightLb": 2.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:lantern-hooded",
  "name": "Lantern, Hooded",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 GP",
  "weight": "2 lb.",
  "weightLb": 2.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:lock",
  "name": "Lock",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "10 GP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:magnifying-glass",
  "name": "Magnifying Glass",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "100 GP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:manacles",
  "name": "Manacles",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 GP",
  "weight": "6 lb.",
  "weightLb": 6.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:map",
  "name": "Map",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:mirror",
  "name": "Mirror",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 GP",
  "weight": "½ lb.",
  "weightLb": 0.5,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:net",
  "name": "Net",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "3 lb.",
  "weightLb": 3.0,
  "use": "See the PHB 24 rules for activation, DC, duration, uses, and consumption before applying an effect.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:oil",
  "name": "Oil",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 SP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:paper",
  "name": "Paper",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 SP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:parchment",
  "name": "Parchment",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 SP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:perfume",
  "name": "Perfume",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 GP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:poison-basic",
  "name": "Poison, Basic",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "100 GP",
  "weight": "—",
  "weightLb": null,
  "use": "See the PHB 24 rules for activation, DC, duration, uses, and consumption before applying an effect.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:pole",
  "name": "Pole",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 CP",
  "weight": "7 lb.",
  "weightLb": 7.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:pot-iron",
  "name": "Pot, Iron",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 GP",
  "weight": "10 lb.",
  "weightLb": 10.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:potion-of-healing",
  "name": "Potion of Healing",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "50 GP",
  "weight": "½ lb.",
  "weightLb": 0.5,
  "use": "See the PHB 24 rules for activation, DC, duration, uses, and consumption before applying an effect.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:pouch",
  "name": "Pouch",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 SP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:priest-s-pack",
  "name": "Priest’s Pack",
  "category": "gear",
  "group": "Equipment Packs",
  "cost": "33 GP",
  "weight": "29 lb.",
  "weightLb": 29.0,
  "use": "Pack is represented as one carried item; expand contents manually if tracking individual supplies.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:quiver",
  "name": "Quiver",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:ram-portable",
  "name": "Ram, Portable",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "4 GP",
  "weight": "35 lb.",
  "weightLb": 35.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:rations",
  "name": "Rations",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 SP",
  "weight": "2 lb.",
  "weightLb": 2.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:robe",
  "name": "Robe",
  "category": "clothing",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "4 lb.",
  "weightLb": 4.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:rope",
  "name": "Rope",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "5 lb.",
  "weightLb": 5.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:sack",
  "name": "Sack",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 CP",
  "weight": "½ lb.",
  "weightLb": 0.5,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:scholar-s-pack",
  "name": "Scholar’s Pack",
  "category": "gear",
  "group": "Equipment Packs",
  "cost": "40 GP",
  "weight": "22 lb.",
  "weightLb": 22.0,
  "use": "Pack is represented as one carried item; expand contents manually if tracking individual supplies.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:shovel",
  "name": "Shovel",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 GP",
  "weight": "5 lb.",
  "weightLb": 5.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:signal-whistle",
  "name": "Signal Whistle",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 CP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:spikes-iron",
  "name": "Spikes, Iron",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "5 lb.",
  "weightLb": 5.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:spyglass",
  "name": "Spyglass",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1,000 GP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:string",
  "name": "String",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 SP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:tent",
  "name": "Tent",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 GP",
  "weight": "20 lb.",
  "weightLb": 20.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:tinderbox",
  "name": "Tinderbox",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "5 SP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:torch",
  "name": "Torch",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 CP",
  "weight": "1 lb.",
  "weightLb": 1.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:vial",
  "name": "Vial",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "1 GP",
  "weight": "—",
  "weightLb": null,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "gear:waterskin",
  "name": "Waterskin",
  "category": "gear",
  "group": "Adventuring Gear",
  "cost": "2 SP",
  "weight": "5 lb. (full)",
  "weightLb": 5.0,
  "use": "Common adventuring equipment. Record any table-specific use in item notes.",
  "rules": "Only catalogue metadata is automated; actions, crafting, and consumables are tracked manually."
 },
 {
  "key": "ammo:arrows",
  "name": "Arrows",
  "category": "ammunition",
  "group": "Ammunition",
  "cost": "1 GP / 20",
  "weight": "1 lb. / 20",
  "use": "Track individual ammunition in quantity; buying a bundle does not automatically spend coins.",
  "rules": "Resupply and prices are manual.",
  "bundleSize": 20
 },
 {
  "key": "ammo:crossbow-bolts",
  "name": "Crossbow Bolts",
  "category": "ammunition",
  "group": "Ammunition",
  "cost": "1 GP / 20",
  "weight": "1½ lb. / 20",
  "use": "Track individual ammunition in quantity; buying a bundle does not automatically spend coins.",
  "rules": "Resupply and prices are manual.",
  "bundleSize": 20
 },
 {
  "key": "ammo:firearm-bullets",
  "name": "Firearm Bullets",
  "category": "ammunition",
  "group": "Ammunition",
  "cost": "3 GP / 10",
  "weight": "2 lb. / 10",
  "use": "Track individual ammunition in quantity; buying a bundle does not automatically spend coins.",
  "rules": "Resupply and prices are manual.",
  "bundleSize": 10
 },
 {
  "key": "ammo:sling-bullets",
  "name": "Sling Bullets",
  "category": "ammunition",
  "group": "Ammunition",
  "cost": "4 CP / 20",
  "weight": "1½ lb. / 20",
  "use": "Track individual ammunition in quantity; buying a bundle does not automatically spend coins.",
  "rules": "Resupply and prices are manual.",
  "bundleSize": 20
 },
 {
  "key": "ammo:blowgun-needles",
  "name": "Blowgun Needles",
  "category": "ammunition",
  "group": "Ammunition",
  "cost": "1 GP / 50",
  "weight": "1 lb. / 50",
  "use": "Track individual ammunition in quantity; buying a bundle does not automatically spend coins.",
  "rules": "Resupply and prices are manual.",
  "bundleSize": 50
 },
 {
  "key": "focus:arcane-focus-crystal",
  "name": "Arcane Focus — Crystal",
  "category": "focus",
  "group": "Arcane Foci",
  "cost": "10 GP",
  "weight": "1 lb.",
  "use": "A focus for eligible arcane spellcasters; crystal form.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "focus:arcane-focus-orb",
  "name": "Arcane Focus — Orb",
  "category": "focus",
  "group": "Arcane Foci",
  "cost": "20 GP",
  "weight": "3 lb.",
  "use": "A focus for eligible arcane spellcasters; orb form.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "focus:arcane-focus-rod",
  "name": "Arcane Focus — Rod",
  "category": "focus",
  "group": "Arcane Foci",
  "cost": "10 GP",
  "weight": "2 lb.",
  "use": "A focus for eligible arcane spellcasters; rod form.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "focus:arcane-focus-staff",
  "name": "Arcane Focus — Staff",
  "category": "focus",
  "group": "Arcane Foci",
  "cost": "5 GP",
  "weight": "4 lb.",
  "use": "A focus for eligible arcane spellcasters; also a Quarterstaff.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "focus:arcane-focus-wand",
  "name": "Arcane Focus — Wand",
  "category": "focus",
  "group": "Arcane Foci",
  "cost": "10 GP",
  "weight": "1 lb.",
  "use": "A focus for eligible arcane spellcasters; wand form.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "focus:druidic-focus-mistletoe",
  "name": "Druidic Focus — Mistletoe",
  "category": "focus",
  "group": "Druidic Foci",
  "cost": "1 GP",
  "weight": "—",
  "use": "Focus for Druids or Rangers; sprig of mistletoe.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "focus:druidic-focus-wooden-staff",
  "name": "Druidic Focus — Wooden Staff",
  "category": "focus",
  "group": "Druidic Foci",
  "cost": "5 GP",
  "weight": "4 lb.",
  "use": "Focus for Druids or Rangers; also a Quarterstaff.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "focus:druidic-focus-yew-wand",
  "name": "Druidic Focus — Yew Wand",
  "category": "focus",
  "group": "Druidic Foci",
  "cost": "10 GP",
  "weight": "1 lb.",
  "use": "Focus for Druids or Rangers; yew wand.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "focus:holy-symbol-amulet",
  "name": "Holy Symbol — Amulet",
  "category": "focus",
  "group": "Holy Symbols",
  "cost": "5 GP",
  "weight": "1 lb.",
  "use": "Held or worn divine spellcasting focus for eligible Clerics or Paladins.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "focus:holy-symbol-emblem",
  "name": "Holy Symbol — Emblem",
  "category": "focus",
  "group": "Holy Symbols",
  "cost": "5 GP",
  "weight": "—",
  "use": "Divine spellcasting focus displayed on cloth or a Shield.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "focus:holy-symbol-reliquary",
  "name": "Holy Symbol — Reliquary",
  "category": "focus",
  "group": "Holy Symbols",
  "cost": "5 GP",
  "weight": "2 lb.",
  "use": "Held divine spellcasting focus for eligible Clerics or Paladins.",
  "rules": "Focus use depends on class and component rules. Spells with a cost or consumed material still require that component."
 },
 {
  "key": "scroll:spell-scroll-cantrip",
  "name": "Spell Scroll (Cantrip)",
  "category": "gear",
  "group": "Spell Scrolls",
  "cost": "30 GP",
  "weight": "—",
  "use": "Consumable cantrip scroll; spell availability and use requirements are handled manually.",
  "rules": "Check scroll-specific rules and spell description before use. This app does not cast a scroll automatically."
 },
 {
  "key": "scroll:spell-scroll-level-1",
  "name": "Spell Scroll (Level 1)",
  "category": "gear",
  "group": "Spell Scrolls",
  "cost": "50 GP",
  "weight": "—",
  "use": "Consumable level-1 scroll; spell availability and use requirements are handled manually.",
  "rules": "Check scroll-specific rules and spell description before use. This app does not cast a scroll automatically."
 }
];

function find(key){return records.find(r=>r.key===key)||null;}
function search(query='',group='all'){const q=String(query).trim().toLowerCase();return records.filter(r=>(group==='all'||r.group===group||r.category===group)&&(!q||[r.name,r.group,r.cost,r.use,r.tool?.ability||''].join(' ').toLowerCase().includes(q)));}
function toInventoryItem(record,id){const I=root.PipInventory||(typeof require==='function'?require('./inventory.js'):null);if(!record||!id)throw Error('Catalogue item and ID required');const more={source:'PHB 24',catalogKey:record.key,cost:record.cost,weight:record.weight,weightLb:record.weightLb??null};if(record.armor)more.armor={...record.armor};if(record.tool)more.tool={...record.tool};return I.gear(id,record.name,record.category,1,record.use,more);}
root.FolioEquipmentCatalog={records,find,search,toInventoryItem};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioEquipmentCatalog;
})(typeof window!=='undefined'?window:globalThis);
