
import redis
r = redis.StrictRedis(host='localhost', port=6379, db=0)
r.set('foo', 'bar')
True
r.get('foo')

"""
pip install redis beautifulsoup4
interesting html snippet for recipes from generic header
    <li><a href="http://archeagedatabase.net/us/recipes/">Design</a>
    <ul>
        <li><a href="http://archeagedatabase.net/us/recipes/weaponcraft/">Weaponry</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/woodcraft/">Carpentry</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/tailoring/">Tailoring</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/leatherworking/">Leatherwork</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/blacksmithing/">Metalwork</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/decoration/">Handicrafts</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/alchemy/">Alchemy</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/cooking/">Cooking</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/engineering/">Machining</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/stockraising/">Husbandry</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/herbalism/">Gathering</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/agriculture/">Farming</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/hewing/">Masonry</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/typografy/">Printing</a></li>
        <li><a href="http://archeagedatabase.net/us/recipes/trading/">Commerce</a></li>
    </ul>

recipe URL: http://archeagedatabase.net/tip.php?id=recipe--2&l=us
recipe ids seem to start at 2
"http://archeagedatabase.net/tip.php?id=recipe--%d&l=us" % cur_number

soup.div[reward_counter_big]
#"""

import redis
import requests
import time
import json
from bs4 import BeautifulSoup

r = redis.StrictRedis(host='localhost', port=6379, db=0)

BASE_URL = 'http://archeagedatabase.net/us/armor/'
RECIPE_EXAMPLE_URL = 'http://archeagedatabase.net/tip.php?id=recipe--2&l=us'
RECIPE_BASE_URL = 'http://archeagedatabase.net/tip.php?id=recipe--%d&l=us'
RECIPE_KEY = 'recipe_%d'

def get_url(url):
    cached = r.get(url)
    if cached: return cached

    raw_text = requests.get(url).text
    r.set(url, raw_text)
    return raw_text

def parse_recipe_info(accum, o):
    try:
        tmp = o.split(':')
        accum[tmp[0]] = tmp[1].strip()
    except (IndexError, TypeError): pass
    return accum

def get_recipe_details(full_soup):
    target_table = full_soup.find("table", class_="item_frame_table")
    # magic number for inner table
    # this has specialty name, labor req, proficiency, and workbench
    recipe_info = target_table.table("table", class_="itemwhite_table")[0]
    # parse out the name from a <span>
    data = recipe_info.tr.td.next_sibling
    result = reduce(parse_recipe_info, data.contents, {})
    # sometimes there's a colon, sometimes not...
    if ':' in data.span.text:
        result["name"] = data.span.text.split(':')[1].strip()
    else:
        result['name'] = data.span.text.strip()
    return result

def parse_ingredient_pairs(pairs_seq):
    for name, qty in pairs_seq:
        if len(name) == 0 or len(qty) == 0:
            continue
        tmp = {}
        tmp['name'] = name
        tmp['qty'] = qty
        yield tmp

def get_recipe_ingredients(full_soup):
    # fixme? unvalidated line here
    target_table = full_soup.find("table", class_="item_frame_table")

    recipe_divs = target_table.find_all("div", class_="reward_counter_big")
    # when we select by 'reward_counter_big' class, the last item in this list is the result
    recipe_divs = recipe_divs[0:-1]
    # from [html], end up with [{}]
    f = lambda s: s.text.split(' x ')
    split_results = map(f, recipe_divs)
    ingredients = parse_ingredient_pairs(split_results)
    return [i for i in ingredients]

def process_recipe_page(page_html):
    soup = BeautifulSoup(page_html)
    result = get_recipe_details(soup)
    result['ingredients'] = get_recipe_ingredients(soup)
    if result['name'] is None or len(result['name']) == 0:
        return None
    return result



# 2-6171
# xrange(2, 6172)
fetched = {}
for i in xrange(150, 6172):
    if i % 25 == 0: print 'current number is %d' % i
    cur_url = RECIPE_BASE_URL % i
    html = get_url(cur_url)
    try:
        result = process_recipe_page(html)
    except ValueError as e:
        print 'value unpack error, probably empty url %s:'%cur_url, e
    except (IndexError, AttributeError) as e:
        print 'error parsing url %s:'%cur_url, e
    if result:
        key = RECIPE_KEY % i
        r.set(key, result)
        fetched[result['name']] = result
    #time.sleep(1)
# 2675-2750
# 2800-2875
# 4375-5300
# 5450-5475
# 5975-6000
# 6100-6150


all_recipes = []
for i in xrange(2, 6172):
    key = RECIPE_KEY % i
    recipe = r.get(key)
    all_recipes.append(recipe)

with open('/home/pcrane/arch_recipes.json', 'a') as the_file:
    the_file.write(json.dumps(new_recipes))
