var Item = Backbone.Model.extend({
    idAttributes: '_id',
    urlRoot: '/api/item/',
    schema: {
        name: 'Text',
        ingredients: 'List',
        proficiency: 'Text',
        labor: 'Text',
        local_id: 'Text'
    }
});
var Items = Backbone.Collection.extend({
    model: Item,
    url: "/api/item/"
});
var ItemView = Backbone.Marionette.ItemView.extend({
    initialize: function() {
        //this.listento(this.model, 'destroy', this.remove);
    },
    template: '#item-template',
    tagName: 'div',
    events: {
        'click .item__delete': 'remove_item'
    },
    remove_item: function(e) {
        console.log(this.model.attributes.name);
        displayed.remove(this.model);
    }
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
    initialize: function(opts) {
        //this.listento(this.model, 'destroy', this.remove);
        self.items = opts.items;
    },
    template: '#search-template',
    tagName: 'div',
    events: {'submit': 'ensure_added'},
    ensure_added: function(e) {
        e.preventDefault();
        var to_display = models_by_name[$('#item_search_box').val()];
        if(to_display) {
            self.items.add(to_display);
        }
        return false;
    }
});

var items_fetch_success = function(items, resp, options) {
    var iCollectionView = new ItemsView({
        collection: items
    });
    var search_view = new SearchView({items: items});
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
var models_by_name = {};
var displayed = new Items();

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

    _.each(vals, function(val) {
        models_by_name[val.name] = new Item(val);
    });

    //TODO drive this by either persisted set from localstorage or search-only
    for(var i=0,iLen=5;i<iLen;i++) {
        displayed.push(models_by_name[vals[i].name]);
    }
    items_fetch_success(displayed);
});
