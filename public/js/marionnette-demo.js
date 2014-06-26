////////////////////
//// actual app ////
////////////////////
var Bookmark = Backbone.Model.extend({
    idAttribute: '_id',
    //defaults: {url: 'default_url'},
    urlRoot: "/api/bookmark/",
    schema: {
        url: 'Text',
        description: 'Text'
    }
});
var Bookmarks = Backbone.Collection.extend({
    model: Bookmark,
    url: "/api/bookmark/"
});
var BookmarkView = Backbone.Marionette.ItemView.extend({
    initialize: function() {
        this.listenTo(this.model, 'destroy', this.remove);
    },
    template: "#bookmark-template",
    tagName: "li",
    events: {
        'click span.bookmark__delete': 'removeBookmark'
    },
    removeBookmark: function() {
        var self = this;
        this.model.destroy();
    }
});
var BookmarksView = Backbone.Marionette.CollectionView.extend({
    template: "#bookmark-list-template",
    itemView: BookmarkView,
    initialize: function(){}
});
var BookmarkModalView = Backbone.Marionette.ItemView.extend({
    tagName: "div",
    template: "#bookmark-modal-template",
    events: {
        'click button#bookmark-add-modal': 'addBookmark',
        'click div#nothing': ''
    },
    initialize: function(options) {
        this.group_id = options.group_id;
        this.bookmarks = options.bookmarks;
        this.bookmark_form = options.bookmark_form;
    },
    addBookmark: function(e) {
        var new_b = this.bookmark_form.getValue();
        new_b.group_id = this.group_id;
        this.bookmarks.create(
            new_b,
            {wait: true}
        );
    }
});
var BookmarksLayout = Backbone.Marionette.Layout.extend({
    template: "#bookmark-layout-template",
    regions: {
        bookmark_add_modal: "#bookmark-add-modal",
        bookmark_list: "#bookmark-list"
    }
});
///////////////////////////////////
var Group = Backbone.Model.extend({
    idAttribute: '_id',
    urlRoot: "/api/group/",
    schema: {
        name: 'Text',
        description: 'Text'
    }
});
var Groups = Backbone.Collection.extend({
    model: Group,
    url: "/api/group/"
});
var GroupInfoView = Backbone.Marionette.ItemView.extend({
    initialize: function() {
        this.listenTo(this.model, 'destroy', this.remove);
    },
    template: "#group-info-template",
    tagName: "div",
    events: {
        'click span#group_remove': 'removeGroup'
    },
    removeGroup: function() {
        console.log('removing group w/id:'+ this.model.get('_id'));
        this.model.destroy();
    }
});
var GroupModalView = Backbone.Marionette.ItemView.extend({
    tagName: "div",
    template: "#group-modal-template",
    events: {
        'click button#group-add-modal': 'addGroup',
    },
    addGroup: function() {
        var new_group = this.group_form.getValue();
        this.group_collection.create(
            new_group,
            {wait: true}
        );
    }
});

var renderGroupLayout = function(group_layout_view) {
    var curModel = group_layout_view.model;
    var group_id = curModel.get('_id');
    var group_bookmarks = curModel.get('bookmarks');
    // newly added groups won't have this initialized
    if(!group_bookmarks) {
        group_bookmarks = new Bookmarks();
        group_bookmarks.fetch({
            data: $.param({group_id: group_id})
        });
        curModel.set('bookmarks', group_bookmarks);
    }

    var gView = new GroupInfoView({
        model: curModel
    });
    group_layout_view.group_info.show(gView);

    var gBookmarkLayout = new BookmarksLayout({
        collection: group_bookmarks
    });
    var gBookmarkView = new BookmarksView({
        collection: group_bookmarks
    });

    var cur_bookmark_form = new Backbone.Form({
        model: new Bookmark({}),
        idPrefix: 'bookmark-' + group_id + "-"
    }).render();
    var bModal = new BookmarkModalView({
        group_id: group_id,
        bookmarks: group_bookmarks,
        bookmark_form: cur_bookmark_form,
        model: new Backbone.Model({
            group_id: group_id
        })
    });

    group_layout_view.group_bookmarks.show(gBookmarkLayout);
    gBookmarkLayout.bookmark_list.show(gBookmarkView);
    gBookmarkLayout.bookmark_add_modal.show(bModal);
    $('div#bookmark-modal-form-'
      + group_id
      + '.modal-body')
    .append(cur_bookmark_form.el);
};
var GroupLayout = Backbone.Marionette.Layout.extend({
    template: "#groups-layout-template",
    regions: {
        group_info: "#group-info-view",
        group_bookmarks: "#group-bookmarks",
    }
});
var GroupsView = Backbone.Marionette.CollectionView.extend({
    itemView: GroupLayout,
    onAfterItemAdded: function(itemView){
        renderGroupLayout(itemView);
    }
});
MyApp.addRegions({
    group_layout: "#group_layout",
    group_add_modal: "#add_group",
});
var setup_group_modal_view = function(app, groups_coll) {
    var gModalView = new GroupModalView({});
    gModalView.group_collection = groups_coll;
    app.group_add_modal.show(gModalView);
    var group_create_form = new Backbone.Form({
        model: new Group({}),
        idPrefix: 'group-'
    }).render();
    gModalView.group_form = group_create_form;
    $('div#group-modal-form.modal-body').append(group_create_form.el);
};
var group_success = function group_success(groups_coll, response, options) {
    groups_coll.each(function(group){
        var bmarks = new Bookmarks();
        bmarks.fetch({
            data: $.param({group_id: group.get('_id')})
        });
        group.set('bookmarks', bmarks);
    });
    var gCollectionView = new GroupsView({
        collection: groups_coll
    });
    MyApp.group_layout.show(gCollectionView);

    gCollectionView.children.each(function(group_layout_view) {
        renderGroupLayout(group_layout_view);
    });
    setup_group_modal_view(MyApp, groups_coll);
};
MyApp.addInitializer(function(options){
    var signupView = new SignupView();
    var groups = new Groups();
    MyApp.vent.on("login:success", function(user_model) {
        // TODO manage header bar links with a layout
        groups.fetch({
            success: group_success
        });
    });

    MyApp.vent.on("logout:click", function(user_model) {
        groups.reset();
        MyApp.group_layout.show(signupView);
        MyApp.group_add_modal.close();
    });

    MyApp.group_layout.show(signupView);
});

MyApp.start();