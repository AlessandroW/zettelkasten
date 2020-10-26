/**
 * Adds a Tippy preview to the backlink.
 */
function createBacklinkPreview(backlink) {
    // Get the content of the backlink.
    fetch(backlink.href)
        .then(response => response.text())
        .then(htmlString => {
            const backlinkDocument = document.createElement("temp");
            backlinkDocument.innerHTML = htmlString;
            const pageBodies = backlinkDocument.getElementsByClassName("page-body");
            if (pageBodies.length === 1) {
                const pageBody = pageBodies[0];
                pageBody.classList.add("backlinkPreview");
                tippy(backlink, {
                    content: pageBody,
                    allowHTML: true,
                    theme: "light",
                    placement: "right",
                });
            }
        })
        .catch(error => console.error(error));
};

/**
 * Inititializes all tippy backlink previews.
 */
(function createBacklinkPreviews() {
    const backlinks = document.getElementsByClassName('backlink-hover');
    Object.values(backlinks).forEach((backlink) => {
        createBacklinkPreview(backlink);
    });
})();
