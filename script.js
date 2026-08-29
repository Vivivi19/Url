console.log("script.js loaded");

// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL =
    "https://a6okq9rcua.execute-api.us-east-1.amazonaws.com";

const SHORTEN_API =
    `${API_BASE_URL}/shorten`;

const MY_URLS_API =
    `${API_BASE_URL}/myurls`;

const ANALYTICS_API =
    `${API_BASE_URL}/analytics`;


// ======================================================
// EXPIRATION SELECTOR
// ======================================================

const expirationSelect =
    document.getElementById("expiration");

const customExpirationContainer =
    document.getElementById("customExpirationContainer");

const customExpirationInput =
    document.getElementById("customExpiration");


if (expirationSelect) {

    expirationSelect.addEventListener(
        "change",
        function () {

            if (this.value === "custom") {

                customExpirationContainer.classList.remove(
                    "hidden"
                );

            } else {

                customExpirationContainer.classList.add(
                    "hidden"
                );

                customExpirationInput.value = "";
            }
        }
    );
}
// ======================================================
// EXISTING CHART BAR ANIMATION
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const bars = document.querySelectorAll(".chart-bar");

    bars.forEach(bar => {

        let finalHeight = bar.style.height;

        if (!finalHeight) {

            const match = bar.className.match(/h-\[(\d+)%\]/);

            if (match) {
                finalHeight = match[1] + "%";
            }
        }

        if (finalHeight) {

            bar.style.height = "0%";

            setTimeout(() => {
                bar.style.height = finalHeight;
            }, 100);
        }
    });
});


// ======================================================
// CREATE SHORT URL
// ======================================================

const shortenBtn =
    document.getElementById("shortenBtn");

if (shortenBtn) {

    shortenBtn.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            const longUrlInput =
                document.getElementById("longUrl");

            if (!longUrlInput) {

                console.error(
                    "Long URL input not found."
                );

                return;
            }

            const longUrl =
                longUrlInput.value.trim();


            // ------------------------------------------
            // Validate Long URL
            // ------------------------------------------

            if (!longUrl) {

                alert(
                    "Please enter a URL."
                );

                return;
            }


            // ------------------------------------------
            // Get expiration selection
            // ------------------------------------------

            const expiration =
                expirationSelect
                    ? expirationSelect.value
                    : "never";


            const customExpiration =
                customExpirationInput
                    ? customExpirationInput.value
                    : "";


            // ------------------------------------------
            // Validate custom expiration
            // ------------------------------------------

            if (
                expiration === "custom" &&
                !customExpiration
            ) {

                alert(
                    "Please select a custom expiration date and time."
                );

                return;
            }


            // ------------------------------------------
            // Send request to Lambda
            // ------------------------------------------

            try {

               const idToken = localStorage.getItem("idToken");

if (!idToken) {
    alert("Please log in first.");
    window.location.href = "Login.html";
    return;
}

const response =
    await fetch(
        SHORTEN_API,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${idToken}`
            },

            body: JSON.stringify({
                longUrl:
                    longUrl,

                expiration:
                    expiration,

                customExpiration:
                    customExpiration
            })
        }
    );


                // --------------------------------------
                // Check response
                // --------------------------------------

                if (!response.ok) {

                    const errorText =
                        await response.text();

                    console.error(
                        "Lambda error:",
                        errorText
                    );

                    throw new Error(
                        `HTTP error: ${response.status}`
                    );
                }


                // --------------------------------------
                // Read response
                // --------------------------------------

                const data =
                    await response.json();


                console.log(
                    "Short URL created:",
                    data
                );


                // --------------------------------------
                // Create short URL
                // --------------------------------------

                const shortUrl =
                    `${API_BASE_URL}/${data.shortCode}`;


                // --------------------------------------
                // Store for other pages
                // --------------------------------------

                localStorage.setItem(
                    "shortUrl",
                    shortUrl
                );

                localStorage.setItem(
                    "shortCode",
                    data.shortCode
                );

                localStorage.setItem(
                    "longUrl",
                    data.longUrl
                );

                localStorage.setItem(
                    "createdAt",
                    data.createdAt
                );

                localStorage.setItem(
                    "expiresAt",
                    data.expiresAt || ""
                );


                // --------------------------------------
                // Show result
                // --------------------------------------

                alert(
                    "Short URL: " + shortUrl
                );


                // --------------------------------------
                // Clear input
                // --------------------------------------

                longUrlInput.value = "";

                if (expirationSelect) {
                    expirationSelect.value =
                        "never";
                }

                if (customExpirationInput) {

                    customExpirationInput.value = "";

                }

                if (customExpirationContainer) {

                    customExpirationContainer.classList.add(
                        "hidden"
                    );

                }


            } catch (error) {

                console.error(
                    "Error creating short URL:",
                    error
                );

                alert(
                    "Something went wrong while shortening the URL."
                );
            }
        }
    );
}


// ======================================================
// MY URLS
// ======================================================

async function loadMyUrls() {

    /*
     * We use these IDs if they exist.
     * The HTML change needed is explained below.
     */

    const desktopBody =
        document.getElementById("myUrlsBody");

    const mobileBody =
        document.getElementById("myUrlsMobile");

    /*
     * If this is not the My URLs page,
     * simply stop.
     */

    if (!desktopBody && !mobileBody) {
        return;
    }

    try {

        const idToken = localStorage.getItem("idToken");

        if (!idToken) { window.location.href = "Login.html";
        return;
}

    const response =
    await fetch(MY_URLS_API, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${idToken}`
        }
    });

