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
        history.pushState({}, null, `${location.pathname}?${zettels}`);
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
        history.pushState({}, null, newURL);
    } else if (index === 0) {
        const newURL = location.href.replace(zettelPathname.replaceAll("/", "%2F") + "&z=", "")
        history.pushState({}, null, newURL);
    } else {
        const newURL = location.href.replace("&z=" + zettelPathname.replaceAll("/", "%2F"), "")
        history.pushState({}, null, newURL);
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


/**
 * Reload the page if the user presses back or forward.
 */
window.addEventListener('popstate', function(){
    location.reload();
})


/**
 * Inititializes all link previews.
 *
 * The idea is that when you hover over a link you see
 * a preview of the article, similar to Wikipedia's preview.
 */
function fetchLinks() {
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

fetchLinks();


