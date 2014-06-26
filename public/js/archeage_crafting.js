var ItemList = Backbone.Model.extend({
    idAttributes: '_id',
    urlRoot: '/api/item/',
    schema: {
        // name: 'Text'
        //, ingredients: 'List'
    }
});

var Item = Backbone.Model.extend({
    idAttributes: '_id',
    urlRoot: '/api/item/',
    schema: {
        name: 'Text',
        ingredients: 'List',
        proficiency: 'Text',
        labor: 'Text',
    }
});
var Ingredient = Backbone.Model.extend({
    schema: {
        name: 'Text',
        qty: 'Text'
    }
});
var Ingredients = Backbone.Collection.extend({
    model: Ingredient,
    url: "/api/item/"
});

var Items = Backbone.Collection.extend({
    model: Item,
    url: "/api/item/"
});

var IngredientView = Backbone.Marionette.ItemView.extend({
    initialize: function() {
        //this.listento(this.model, 'destroy', this.remove);
    },
    template: '#ingredient-template',
    tagName: 'li',
    // events: {}
});
var IngredientssView = Backbone.Marionette.CollectionView.extend({
    template: "#ingredients-template",
    itemView: IngredientView,
    initialize: function(){}
});

var ItemView = Backbone.Marionette.ItemView.extend({
    initialize: function() {
        //this.listento(this.model, 'destroy', this.remove);
    },
    template: '#item-template',
    tagName: 'div',
    // events: {}
});
var ItemsView = Backbone.Marionette.CollectionView.extend({
    template: "#item-list-template",
    itemView: ItemView,
    initialize: function(){}
});
var ItemsLayout = Backbone.Marionette.Layout.extend({
    template: '#item-layout-template',
    regions: {
        item_list: '#item-list'
    }
});
var SearchView = Backbone.Marionette.ItemView.extend({
    initialize: function() {
        //this.listento(this.model, 'destroy', this.remove);
    },
    template: '#search-template',
    tagName: 'div',
    events: {'submit': 'ensure_added'},
    ensure_added: function(e) {
        e.preventDefault();
        console.log("want to add:"+$('#item_search_box').val());
        return false;
    }

});

var items_fetch_success = function(items, resp, options) {
    var iCollectionView = new ItemsView({
        collection: items
    });
    var search_view = new SearchView();
    MyApp.search_region.show(search_view);
    MyApp.items_region.show(iCollectionView);

    $('#item_search_box').typeahead({
        items: 5,
        minLength: 2,
        source: typeahead_names,
        // slow as shit
        // matcher: function(item) { return fuzzyMatcher(item, this.query, 2); },
        // highlighter: function(item) { return fuzzyHighlighter(item, this.query, 2); }
    });
};
var MyApp = new Backbone.Marionette.Application();
MyApp.addRegions({
    search_region: '#search_layout',
    items_region: '#item_layout'
});
MyApp.start();

var key_map = {
    'Req. Labor': 'labor',
    'Proficiency': 'proficiency',
    'name': 'name',
    'ingredients': 'ingredients'
};
var typeahead_names = [];
var fix_json = function(value) {
    // use key_map to fix value names, then collapse key/val array into dict
    return _.reduce(_.map(_.keys(value), function(key) {
        return [key_map[key], value[key]];
    }), function(accum, cur) {
        accum[cur[0]] = cur[1];
        return accum;
    }, {});
};
$.getJSON("arch_recipes.json", function(json) {
    var blacklist = ['0', "Voyager's Meteor Spear"];
    var vals = _.values(json);
    vals = _.map(vals, fix_json);
    vals = _.map(vals, function(val) {
        val.local_id=val.name.replace(/[\s\'']/g,'');
        return val;
    });
    vals = _.filter(vals, function(cur) {
        return !_.contains(blacklist, cur.name);
    });

    typeahead_names = _.pluck(vals, 'name');

    var iList = new Items();
    //for(var i=0,iLen=vals.length;i<iLen;i++) {
    for(var i=0,iLen=5;i<iLen;i++) {
        iList.add(vals[i]);
    }
    items_fetch_success(iList);
});