if (!response.ok) {
    throw new Error(
        `HTTP error: ${response.status}`
    );
}

        const urls =
            await response.json();

        console.log(
            "My URLs received:",
            urls
        );

        /*
         * Clear old/sample data.
         */

        if (desktopBody) {
            desktopBody.innerHTML = "";
        }

        if (mobileBody) {
            mobileBody.innerHTML = "";
        }


        /*
         * No URLs found.
         */

        if (!Array.isArray(urls) || urls.length === 0) {

            if (desktopBody) {

                desktopBody.innerHTML = `
                    <tr>
                        <td
                            colspan="6"
                            class="py-lg px-md text-center text-on-surface-variant"
                        >
                            No shortened URLs found.
                        </td>
                    </tr>
                `;
            }

            if (mobileBody) {

                mobileBody.innerHTML = `
                    <div class="p-lg text-center text-on-surface-variant">
                        No shortened URLs found.
                    </div>
                `;
            }

            return;
        }


        /*
         * Create each URL row/card.
         */

        urls.forEach(url => {

            createDesktopRow(
                url,
                desktopBody
            );

            createMobileCard(
                url,
                mobileBody
            );
        });


        /*
         * Update the "Showing X entries" text.
         */

        updateEntryCount(urls.length);


    } catch (error) {

        console.error(
            "Error loading My URLs:",
            error
        );

        if (desktopBody) {

            desktopBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="py-lg px-md text-center text-error"
                    >
                        Unable to load URLs.
                    </td>
                </tr>
            `;
        }

        if (mobileBody) {

            mobileBody.innerHTML = `
                <div class="p-lg text-center text-error">
                    Unable to load URLs.
                </div>
            `;
        }
    }
}


// ======================================================
// CREATE DESKTOP TABLE ROW
// ======================================================

function createDesktopRow(url, container) {

    if (!container) {
        return;
    }

    const shortUrl =
        `${API_BASE_URL}/${url.shortCode}`;

    const clicks =
        Number(url.clicks || 0);

    const createdDate =
        formatDate(url.createdAt);

    const status =
        getStatus(url);


    const row =
        document.createElement("tr");

    row.className =
        "hover:bg-surface-container-low transition-colors group";


    row.innerHTML = `

        <!-- Short URL -->
        <td class="py-md px-md">

            <div class="flex items-center gap-sm">

                <span
                    class="text-primary font-code text-code truncate max-w-[180px]"
                    title="${escapeHtml(shortUrl)}"
                >
                    ${escapeHtml(shortUrl)}
                </span>

                <button
                    type="button"
                    class="copy-url-btn text-outline hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy"
                    data-url="${escapeAttribute(shortUrl)}"
                >
                    <span
                        class="material-symbols-outlined text-[16px]"
                    >
                        content_copy
                    </span>
                </button>

            </div>

        </td>


        <!-- Original URL -->
        <td
            class="py-md px-md text-on-surface-variant truncate max-w-[200px]"
            title="${escapeAttribute(url.longUrl || "")}"
        >
            ${escapeHtml(
                truncateUrl(url.longUrl || "")
            )}
        </td>


        <!-- Clicks -->
        <td
            class="py-md px-md text-right font-medium text-on-surface"
        >
            ${clicks.toLocaleString()}
        </td>


        <!-- Status -->
        <td class="py-md px-md">

            ${createStatusBadge(status)}

        </td>


        <!-- Created -->
        <td
            class="py-md px-md text-on-surface-variant"
        >
            ${createdDate}
        </td>


        <!-- Actions -->
        <td class="py-md px-md">

            <div
                class="flex items-center justify-center gap-xs"
            >

                <!-- QR -->
                <button
                    type="button"
                    class="qr-btn p-1 rounded-md text-outline hover:text-primary hover:bg-surface-variant transition-colors"
                    title="QR Code"
                    data-url="${escapeAttribute(shortUrl)}"
                    data-code="${escapeAttribute(url.shortCode)}"
                >

                    <span
                        class="material-symbols-outlined text-[18px]"
                    >
                        qr_code
                    </span>

                </button>


                <!-- Analytics -->
                <button
                    type="button"
                    class="analytics-btn p-1 rounded-md text-outline hover:text-primary hover:bg-surface-variant transition-colors"
                    title="Analytics"
                    data-code="${escapeAttribute(url.shortCode)}"
                >

                    <span
                        class="material-symbols-outlined text-[18px]"
                    >
                        bar_chart
                    </span>

                </button>


                <!-- Delete -->
                <button
                    type="button"
                    class="delete-btn p-1 rounded-md text-outline hover:text-error hover:bg-error-container transition-colors"
                    title="Delete"
                    data-code="${escapeAttribute(url.shortCode)}"
                >

                    <span
                        class="material-symbols-outlined text-[18px]"
                    >
                        delete
                    </span>

                </button>

            </div>

        </td>

    `;


    container.appendChild(row);
}


// ======================================================
// CREATE MOBILE CARD
// ======================================================

function createMobileCard(url, container) {

    if (!container) {
        return;
    }

    const shortUrl =
        `${API_BASE_URL}/${url.shortCode}`;

    const clicks =
        Number(url.clicks || 0);

    const createdDate =
        formatDate(url.createdAt);

    const status =
        getStatus(url);


    const card =
        document.createElement("div");

    card.className =
        "p-md hover:bg-surface-container-low transition-colors";


    card.innerHTML = `

        <div
            class="flex justify-between items-start mb-sm"
        >

            <div
                class="flex flex-col gap-xs min-w-0"
            >

                <div
                    class="flex items-center gap-sm"
                >

                    <span
                        class="text-primary font-code text-code font-medium truncate"
                        title="${escapeAttribute(shortUrl)}"
                    >
                        ${escapeHtml(shortUrl)}
                    </span>

                    <button
                        type="button"
                        class="copy-url-btn text-outline hover:text-primary"
                        title="Copy"
                        data-url="${escapeAttribute(shortUrl)}"
                    >

                        <span
                            class="material-symbols-outlined text-[16px]"
                        >
                            content_copy
                        </span>

                    </button>

                </div>


                <span
                    class="text-on-surface-variant font-body-sm text-body-sm truncate max-w-[250px]"
                    title="${escapeAttribute(url.longUrl || "")}"
                >
                    ${escapeHtml(
                        truncateUrl(url.longUrl || "")
                    )}
                </span>

            </div>


            ${createStatusBadge(status)}

        </div>


        <div
            class="flex justify-between items-end mt-md"
        >

            <div
                class="flex flex-col gap-xs"
            >

                <span
                    class="font-label-sm text-label-sm text-on-surface-variant"
                >
                    Clicks:
                    <span class="text-on-surface font-medium">
                        ${clicks.toLocaleString()}
                    </span>
                </span>


                <span
                    class="font-label-sm text-label-sm text-on-surface-variant"
                >
                    Created:
                    ${createdDate}
                </span>

            </div>


            <div
                class="flex gap-sm"
            >

                <!-- QR -->
                <button
                    type="button"
                    class="qr-btn p-2 rounded-full bg-surface-variant text-on-surface-variant"
                    title="QR Code"
                    data-url="${escapeAttribute(shortUrl)}"
                    data-code="${escapeAttribute(url.shortCode)}"
                >

                    <span
                        class="material-symbols-outlined text-[18px]"
                    >
                        qr_code
                    </span>

                </button>


                <!-- Analytics -->
                <button
                    type="button"
                    class="analytics-btn p-2 rounded-full bg-surface-variant text-on-surface-variant"
                    title="Analytics"
                    data-code="${escapeAttribute(url.shortCode)}"
                >

                    <span
                        class="material-symbols-outlined text-[18px]"
                    >
                        bar_chart
                    </span>

                </button>


                <!-- Delete -->
                <button
                    type="button"
                    class="delete-btn p-2 rounded-full bg-error-container text-on-error-container"
                    title="Delete"
                    data-code="${escapeAttribute(url.shortCode)}"
                >

                    <span
                        class="material-symbols-outlined text-[18px]"
                    >
                        delete
                    </span>

                </button>

            </div>

        </div>

    `;


    container.appendChild(card);
}


// ======================================================
// STATUS
// ======================================================

function getStatus(url) {

    if (!url.expiresAt) {
        return "Active";
    }

    const expiry = new Date(url.expiresAt);
    const now = new Date();

    console.log("Checking expiration:", {
        shortCode: url.shortCode,
        expiresAt: url.expiresAt,
        expiry: expiry,
        now: now,
        expired: expiry <= now
    });

    if (!isNaN(expiry.getTime()) && expiry <= now) {
        return "Expired";
    }

    return "Active";
}


function createStatusBadge(status) {

    if (status === "Expired") {

        return `
            <span
                class="inline-flex items-center px-2 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm"
            >
                Expired
            </span>
        `;
    }

    return `
        <span
            class="inline-flex items-center px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm"
        >
            Active
        </span>
    `;
}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ======================================================
// TRUNCATE LONG URL
// ======================================================

function truncateUrl(url) {

    if (!url) {
        return "-";
    }

    if (url.length <= 45) {
        return url;
    }

    return url.substring(0, 45) + "...";
}


// ======================================================
// COPY URL
// ======================================================

async function copyUrl(shortUrl) {

    try {

        await navigator.clipboard.writeText(
            shortUrl
        );

        alert("Short URL copied!");

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );

        /*
         * Fallback for browsers that don't allow
         * navigator.clipboard.
         */

        const input =
            document.createElement("input");

        input.value = shortUrl;

        document.body.appendChild(input);

        input.select();

        document.execCommand("copy");

        input.remove();

        alert("Short URL copied!");
    }
}


// ======================================================
// QR CODE
// ======================================================

function showQRCode(shortUrl, shortCode) {

    /*
     * QRServer generates the QR image.
     * We encode the URL so the QR contains the
     * actual short URL.
     */

    const qrUrl =
        "https://api.qrserver.com/v1/create-qr-code/" +
        `?size=250x250&data=${encodeURIComponent(shortUrl)}`;


    const existingModal =
        document.getElementById("qrModal");

    if (existingModal) {
        existingModal.remove();
    }


    const modal =
        document.createElement("div");

    modal.id =
        "qrModal";

    modal.className =
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4";


    modal.innerHTML = `

        <div
            class="bg-surface-container-lowest rounded-xl shadow-xl p-lg max-w-sm w-full text-center"
        >

            <div
                class="flex justify-between items-center mb-md"
            >

                <h2
                    class="font-headline-md text-headline-md font-semibold text-on-surface"
                >
                    QR Code
                </h2>

                <button
                    type="button"
                    id="closeQrModal"
                    class="text-on-surface-variant hover:text-primary"
                >

                    <span
                        class="material-symbols-outlined"
                    >
                        close
                    </span>

                </button>

            </div>


            <img
                src="${qrUrl}"
                alt="QR Code for ${escapeAttribute(shortUrl)}"
                class="mx-auto rounded-lg border border-outline-variant"
            />


            <p
                class="mt-md text-sm text-on-surface-variant break-all"
            >
                ${escapeHtml(shortUrl)}
            </p>


            <button
                type="button"
                id="closeQrButton"
                class="mt-md px-md py-sm rounded-lg bg-primary text-on-primary hover:opacity-90"
            >
                Close
            </button>

        </div>

    `;


    document.body.appendChild(modal);


    document
        .getElementById("closeQrModal")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    document
        .getElementById("closeQrButton")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                modal.remove();
            }
        }
    );
}


// ======================================================
// ANALYTICS
// ======================================================

function openAnalytics(shortCode) {

    /*
     * Store the selected URL so Analytics.html can
     * use it later.
     */

    localStorage.setItem(
        "analyticsShortCode",
        shortCode
    );


    /*
     * If you already have Analytics.html,
     * open it with the selected short code.
     */

    window.location.href =
        `Analytics.html?shortCode=${encodeURIComponent(shortCode)}`;
}
// ======================================================
// ANALYTICS PAGE
// ======================================================

async function loadAnalytics() {

    /*
     * Analytics.html should be opened like:
     *
     * Analytics.html?shortCode=aHZkUT
     */

    const params = new URLSearchParams(window.location.search);

    const shortCode = params.get("shortCode") || localStorage.getItem("analyticsShortCode");


    /*
     * If this is not Analytics.html,
     * stop immediately.
     */

    const analyticsPage =
        document.getElementById(
            "analyticsShortUrl"
        );

    if (!analyticsPage) {
        return;
    }


    /*
     * No short code
     */

    if (!shortCode) {

        showAnalyticsError(
            "No short code was provided. Please open Analytics from the My URLs page."
        );

        return;
    }


    try {

        console.log(
            "Loading analytics for:",
            shortCode
        );


        /*
         * Expected endpoint:
         *
         * GET /analytics/{shortCode}
         */

        const idToken = localStorage.getItem("idToken");

if (!idToken) {
    window.location.href = "Login.html";
    return;
}

const response = await fetch(
    `${ANALYTICS_API}/${shortCode}`,
    {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${idToken}`
        }
    }
);

