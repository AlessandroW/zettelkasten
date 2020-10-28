/**
 * Adds a preview to the link.
 */
function addLink(originalZettel, link) {

    // Get the content of the link.
    if (link.host === location.host){
        fetch(link.href)
            .then(response => response.text())
            .then(htmlString => {
                // Retrieve .
                const linkDocument = document.createElement("div");
                linkDocument.innerHTML = htmlString;
                const zettels = linkDocument.getElementsByClassName("zettel");
                if (zettels.length === 1){
                    const zettel = zettels[0]
                    zettel.dataset.pathname = link.pathname;
                    if (!! link.parentNode){
                        createLinkPreview(link, zettel.getElementsByClassName("zettel-summary")[0]);
                        link.addEventListener("click", (event) => {
                        event.preventDefault();
                        insertZettelNext(originalZettel, zettel, link);
                    });
                    } else {
                       addLinks(zettel);
                       originalZettel.parentNode.insertBefore(zettel, null); 
                    }
                }
            }).catch(error => console.error(error));
    }
};

function createLinkPreview(link, preview){
    preview.classList.remove("zettel-summary");
    preview.classList.add("backlink-tooltip");
    link.parentNode.insertBefore(preview, link.nextSibling);
}

function insertZettelNext(zettel, adjacentZettel, link){
    const zettels = new URLSearchParams(location.search.slice(1));
    if (!zettels.getAll("z").includes(link.pathname)) {
        zettels.append('z', link.pathname);
        history.pushState(history.state, null, `${location.pathname}?${zettels}`);
        addLinks(adjacentZettel);
        zettel.parentNode.insertBefore(adjacentZettel, zettel.nextSibling); 
        
    }
    
}


function addLinks(zettel) {
    const links = zettel.getElementsByTagName('a');
    Object.values(links).forEach((link) => {
        addLink(zettel, link);
    });
}

function removeZettel(event){
    const zettelPathname = event.target.parentNode.parentNode.dataset.pathname;
    const zettels = new URLSearchParams(location.search.slice(1)).getAll("z")
    const index = zettels.indexOf(zettelPathname);
    if (index === 0 && zettels.length === 1){
        const newURL = location.href.replace("?z=" + zettelPathname.replaceAll("/", "%2F"), "")
        history.pushState(history.state, null, newURL);
    } else if (index === 0) {
        const newURL = location.href.replace(zettelPathname.replaceAll("/", "%2F") + "&z=", "")
        history.pushState(history.state, null, newURL);
    } else {
        const newURL = location.href.replace("&z=" + zettelPathname.replaceAll("/", "%2F"), "")
        history.pushState(history.state, null, newURL);
    } 
    
    event.target.parentNode.parentNode.remove();
    
}

/**
 * Use the org-roam-protocol to open the note in Emacs.
 *
 * Important! This requires the correct template.
 * ```
 * (setq org-roam-capture-ref-templates
 *      '(("t" "ref" plain (function org-roam-capture--get-point)
 *         "%?"
 *         :file-name "${ref}"
 *         :unnarrowed t)
 *        ))
 * ```
 */
function openZettelInEmacs(event){
    // Zettel filename.
    let zettelPathname = event.target.parentNode.parentNode.dataset.pathname;
    // If the mouse is on the "Open In Emacs" description child span.
    if (!zettelPathname) {
        zettelPathname = event.target.parentNode.parentNode.parentNode.dataset.pathname;
    }

    //TODO: How can I make this dependent on the org-roam protocol?
    const protocolLink = new URL("org-protocol://roam-ref?template=t&ref="
                                 + encodeURIComponent(zettelPathname.split("/")[2])
                                 + "&title="
                                );
    // Call the org-roam protocol.
    location.href = protocolLink.href;
}


function searchForZettel() {
    // FIXME Add keyboard support.
    // Problem: we search for Zettels when the user types,
    // so we need to filter by key first?
    const searchInput = document.getElementById("searchBar");
    const searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = "";
    if (!!searchInput.value){
        const matches = Object.values(history.state.zettels)
                              .filter(o => o.title.toLowerCase().includes(searchInput.value.trim().toLowerCase()));
        console.log(matches);
        matches.forEach(match => {
            const item = document.createElement("div");
            item.classList.add("search-result");
            item.innerHTML = match.title;
            item.addEventListener("click", (event) => {
                location.href = match.href;  
            });
            searchResults.appendChild(item);
        })    
    }
    
}

/**
 * Reload the page if the user presses back or forward.
 */
window.addEventListener('popstate', () => {
    // FIXME You can go back, i.e. remove a Zettel but you cannot leave the Zettel view.
    // But if you fix that with `history.back()` you
    // cannot go back a step in creating the grid.
    location.reload();
})


/**
 * Inititializes all link previews.
 *
 * The idea is that when you hover over a link you see
 * a preview of the article, similar to Wikipedia's preview.
 */
function fetchLinks() {
    fetch(location.origin + "/posts/")
        .then((response) => response.text())
        .then((htmlString) => {
            const doc = document.createElement("div");
            doc.innerHTML = htmlString;
            const zettels = doc.getElementsByClassName("readmore");
            const zettelLinks = Object.values(zettels).map(o => {
                return {
                    "href": o.href,
                    "title": o.title
                };
            });
            history.pushState({"zettels": zettelLinks}, null);
    });
    
    const zettelGrid = document.querySelector(".zettel-grid");
    if (zettelGrid && zettelGrid.dataset.zettelView){
        const zettel = document.querySelector(".zettel");
        zettel.dataset.originalZettel = "true";
        zettel.dataset.pathname = location.pathname;
        addLinks(zettel);
        const zettels = new URLSearchParams(location.search.slice(1)).getAll("z");
        zettels.forEach((adjacentZettel) => {
            const url = new URL(location.origin + adjacentZettel);
            addLink(zettel, url)
        })    
    }
}

fetchLinks();


