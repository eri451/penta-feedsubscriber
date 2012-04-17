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
                select one with \<Tab\> and open it with the wellknown open shotcuts.
            </p>
        </description>
    </item>
</plugin>




                  let hrefs = []
                  window.gBrowser.selectedTab.linkedBrowser.feeds.forEach(function (feed, i) hrefs.push(feed.href));






let newLvmkId = services.livemark.createLivemark(root, "TabGroupie commits", services.io.newURI("https://github.com/eri451/TabGroupie/commits/master", null, null), services.io.newURI("https://github.com/eri451/TabGroupie/commits/master.atom", null, null), -1); // and ther you have a livemark
