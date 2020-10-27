/**
 * Adds a Tippy preview to the backlink.
 */
function createBacklinkPreview(backlink) {
    // Get the content of the backlink.
    fetch(backlink.href)
        .then(response => response.text())
        .then(htmlString => {
            const backlinkDocument = document.createElement("div");
            backlinkDocument.innerHTML = htmlString;
            const pageBodies = backlinkDocument.getElementsByClassName("page-body");
            if (pageBodies.length === 1) {
                const pageBody = pageBodies[0];
                const backlinkPreview = document.createElement("div");
                backlinkPreview.innerHTML = pageBody.innerHTML;
                backlinkPreview.classList.add("backlink-tooltip");
                backlink.parentNode.insertBefore(backlinkPreview, backlink.siblingNode);
            }
        })
        .catch(error => console.error(error));
};

/**
 * Inititializes all tippy backlink previews.
 *
 * The idea is that when you hover over a backlink you see
 * a preview of the article, similar to Wikipedia's preview.
 */
(function createBacklinkPreviews() {
    const page = document.querySelector(".page");

    const backlinks = document.getElementsByClassName('backlink');
    Object.values(backlinks).forEach((backlink) => {
        createBacklinkPreview(backlink);
    });
})();
