console.log("Content script loaded");

let lastEmail = "";

// -------------------------
// EMAIL EXTRACTION
// -------------------------
function getEmailBody() {

    const selectors = [
        "div.a3s.aiL",
        "div.a3s",
        "div.ii.gt"
    ];

    for (const sel of selectors) {
        const elements = document.querySelectorAll(sel);

        if (!elements.length) continue;

        const el = elements[elements.length - 1];

        const text = el?.innerText?.trim();

        if (text && text.length > 50) {
            return text;
        }
    }

    return "";
}

// -------------------------
// SEND LOGIC (DEDUPED)
// -------------------------
function sendEmailIfNew() {
    const emailBody = getEmailBody();

    if (!emailBody) return;

    if (emailBody === lastEmail) return; // prevent spam

    lastEmail = emailBody;

    console.log("📩 NEW EMAIL DETECTED");

    console.log(
        "TEXT BEING SENT:",
        JSON.stringify(emailBody.substring(0, 100)) + "..."
    );

    chrome.runtime.sendMessage({
        type: "CHECK_EMAIL",
        text: emailBody
    });
}

// -------------------------
// REAL-TIME DETECTION
// -------------------------
const observer = new MutationObserver(() => {
    sendEmailIfNew();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

let timeout;

function sendEmailIfNew() {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        const emailBody = getEmailBody();
        if (!emailBody || emailBody === lastEmail) return;

        lastEmail = emailBody;

        chrome.runtime.sendMessage({
            type: "CHECK_EMAIL",
            text: emailBody
        });

    }, 800); // waits for Gmail to finish rendering
}