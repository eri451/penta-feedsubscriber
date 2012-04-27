XML.ignoreWhitespace = false;
XML.prettyPrinting   = false;
var INFO=
<plugin  name="Penta-Feedsubscriber" version="0.0a"
         href="http://github.com/eri451"
         summary="Feedsubscribe-plugin"
        xmlns={NS}>

    <author email="hans.orter@gmx.de">Eri!</author>
    <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
    <project name="Pentadactyl" min-version="1.0b7.2"/>
    <p>
        This plugin shall help you subscriging and reading Feeds.
    </p>
    <item>
        <tags>:fs :feed-subscribe</tags>
        <spec>:subscribe <oa>aFeed</oa></spec>
        <description>
            Suscribes the feed via the livemark service
        </description>
    </item>
    <item>
        <tags>:fo :feed-open</tags>
        <spec>:read-open <oa>aFeed</oa></spec>
        <description>
            <p>
                Shows all the entries of the spectified feed
            </p>
            <p>
                select one with <oa>Tab</oa> and open it with the wellknown open shotcuts.
            </p>
        </description>
    </item>
</plugin>


let subscriber = {

    getFeeds: function getFeeds(){
        let hrefs = [];
        let curBrowser = window.gBrowser.selectedTab.linkedBrowser;
        if ("feeds" in curBrowser){
            curBrowser.feeds.forEach( function (feed, i) {
                hrefs.push({
                    "href" : feed.href,
                    "title": feed.title
                });
            });
            return hrefs;
        }
        else dactyl.echoerr("No Feeds on this page");
    },


    getTitle: function getTitle(href){
        let hrefs = subscriber.getFeeds()
        for (let i = 0; i < hrefs.length; i+=1){
            if (hrefs[i].href === href)
                return hrefs[i].title;
        }
    },

    subscribe: function subscribe(feedhref){
        let lvmsvc = Components.classes[
                "@mozilla.org/browser/livemark-service;2"].getService(
                Components.interfaces.nsILivemarkService);
        let iosvc = Components.classes[
                "@mozilla.org/network/io-service;1"].getService(
                Components.interfaces.nsIIOService);
        let loc = window.content.location.href;

        let title = subscriber.getTitle(feedhref);
        let gotTitle = false;
        if (title === undefined){
            commandline.input("Title: ", userTitle, { argCount: "1"});
        }
        else{
            gotTitle = true;
        }

        function userTitle(args){
            if (typeof(args) === "string") title = args;
            let newLvmId = lvmsvc.createLivemark(  // maybe we need the id again
                subscriber.getFeedFolderId(),
                title,
                iosvc.newURI(loc, null ,null),
                iosvc.newURI(feedhref, null, null),
                -1
            );
        }

        if (gotTitle){
            let newLvmId = lvmsvc.createLivemark(  // maybe we need the id again
                subscriber.getFeedFolderId(),
                title,
                iosvc.newURI(loc, null ,null),
                iosvc.newURI(feedhref, null, null),
                -1
            );
        }
    },

    complete: {
        livemarks: function livemarks(){
            let lvmsvc = Components.classes[
                    "@mozilla.org/browser/livemark-service;2"].getService(
                    Components.interfaces.nsILivemarkService);
            let bmsvc = Components.classes[
                    "@mozilla.org/browser/nav-bookmarks-service;1"].getService(
                    Components.interfaces.nsINavBookmarksService);

            let lvms = [];
            let ffldr = subscriber.getFeedFolderId();

            for (let i = 0; bmsvc.getIdForItemAt(ffldr,i) != -1; i+=1){
                let id = bmsvc.getIdForItemAt(ffldr,i);
                lvms.push({
                    "title": bmsvc.getItemTitle(id),
                    "href" : lvmsvc.getFeedURI(id).spec,
                    "id"   : id
                });
            }
            return lvms;
        },

        itemsOf: function itemsOf(lvmId){
            let lvmsvc = Components.classes[
                    "@mozilla.org/browser/livemark-service;2"].getService(
                    Components.interfaces.nsILivemarkService);
            let bmsvc = Components.classes[
                    "@mozilla.org/browser/nav-bookmarks-service;1"].getService(
                    Components.interfaces.nsINavBookmarksService);

            let bkms = [];

            for (let j = 0 ; bmsvc.getIdForItemAt(lvmId,j) != -1; j+=1){
                let id = bmsvc.getIdForItemAt(lvmId,j);
                bkms.push({
                    "href": bmsvc.getBookmarkURI(id).spec,
                    "name": bmsvc.getItemTitle(id)
                });
            }
            return bkms;
        }
    },

    readafeed: function readafeed(feedtitle){
        let lvms = subscriber.complete.livemarks();
        for (let i = 0; i < lvms.length; i+=1){
            if (lvms[i].title === feedtitle){
                let id = lvms[i].id
                return id;
            }
        }
    },

    del: function del(feedtitle){
        let bmsvc = Components.classes[
                "@mozilla.org/browser/nav-bookmarks-service;1"].getService(
                Components.interfaces.nsINavBookmarksService);
        bmsvc.removeItem(subscriber.readafeed(feedtitle));
    },

    getFeedFolderId: function getFeedFolderId(){
        return subscriber.setFeedFolder(options.feedfolder);
    },

    setFeedFolder: function setFeedFolder(name){
        let bmsvc = Components.classes[
                "@mozilla.org/browser/nav-bookmarks-service;1"].getService(
                Components.interfaces.nsINavBookmarksService);

        let bkms = [];
        let bkmMfldr = bmsvc.bookmarksMenuFolder;

        for (let k = 0; bmsvc.getIdForItemAt(bkmMfldr,k) != -1; k+=1){
            let id = bmsvc.getIdForItemAt(bkmMfldr,k);
            bkms.push({
                "name": bmsvc.getItemTitle(id),
                "id"  : id
            });
        }
        for (let n = 0; n < bkms.length; n+=1){
            if (bkms[n].name === name)
                return bkms[n].id;
        }
        return bmsvc.createFolder(bmsvc.bookmarksMenuFolder, name, -1);
    },

    update: function update(id){
        let lvmsvc = Components.classes[
                "@mozilla.org/browser/livemark-service;2"].getService(
                Components.interfaces.nsILivemarkService);
        lvmsvc.reloadLivemarkFolder(id);
    },
}


