let latestResult = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.type === "CHECK_EMAIL") {

        fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: msg.text })
        })
        .then(res => res.json())
        .then(data => {

            latestResult = data; // ✅ STORE RESULT

            console.log("Stored result:", latestResult);
            
        })
        .catch(err => console.error(err));
    }

    // popup request
    if (msg.type === "GET_RESULT") {
        sendResponse({ data: latestResult });
        return true;
    }
});