if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
        errorData.message ||
        `HTTP error: ${response.status}`
    );
}



let data =
    await response.json();


        /*
         * Handle Lambda responses where
         * API Gateway returns:
         *
         * {
         *     body: "..."
         * }
         */

        if (
            data.body &&
            typeof data.body === "string"
        ) {

            data =
                JSON.parse(data.body);
        }


        /*
         * Handle:
         *
         * {
         *     data: {...}
         * }
         */

        if (
            data.data &&
            typeof data.data === "object"
        ) {

            data =
                data.data;
        }


        console.log(
            "Analytics received:",
            data
        );


        /*
         * Save globally so chart and buttons
         * can use it.
         */

        window.analyticsData =
            data;


        /*
         * Update page
         */

        updateAnalyticsPage(data);

        updateAnalyticsSummary(data);

        renderAnalyticsChart();

        renderAnalyticsLocations(data);


    } catch (error) {

        console.error(
            "Error loading analytics:",
            error
        );

        showAnalyticsError(
            "Unable to load analytics. Please check the Analytics API."
        );
    }
}


// ======================================================
// UPDATE ANALYTICS PAGE
// ======================================================

function updateAnalyticsPage(data) {

    const shortUrlElement =
        document.getElementById(
            "analyticsShortUrl"
        );

    const longUrlElement =
        document.getElementById(
            "analyticsLongUrl"
        );

    const totalClicksElement =
        document.getElementById(
            "totalClicks"
        );

    const creationDateElement =
        document.getElementById(
            "creationDate"
        );

    const lastAccessedElement =
        document.getElementById(
            "lastAccessed"
        );

    const expirationDateElement =
        document.getElementById(
            "expirationDate"
        );

    const urlAgeElement =
        document.getElementById(
            "urlAge"
        );


    /*
     * SHORT URL
     */

    const shortUrl =
        data.shortUrl ||
        `${API_BASE_URL}/${data.shortCode}`;


    if (shortUrlElement) {

        shortUrlElement.classList.remove(
            "loading"
        );

        shortUrlElement.textContent =
            shortUrl;
    }


    /*
     * LONG URL
     */

    if (longUrlElement) {

        longUrlElement.textContent =
            data.longUrl || "-";

        longUrlElement.href =
            data.longUrl || "#";
    }


    /*
     * TOTAL CLICKS
     */

    if (totalClicksElement) {

        const clicks =
            Number(
                data.totalClicks ??
                data.clicks ??
                0
            );

        totalClicksElement.textContent =
            clicks.toLocaleString();
    }


    /*
     * CREATION DATE
     */

    if (creationDateElement) {

        creationDateElement.textContent =
            formatAnalyticsDate(
                data.createdAt
            );
    }


    /*
     * LAST ACCESSED
     */

    if (lastAccessedElement) {

        lastAccessedElement.textContent =
            formatRelativeTime(
                data.lastAccessed
            );
    }


    /*
     * EXPIRATION DATE
     */

    if (expirationDateElement) {

        expirationDateElement.textContent =
            data.expiresAt
                ? formatAnalyticsDate(
                    data.expiresAt
                )
                : "Never";
    }


    /*
     * URL AGE
     */

    if (urlAgeElement) {

    const age =
        Number(
            data.urlAgeDays ?? 0
        );

    urlAgeElement.textContent =
        age === 0
            ? "Less than 1 Day"
            : `${age} Days`;
}


    /*
     * STATUS
     */

    updateAnalyticsStatus(data);
}