group.commands.add(["reada[feed]","rf"],
                    "open a feed to read its items",
                    function (args){
                        ex.open(args[1]);
                    },
                    {
                        argCount: "+",
                        completer: function (context, args){
                            switch (args.completeArg) {
                            case 0:
                                let lvms = subscriber.complete.livemarks();
                                context.keys = { text: "title", description: "href" };
                                context.completions = lvms;
                                break;
                            case 1:
                                subscriber.update(subscriber.readafeed(args[0]));
                                let marks =
                                    subscriber.complete.itemsOf(
                                        subscriber.readafeed(args[0])
                                    );
                                context.keys = { text: "href", description: "name" };
                                context.completions = marks;
                                break;
                            }
                        },
                    });

group.commands.add(["subs[cribeafeed]","sf"],
                    "subscribe a feed",
                    function (args){
                        subscriber.subscribe(args[0]);
                    },
                    {
                        argCount: "1",
                        completer: function (context){
                            let hrefs = subscriber.getFeeds();
                            context.keys = { text: "href", description: "title" };
                            context.completions = hrefs;
                        },
                    });

group.commands.add(["delfeed"],
                    "delete a feed in your pentafeeds folder",
                    function (args){
                        subscriber.del(args[0]);
                    },
                    {
                        argCount: "1",
                        completer: function (context){
                            let lvms = subscriber.complete.livemarks();
                            context.keys = { text: "title", description: "href" };
                            context.completions = lvms;
                        }
                    });

group.options.add( ["feedfolder","ffldr"],  //FIXME I have no idea of options
                    "Set the penta-feedsubscriber folder",
                    "string","pentafeeds",
                    {
                        setter: function (value) {
                                    subscriber.setFeedFolder(value);
                                    return value },
                        persist: true
                    });

//TODO rename feeds
