document.addEventListener("DOMContentLoaded", () => {

    chrome.runtime.sendMessage(
        { type: "GET_RESULT" },
        (response) => {

            const data = response?.data;

            const container = document.getElementById("content");

            if (!data) {
                container.innerText = "No email analyzed yet";
                return;
            }

            const risk = data.risk;
            const score = data.threat_score;

            const color =
                risk === "phishing" ? "#d9534f" :
                risk === "suspicious" ? "#f0ad4e" :
                "#5cb85c";

            container.innerHTML = `
                <div class="box" style="background:${color}">
                    ${risk.toUpperCase()}
                </div>
                <p style="text-align:center;margin-top:10px;">
                    Threat Score: ${score}%
                </p>
            `;
        }
    );
});