// ======================================================
// ANALYTICS STATUS
// ======================================================

function updateAnalyticsStatus(data) {

    const statusBadge =
        document.getElementById(
            "statusBadge"
        );

    if (!statusBadge) {
        return;
    }


    let expired = false;


    if (data.expired === true) {

        expired = true;

    } else if (data.expiresAt) {

        const expiration =
            new Date(data.expiresAt);

        if (
            !isNaN(expiration.getTime()) &&
            expiration <= new Date()
        ) {

            expired = true;
        }
    }


    if (expired) {

        statusBadge.textContent =
            "Expired";

        statusBadge.className =
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700";

    } else {

        statusBadge.textContent =
            "Active";

        statusBadge.className =
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container";
    }
}


// ======================================================
// ANALYTICS SUMMARY
// ======================================================

function updateAnalyticsSummary(data) {

    const avgElement =
        document.getElementById(
            "avgClicksPerDay"
        );

    const highestDayElement =
        document.getElementById(
            "highestDay"
        );

    const highestClicksElement =
        document.getElementById(
            "highestDayClicks"
        );


    /*
     * Total clicks
     */

    const clicks =
        Number(
            data.totalClicks ??
            data.clicks ??
            0
        );


    /*
     * Calculate URL age
     */

    let ageDays = 1;


    if (data.createdAt) {

        const created =
            new Date(data.createdAt);

        const now =
            new Date();

        if (!isNaN(created.getTime())) {

            ageDays =
                Math.max(
                    1,
                    Math.ceil(
                        (
                            now - created
                        ) /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                    )
                );
        }
    }


    /*
     * Average clicks per day
     */

    const average =
    Number(
        data.averageClicksPerDay ?? 0
    );


    if (avgElement) {

        avgElement.textContent =
            average.toFixed(1);
    }


    /*
     * Highest day
     */

    const history =
        getAnalyticsClickHistory(data);


    if (
        !history ||
        history.length === 0
    ) {

        if (highestDayElement) {

            highestDayElement.textContent =
                "No data";
        }

        if (highestClicksElement) {

            highestClicksElement.textContent =
                "0 clicks";
        }

        return;
    }


    const highest =
        history.reduce(
            function (maximum, current) {

                return current.clicks >
                    maximum.clicks
                    ? current
                    : maximum;

            },
            history[0]
        );


    if (highestDayElement) {

        highestDayElement.textContent =
            formatAnalyticsChartDate(
                highest.date
            );
    }


    if (highestClicksElement) {

        highestClicksElement.textContent =
            `${highest.clicks.toLocaleString()} clicks`;
    }
}


