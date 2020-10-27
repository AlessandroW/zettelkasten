/**
 * Adds a preview to the link.
 */
function addLink(originalZettel, link) {
    // Get the content of the link.
    if (link.host === window.location.host){
        fetch(link.href)
            .then(response => response.text())
            .then(htmlString => {
                // Retrieve .
                const linkDocument = document.createElement("div");
                linkDocument.innerHTML = htmlString;
                const zettel = linkDocument.getElementsByClassName("zettel")[0];
                createLinkPreview(link, zettel.getElementsByClassName("zettel-summary")[0])
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    insertZettelNext(originalZettel, zettel);
                });


            })
            .catch(error => console.error(error));
    }
};

function createLinkPreview(link, preview){
    preview.classList.remove("zettel-summary");
    preview.classList.add("backlink-tooltip");
    link.parentNode.insertBefore(preview, link.nextSibling);
}

function insertZettelNext(zettel, adjacentZettel){
    addLinks(adjacentZettel);
    zettel.parentNode.insertBefore(adjacentZettel, zettel.nextSibling); 
}


function addLinks(zettel) {
    const links = zettel.getElementsByTagName('a');
    Object.values(links).forEach((link) => {
        addLink(zettel, link);
    });
}

function removeZettel(event){
    event.target.parentNode.remove();
}



/**
 * Inititializes all link previews.
 *
 * The idea is that when you hover over a link you see
 * a preview of the article, similar to Wikipedia's preview.
 */
(function fetchLinks() {
    const zettel = document.querySelector(".zettel");
    zettel.dataset.originalZettel = "true";
    addLinks(zettel);
})();


