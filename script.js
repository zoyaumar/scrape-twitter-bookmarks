let tweets = []; 

const scrollInterval = 2500; 
const scrollStep = 900; 

let previousTweetCount = 0;
let unchangedCount = 0;
let loadingMore = true; 

const scrollToEndIntervalID = setInterval(() => {
    if (loadingMore) {
        window.scrollBy(0, scrollStep);
        setTimeout(() => { // Adding a delay after scrolling
            updateTweets(); // Check for new tweets after scrolling
        }, 1000); // Wait a second before checking for new tweets
        
        const currentTweetCount = tweets.length;

        // Stop if we've reached a stable state (no new tweets for a while)
        if (currentTweetCount === previousTweetCount) {
            unchangedCount++;
            if (unchangedCount >= 3) { // Stop if the count has not changed 3 times
                console.log('Scraping complete');
                console.log('Total tweets scraped: ', tweets.length);
                console.log('Downloading tweets as JSON...');
                clearInterval(scrollToEndIntervalID); // Stop scrolling
                observer.disconnect(); // Stop observing DOM changes
                downloadTweetsAsJson(tweets); // Download the tweets list as a JSON file
                loadingMore = false; // Stop loading more tweets
            }
        } else {
            unchangedCount = 0; // Reset counter if new tweets were added
        }
        previousTweetCount = currentTweetCount; // Update previous count for the next check
    }
}, scrollInterval);

function updateTweets() {
    const mediaUrls = [];
    document.querySelectorAll('[data-testid="tweet"]').forEach(tweetElement => {
        const mediaElements = tweetElement.querySelectorAll('img[src*="media"], video'); // Select media elements
        mediaElements.forEach(mediaElement => {
            const mediaUrl = mediaElement.src || mediaElement.getAttribute('src'); 
            if (!tweets.includes(mediaUrl)) { // Check if the media URL is not already in the array
                mediaUrls.push(mediaUrl); // Collect new media URLs
            }
        });
    });

    // Add all new media URLs to the array
    tweets.push(...mediaUrls);

    console.log("Media scraped: ", tweets.length);
}

// Initially populate the tweets array
updateTweets();

// Create a MutationObserver to observe changes in the DOM
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            updateTweets(); // Call updateTweets whenever new nodes are added to the DOM
        }
    });
});

// Start observing the document body for child list changes
observer.observe(document.body, { childList: true, subtree: true });

function downloadTweetsAsJson(tweetsArray) {
    const jsonData = JSON.stringify(tweetsArray); // Convert the array to JSON
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tweets.json'; // Specify the file name
    document.body.appendChild(link); // Append the link to the document
    link.click(); // Programmatically click the link to trigger the download
    document.body.removeChild(link); // Clean up and remove the link
}