// ======================================================
// GET CLICK HISTORY
// ======================================================

function getAnalyticsClickHistory(data) {

    /*
     * We support these names so that the
     * frontend is flexible with the Lambda response.
     */

    const history =
    data.clickChart ||
    data.dailyClicks ||
    data.clickHistory ||
    data.clicksByDay ||
    [];


    /*
     * Array format
     */

    if (Array.isArray(history)) {

        return history
            .map(function (item) {

                return {

                    date:
                        item.date ||
                        item.day ||
                        item.createdAt,

                    clicks:
                        Number(
                            item.clicks ??
                            item.count ??
                            0
                        )

                };

            })
            .filter(function (item) {

                return item.date;

            });
    }


    /*
     * Object format
     *
     * Example:
     *
     * {
     *     "2026-08-18": 4,
     *     "2026-08-19": 7
     * }
     */

    if (
        typeof history === "object" &&
        history !== null
    ) {

        return Object.entries(history)
            .map(function ([date, clicks]) {

                return {

                    date: date,

                    clicks:
                        Number(
                            clicks || 0
                        )

                };

            });
    }


    return [];
}


// ======================================================
// ANALYTICS CHART
// ======================================================

function renderAnalyticsChart() {

    const chartBars =
        document.getElementById(
            "chartBars"
        );

    const chartMax =
        document.getElementById(
            "chartMax"
        );

    const chartRange =
        document.getElementById(
            "chartRange"
        );


    if (!chartBars) {
        return;
    }


    chartBars.innerHTML = "";


    const data =
        window.analyticsData;


    if (!data) {
        return;
    }


    let history =
        getAnalyticsClickHistory(data);


    /*
     * Filter according to selected range.
     */

    const selectedRange =
        chartRange
            ? chartRange.value
            : "7";


    if (selectedRange !== "all") {

        const days =
            Number(selectedRange);

        const cutoff =
            new Date();

        cutoff.setHours(
            0,
            0,
            0,
            0
        );

        cutoff.setDate(
            cutoff.getDate() -
            days +
            1
        );


        history =
            history.filter(function (item) {

                const date =
                    new Date(item.date);

                return (
                    !isNaN(date.getTime()) &&
                    date >= cutoff
                );

            });
    }


    /*
     * Sort oldest → newest
     */

    history.sort(function (a, b) {

        return (
            new Date(a.date) -
            new Date(b.date)
        );

    });


    /*
     * No data
     */

    if (history.length === 0) {

        chartBars.innerHTML = `
            <div class="w-full h-full flex items-center justify-center text-sm text-on-surface-variant">
                No click history available yet.
            </div>
        `;

        if (chartMax) {
            chartMax.textContent = "0";
        }

        return;
    }


    /*
     * Maximum clicks
     */

    const maxClicks =
        Math.max(
            ...history.map(
                item => item.clicks
            ),
            1
        );


    if (chartMax) {

        chartMax.textContent =
            maxClicks.toLocaleString();
    }


    /*
     * Create bars
     */

    history.forEach(function (item) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "flex-1 flex flex-col items-center justify-end h-full relative";


        const bar =
            document.createElement("div");

        bar.className =
            "chart-bar w-full max-w-[40px] bg-primary-fixed hover:bg-primary rounded-t-sm";


        const percentage =
            Math.max(
                2,
                (
                    item.clicks /
                    maxClicks
                ) * 100
            );


        bar.style.height =
            `${percentage}%`;


        bar.title =
            `${formatAnalyticsChartDate(item.date)}: ${item.clicks} clicks`;


        const label =
            document.createElement("span");

        label.className =
            "absolute -bottom-6 text-[10px] md:text-xs text-on-surface-variant whitespace-nowrap";


        label.textContent =
            formatAnalyticsChartDate(
                item.date
            );


        wrapper.appendChild(bar);

        wrapper.appendChild(label);

        chartBars.appendChild(wrapper);

    });
}


