patch
"""""""""""""
concept

'current' tracks the views
local_storage api to persist:
    current set?
    model price data?


recipes={...};
current={recipe.name:recipe,};


DATA FILE: name, ing, misc
MODEL: name, ingredients, misc, ing_price, user_price
VIEW:
    name    prof    labor   cost_sum    <a>remove_recipe</a>
        ing_name    ing_cost(model) ing_cost(user)  <a>add_ing</a>
no recursion, just element & ingredients
  (ingredients with an "add this" button?)


for ingredeinets:
    render ingreident template
    
L726XF2QXVCWlCJM
"""""""""""""""""""""

# update recipe dict with base components

import json

with open('/vagrant/arch_recipes.json', 'r') as f:
    recipe_data = f.read()

recipes = json.loads(recipe_data)
recipes = map(eval, recipes)

new_recipes = {}
dupes = 0
for recipe in recipes:
    if recipe['name'].strip() in new_recipes:
        dupes = dupes + 1
    new_recipes[recipe['name'].strip()] = recipe
print "dupes: %d" % dupes

# second pass maybe not necessary, but simple
for r in recipes:
    for item in recipe['ingredients']:
        if item['name'].strip() not in new_recipes:
            tmp = {
                'name': item['name'].strip(),
                'ingredients': []
            }
            new_recipes[item['name'].strip()] = tmp

with open('/vagrant/arch_recipes_full.json', 'a') as f:
    f.write(json.dumps(new_recipes))







new_recipes = {}
dupes = 0
for recipe in fetched.itervalues():
    if recipe['name'] in new_recipes:
        dupes = dupes + 1
    new_recipes[recipe['name']] = recipe
print "dupes: %d" % dupes

# second pass maybe not necessary, but simple
for recipe in fetched.itervalues():
    for item in recipe['ingredients']:
        if item['name'] not in new_recipes:
            tmp = {
                'name': item['name'],
                'ingredients': []
            }
            new_recipes[item['name']] = tmp

""""""""""""

? - Removed Blue Salt from campfire ingredients.
 - Changed ingredients for Meat Cookfire from 3 Pork to 9 Trimmed Meat.

WEAPON
 * Changed name and equip level for certain weapon types (2H Weapons, Scepters, Instruments)
- Craftsman's is now Artificer's; increased minimum level from 26 to 30.
- Changed crafting levels for Artisan's equipment, increased minimum level from 32 to 34.
- Conqueror's is now Illustrious; increased minimum level from 41 to 44.
- Illustrious is now Magnificent; increased minimum level from 46 to 50.

HANDICRAFT
- Conqueror's is now Illustrious; minimum equip level increased from 40 to 44.
- Illustrious is now Delphinad.

 - Tree copses have a chance of yielding Electric Leaves, a material for Printing.

 * Renamed Crystal to Amethyst.


ALCHEMY
* Changed materials for Purifying Archeum.
* Changed Labor cost of disintegrating Archeum.
* Removed some recipes:
- Hulk Infusion, Mighty Hulk Infusion, Great Hulk Infusion, Blood-stained Revenge, Blood-filled Glass, Brick Wall, Healer's Chalice, Meteor Shower, Aranzeb's Miracle.
* Added Eanna's Obsession, a potion that prevents experience loss on death once.
* Changed several general consumable recipes.
- Main ingredients are now processed materials.
- Recipes require lower-tier finished products.
* Adjusted Dye/Oil/Polish and Specialty Dye recipes.

 CARPENTRY
* Changed a few aspects of furniture crafting:
- Added 7 Regal Workstation recipes.
- Changed certain furniture recipes.
- Designs for furniture crafting are sold by [Carpentry Merchants] or on [Mirage Isle].

 COOKING
* Removed some food recipes and reworked food consumables.
* Consumable food recipes now use processed materials as their main ingredients, and require finished components of lower tiers.

 HANDICRAFTS
* Changed Golden Teardrop Storage Chest recipe.
* Added processed mats used in high-end crafting.

HUSBANDRY
* Removed Livestock Supplement recipe.
* Changed Eco-Friendly Fuel recipe.

MACHINING
- Changed Buoyancy Controller recipe.
- Changed High Power Engine recipe.

MASONRY
* Changed the amount of Labor required to craft Hereafter Stones, and changed the recipe to grant 3 stones per craft.
* Magic Salvage using Evenstones is now affected by Masonry proficiency.

METALWORKING
Removed some recipes (Nui's Smile, Delphinad Ingot)

PRINTING
* Changed Paper, Music Paper, and Blank Regrade Scroll recipes.
* Added Weapon, Armor, and Accessory Regrade Scroll recipe.

TAILORING
* Removed the Fabric recipe that uses Rags.
* Changed the number of cotton required to make Fabric.
* Changed Handicraft Yarn recipe.

WEAPONRY
* Added Jousting Lance recipe.
* Changed mats for Honor weapons.

Commerce
 * Removed existing Specialty recipes and added new ones.
 * Added new specialties to be crafted at a Fellowship Plaza; resident-only specialties cannot be crafted at existing Specialty Workbenches.
* Added specialties crafted at Multipurpose Aging Shelf (23 types of Honey, Herb, Cheese specialties).
- Removed Honey, Cheese, and Herb specific shelf designs.