// ======================================================
// CHART RANGE CHANGE
// ======================================================

const analyticsChartRange =
    document.getElementById(
        "chartRange"
    );


if (analyticsChartRange) {

    analyticsChartRange.addEventListener(
        "change",
        function () {

            renderAnalyticsChart();

        }
    );
}


// ======================================================
// ANALYTICS LOCATIONS
// ======================================================

function renderAnalyticsLocations(data) {

    const container =
        document.getElementById(
            "locationsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const locations =
        data.topLocations ||
        data.locations ||
        [];


    if (
        !Array.isArray(locations) ||
        locations.length === 0
    ) {

        container.innerHTML = `
            <div class="flex justify-between items-center bg-surface-container-low p-3 rounded-lg">

                <span class="text-sm">
                    No location data available
                </span>

                <span class="text-sm font-semibold">
                    -
                </span>

            </div>
        `;

        return;
    }


    locations
        .slice(0, 5)
        .forEach(function (location) {

            const name =
                location.country ||
                location.location ||
                location.name ||
                "Unknown";


            const percentage =
                location.percentage ??
                location.percent ??
                0;


            const row =
                document.createElement("div");


            row.className =
                "flex justify-between items-center bg-surface-container-low p-3 rounded-lg";


            row.innerHTML = `

                <span class="text-sm">
                    ${escapeHtml(name)}
                </span>

                <span class="text-sm font-semibold">
                    ${Number(percentage).toFixed(1)}%
                </span>

            `;


            container.appendChild(row);

        });
}


// ======================================================
// ANALYTICS DATE
// ======================================================

function formatAnalyticsDate(dateValue) {

    if (!dateValue) {
        return "Never";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ======================================================
// ANALYTICS RELATIVE TIME
// ======================================================

function formatRelativeTime(dateValue) {

    if (!dateValue) {
        return "Never";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    const now =
        new Date();


    const seconds =
        Math.floor(
            (
                now - date
            ) / 1000
        );


    if (seconds < 60) {
        return "Just now";
    }


    if (seconds < 3600) {

        return (
            Math.floor(
                seconds / 60
            ) +
            " mins ago"
        );
    }


    if (seconds < 86400) {

        return (
            Math.floor(
                seconds / 3600
            ) +
            " hours ago"
        );
    }


    if (seconds < 604800) {

        return (
            Math.floor(
                seconds / 86400
            ) +
            " days ago"
        );
    }


    return formatAnalyticsDate(
        dateValue
    );
}


// ======================================================
// URL AGE
// ======================================================

function calculateAnalyticsUrlAge(
    createdAt
) {

    if (!createdAt) {
        return "0 Days";
    }


    const created =
        new Date(createdAt);

    const now =
        new Date();


    if (isNaN(created.getTime())) {
        return "0 Days";
    }


    const days =
        Math.max(
            0,
            Math.floor(
                (
                    now - created
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            )
        );


    if (days === 0) {
        return "Less than 1 Day";
    }


    return (
        days +
        (
            days === 1
                ? " Day"
                : " Days"
        )
    );
}


// ======================================================
// CHART DATE
// ======================================================

function formatAnalyticsChartDate(
    dateValue
) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short"
        }
    );
}


// ======================================================
// ANALYTICS ERROR
// ======================================================

function showAnalyticsError(
    message
) {

    const errorMessage =
        document.getElementById(
            "errorMessage"
        );
    const errorText =
        document.getElementById(
            "errorText"
        );
    if (errorText) {
        errorText.textContent =
            message;
    }
    if (errorMessage) {
        errorMessage.classList.remove(
            "hidden"
        );
    }
}
// ======================================================
// DELETE
// ======================================================
async function deleteUrl(shortCode) {
    const confirmed = confirm(
        `Are you sure you want to delete ${shortCode}?`
    );
    if (!confirmed) {
        return;
    }
    try {
        const idToken = localStorage.getItem("idToken");

if (!idToken) {
    window.location.href = "Login.html";
    return;
}

const response = await fetch(`${DELETE_API}/${shortCode}`, {
    method: "DELETE",
    headers: {
        "Authorization": `Bearer ${idToken}`
    }
});

if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to delete URL");
}
        const data = await response.json();
        console.log("Delete successful:", data);
        alert("URL deleted successfully!");
        // Reload the My URLs table
        await loadMyUrls();
    } catch (error) {

        console.error(
            "Error deleting URL:",
            error
        );

        alert(
            "Something went wrong while deleting the URL."
        );
    }
}


// ======================================================
// BUTTON EVENT HANDLING
// ======================================================

document.addEventListener(
    "click",
    async function (event) {

        /*
         * COPY
         */

        const copyButton =
            event.target.closest(".copy-url-btn");

        if (copyButton) {

            const url =
                copyButton.dataset.url;

            if (url) {
                await copyUrl(url);
            }

            return;
        }


        /*
         * QR CODE
         */

        const qrButton =
            event.target.closest(".qr-btn");

        if (qrButton) {

            const url =
                qrButton.dataset.url;

            const code =
                qrButton.dataset.code;

            if (url) {

                showQRCode(
                    url,
                    code
                );
            }

            return;
        }


        /*
         * ANALYTICS
         */

        const analyticsButton =
            event.target.closest(".analytics-btn");

        if (analyticsButton) {

            const code =
                analyticsButton.dataset.code;

            if (code) {

                openAnalytics(code);
            }

            return;
        }


        /*
         * DELETE
         */

        const deleteButton =
            event.target.closest(".delete-btn");

        if (deleteButton) {

            const code =
                deleteButton.dataset.code;

            if (code) {

                await deleteUrl(code);
            }

            return;
        }
    }
);


// ======================================================
// UPDATE ENTRY COUNT
// ======================================================

function updateEntryCount(count) {

    /*
     * Finds the existing "Showing 1 to 10 of 42 entries"
     * text in your My URLs page and replaces it.
     */

    const elements =
        document.querySelectorAll(
            "span.font-body-sm"
        );

    elements.forEach(element => {

        const text =
            element.textContent.trim();

        if (
            text.includes("Showing") &&
            text.includes("entries")
        ) {

            element.textContent =
                `Showing 1 to ${count} of ${count} entries`;
        }
    });
}


// ======================================================
// SECURITY HELPERS
// ======================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}


// ======================================================
// LOAD MY URLS
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadMyUrls();

        loadAnalytics();

    }
);


// ======================================================
// AUTO REFRESH
// ======================================================

/*
 * Refresh every 5 seconds.
 *
 * This means the Clicks column will automatically
 * update after somebody uses a shortened URL.
 */

setInterval(
    () => {

        loadMyUrls();

    },
    5000
);