document.addEventListener("DOMContentLoaded", function() {
    // Enter key event listener
    document.getElementById("user-input").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

    // Clear session when page is refreshed or loaded
    clearSession();
    
    // Initialize sidebar history
    initializeSidebar();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl + H to toggle sidebar
    if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        toggleSidebar();
    }
});

// Initialize sidebar on page load
function initializeSidebar() {
    // Load initial history if sidebar is visible
    if (!sidebarCollapsed) {
        loadSidebarHistory();
    }
}

// Global variables
let isListening = false;
let currentSpeakingButton = null;
let visualControlsVisible = false;
let sidebarVisible = true;
let sidebarCollapsed = false;
let relatedTopicsSidebarCollapsed = true; // New variable for related topics sidebar
let currentHistoryPage = 1;
let historySearchMode = false;
let historyData = [];
let selectedMessageId = null;
const HISTORY_ITEMS_PER_PAGE = 15; // Reduced for sidebar

// Function to speak response text
function speakResponseText(text, button) {
    // Stop any current speech
    if (currentSpeakingButton && currentSpeakingButton !== button) {
        stopCurrentSpeech();
    }
    
    // Visual feedback
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    button.style.backgroundColor = '#4d61fc';
    button.style.color = 'white';
    currentSpeakingButton = button;
    
    // Send to backend for speech synthesis
    fetch("/text-to-speech", {
        method: "POST",
        body: JSON.stringify({ text: text }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Change button to indicate speaking
            button.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            button.style.backgroundColor = '#28a745';
            
            // Reset button after a delay (estimated speech time)
            const estimatedDuration = Math.max(3000, text.length * 50); // Rough estimate
            setTimeout(() => {
                resetSpeakButton(button);
            }, estimatedDuration);
        } else {
            console.error("Text-to-speech failed:", data.error);
            resetSpeakButton(button);
        }
    })
    .catch(error => {
        console.error("Text-to-speech error:", error);
        resetSpeakButton(button);
    });
}

// Function to reset speak button
function resetSpeakButton(button) {
    if (button) {
        button.disabled = false;
        button.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        button.style.backgroundColor = '';
        button.style.color = '';
        if (currentSpeakingButton === button) {
            currentSpeakingButton = null;
        }
    }
}

// Function to stop current speech
function stopCurrentSpeech() {
    fetch("/stop-speech", { method: "POST" })
    .then(response => response.json())
    .then(data => {
        if (currentSpeakingButton) {
            resetSpeakButton(currentSpeakingButton);
        }
    })
    .catch(error => console.error("Error stopping speech:", error));
}

// Function to clear session on page load/refresh
function clearSession() {
    fetch("/clear-session", {
        method: "POST"
    })
    .then(response => response.json())
    .then(data => {
        console.log("Session cleared:", data.message);
        // Reset RAG status indicator
        updateRagStatus(false);
    })
    .catch(error => {
        console.error("Error clearing session:", error);
    });
}

function displayFileNames(files) {
    const chatBox = document.getElementById("chat-box");
    const fileNameDisplay = document.createElement("div");
    fileNameDisplay.className = "file-name-display";
    
    const fileNames = Array.from(files).map(file => file.name).join(", ");
    fileNameDisplay.innerHTML = `<strong>TUTIX:</strong> Loading documents: ${fileNames}`;
    chatBox.appendChild(fileNameDisplay);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleFileUpload(files) {
    if (!files || files.length === 0) return;

    // Display file names in chat
    displayFileNames(files);

    // Display initializing message
    const chatBox = document.getElementById("chat-box");
    const initializingMessage = document.createElement("div");
    initializingMessage.className = "ai-message";
    initializingMessage.innerHTML = `<strong>TUTIX:</strong> Processing PDFs and generating comprehensive summaries...`;
    chatBox.appendChild(initializingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Show loading indicator
    document.getElementById("loading-indicator").classList.remove("hidden");

    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append('files', file);
    });

    fetch("/initialize-rag", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading indicator
        document.getElementById("loading-indicator").classList.add("hidden");
        
        // Remove the initializing message
        chatBox.removeChild(initializingMessage);
        
        const chatBox2 = document.getElementById("chat-box");
        const ragMessage = document.createElement("div");
        ragMessage.className = "ai-message";

        if (data.success) {
            // Display the comprehensive PDF summary
            let summaryContent = document.createElement("div");
            summaryContent.className = "response-content pdf-summary";
            summaryContent.innerHTML = `<strong>TUTIX:</strong> ${data.summary.replace(/\n/g, '<br>')}`;
            
            // Create speak button for the summary
            let summarySpeakButton = document.createElement("button");
            summarySpeakButton.className = "speak-response-button";
            summarySpeakButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            summarySpeakButton.title = "Click to read this summary aloud";
            
            // Extract text content for speech (remove HTML tags)
            const summaryText = data.summary.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
            
            summarySpeakButton.addEventListener('click', function(e) {
                e.preventDefault();
                speakResponseText(summaryText, summarySpeakButton);
            });
            
            // Create container for summary and button
            let summaryContainer = document.createElement("div");
            summaryContainer.className = "message-container";
            summaryContainer.appendChild(summaryContent);
            summaryContainer.appendChild(summarySpeakButton);
            
            ragMessage.appendChild(summaryContainer);
            
            updateRagStatus(true);
        } else {
            ragMessage.innerHTML = `<strong>TUTIX:</strong> ❌ Failed to process PDFs. ${data.message}`;
            updateRagStatus(false);
        }

        chatBox2.appendChild(ragMessage);
        chatBox2.scrollTop = chatBox2.scrollHeight;
    })
    .catch(error => {
        // Hide loading indicator
        document.getElementById("loading-indicator").classList.add("hidden");
        
        // Remove the initializing message if it exists
        try {
            chatBox.removeChild(initializingMessage);
        } catch(e) {}
        
        console.error("RAG initialization error:", error);
        
        const chatBox3 = document.getElementById("chat-box");
        const errorMessage = document.createElement("div");
        errorMessage.className = "ai-message";
        errorMessage.innerHTML = `<strong>TUTIX:</strong> ❌ Error processing PDFs. Please try again.`;
        chatBox3.appendChild(errorMessage);
        chatBox3.scrollTop = chatBox3.scrollHeight;
        
        updateRagStatus(false);
    });
}

function handleFolderUpload(files) {
    if (!files || files.length === 0) return;

    // Display folder name in chat
    const folderName = files[0].webkitRelativePath.split('/')[0];
    const chatBox = document.getElementById("chat-box");
    const folderNameDisplay = document.createElement("div");
    folderNameDisplay.className = "file-name-display";
    folderNameDisplay.innerHTML = `<strong>TUTIX:</strong> Loading documents from folder: ${folderName}`;
    chatBox.appendChild(folderNameDisplay);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Display initializing message
    const initializingMessage = document.createElement("div");
    initializingMessage.className = "ai-message";
    initializingMessage.innerHTML = `<strong>TUTIX:</strong> Initializing RAG system with folder documents...`;
    chatBox.appendChild(initializingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Show loading indicator
    document.getElementById("loading-indicator").classList.remove("hidden");

    // Get the first file's webkitRelativePath to extract the folder
    const folderPath = files[0].webkitRelativePath.split('/')[0];

    const formData = new FormData();
    formData.append('folder', folderPath);

    fetch("/initialize-rag", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading indicator
        document.getElementById("loading-indicator").classList.add("hidden");
        
        const ragMessage = document.createElement("div");
        ragMessage.className = "ai-message";

        if (data.success) {
            ragMessage.innerHTML = `<strong>TUTIX:</strong> ✅ RAG initialized successfully with folder documents! You can now ask questions about the uploaded documents.`;
            updateRagStatus(true);
        } else {
            ragMessage.innerHTML = `<strong>TUTIX:</strong> ❌ Failed to initialize RAG. Falling back to standard response generation.`;
            updateRagStatus(false);
        }

        chatBox.appendChild(ragMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => {
        // Hide loading indicator
        document.getElementById("loading-indicator").classList.add("hidden");
        
        console.error("RAG initialization error:", error);
        
        const errorMessage = document.createElement("div");
        errorMessage.className = "ai-message";
        errorMessage.innerHTML = `<strong>TUTIX:</strong> ❌ Error initializing RAG. Falling back to standard response generation.`;
        chatBox.appendChild(errorMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        updateRagStatus(false);
    });
}

function updateRagStatus(isActive) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (isActive) {
        statusDot.classList.remove('inactive');
        statusDot.classList.add('active');
        statusText.textContent = 'PDFs loaded - RAG enabled';
    } else {
        statusDot.classList.remove('active');
        statusDot.classList.add('inactive');
        statusText.textContent = 'No PDFs loaded';
    }
}

// Function to create or update the thinking state
function setAIMessageToThinking(messageElement) {
    // Add the thinking class
    messageElement.classList.add('thinking');
    
    // Check if dots already exist
    let dotsContainer = messageElement.querySelector('.thinking-dots');
    
    // If not, create them
    if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'thinking-dots';
        
        // Create 3 dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'thinking-dot';
            dotsContainer.appendChild(dot);
        }
        
        // Add "TUTIX:" label
        const label = document.createElement('strong');
        label.textContent = 'TUTIX:';
        messageElement.appendChild(label);
        messageElement.appendChild(dotsContainer);
    }
}

function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;

    let chatBox = document.getElementById("chat-box");

    // Display user message (Right-aligned)
    let userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.innerHTML = `<strong>You:</strong> ${userInput}`;
    chatBox.appendChild(userMessage);

    // Create and show thinking message with animated dots (Left-aligned)
    let thinkingMessage = document.createElement("div");
    thinkingMessage.className = "ai-message";
    setAIMessageToThinking(thinkingMessage);
    chatBox.appendChild(thinkingMessage);

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom

    // Clear input field
    document.getElementById("user-input").value = "";

    // Set a timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Send user query to backend
    fetch("/ask", {
        method: "POST",
        body: JSON.stringify({ query: userInput }),
        headers: { "Content-Type": "application/json" },
        signal: controller.signal
    })
    .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Remove thinking message
        if (thinkingMessage && thinkingMessage.parentNode) {
            chatBox.removeChild(thinkingMessage);
        }

        // Display AI response (Left-aligned)
        let aiMessage = document.createElement("div");
        aiMessage.className = "ai-message";
        
        // Create response content container
        let responseContent = document.createElement("div");
        responseContent.className = "response-content";
        responseContent.innerHTML = `<strong>TUTIX:</strong> ${data.response}`;
        
        // Create speak button
        let speakButton = document.createElement("button");
        speakButton.className = "speak-response-button";
        speakButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        speakButton.title = "Click to read this response aloud";
        
        // Extract text content for speech (remove HTML tags)
        const responseText = data.response.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        
        speakButton.addEventListener('click', function(e) {
            e.preventDefault();
            speakResponseText(responseText, speakButton);
        });
        
        // Create container for response and button
        let messageContainer = document.createElement("div");
        messageContainer.className = "message-container";
        messageContainer.appendChild(responseContent);
        messageContainer.appendChild(speakButton);
        
        aiMessage.appendChild(messageContainer);
        chatBox.appendChild(aiMessage);
        
        // Display YouTube recommendations if available
        if (data.youtube_recommendations) {
            let youtubeContainer = document.createElement("div");
            youtubeContainer.className = "youtube-recommendations-container";
            youtubeContainer.innerHTML = data.youtube_recommendations;
            chatBox.appendChild(youtubeContainer);
        }
        
        // Display visual content if available
        if (data.has_visual && data.visual_content) {
            displayVisualContent(data.visual_content, data.visual_types || []);
        }
        
        // Show visual suggestion if visual was requested but not generated
        if (data.visual_types && data.visual_types.length > 0 && !data.has_visual) {
            showVisualSuggestion(data.visual_types, userInput);
        }

        if (data.hasScraping && data.scraped) {
            let scrapedInfo = document.createElement("div");
            scrapedInfo.className = "scraped-info";
            scrapedInfo.innerHTML = `<details>
                <summary>📚 View scraped information</summary>
                <div class="scraped-content">${data.scraped}</div>
            </details>`;
            chatBox.appendChild(scrapedInfo);
        }
        // If there was retrieval info and we want to show it
        if (data.hasRetrieval && data.retrieved) {
            let retrievalInfo = document.createElement("div");
            retrievalInfo.className = "retrieval-info";
            retrievalInfo.innerHTML = `<details>
                <summary>📚 View retrieved information</summary>
                <div class="retrieved-content">${data.retrieved}</div>
            </details>`;
            chatBox.appendChild(retrievalInfo);
        }
        
        // Get related topics for the user's query
        getRelatedTopics(userInput);
        
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
    })
    .catch(error => {
        clearTimeout(timeoutId);
        console.error("Error sending message:", error);
        
        // Remove thinking message safely
        try {
            if (thinkingMessage && thinkingMessage.parentNode) {
                chatBox.removeChild(thinkingMessage);
            }
        } catch (e) {
            console.warn("Could not remove thinking message:", e);
        }
        
        // Display error message
        let errorMessage = document.createElement("div");
        errorMessage.className = "ai-message error";
        
        let errorText;
        if (error.name === 'AbortError') {
            errorText = 'Sorry, the request timed out. Please try asking a simpler question or try again.';
        } else {
            errorText = `Sorry, I encountered an error processing your request. Please try again. (${error.message})`;
        }
        
        // Create response content container for error
        let errorContent = document.createElement("div");
        errorContent.className = "response-content";
        errorContent.innerHTML = `<strong>TUTIX:</strong> ${errorText}`;
        
        // Create speak button for error message
        let errorSpeakButton = document.createElement("button");
        errorSpeakButton.className = "speak-response-button";
        errorSpeakButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        errorSpeakButton.title = "Click to read this message aloud";
        
        errorSpeakButton.addEventListener('click', function(e) {
            e.preventDefault();
            speakResponseText(errorText, errorSpeakButton);
        });
        
        // Create container for error and button
        let errorContainer = document.createElement("div");
        errorContainer.className = "message-container";
        errorContainer.appendChild(errorContent);
        errorContainer.appendChild(errorSpeakButton);
        
        errorMessage.appendChild(errorContainer);
        chatBox.appendChild(errorMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    document.getElementById("user-input").value = ""; // Clear input field
}

function toggleVoiceInput() {
    if (isListening) {
        stopListening();
    } else {
        startVoiceInput();
    }
}

function startVoiceInput() {
    let popup = document.getElementById("listening-popup");
    let micButton = document.querySelector(".mic-button");

    // Toggle listening state
    if (isListening) {
        // If already listening, stop it
        stopListening();
        
        // Call backend to stop listening process
        fetch("/stop-listening", { method: "POST" })
        .then(() => console.log("Speech recognition stopped by user"));
        
        return;
    }
    
    // Start listening
    isListening = true;
    micButton.classList.add("active");
    popup.classList.remove("hidden");
    
    // Show the listening popup with waves
    document.getElementById("listening-text").textContent = "Listening...";
    
    fetch("/speech-to-text", { method: "POST" })
    .then(response => response.json())
    .then(data => {
        // Stop listening state
        stopListening();
        
        // Update input field with recognized text
        document.getElementById("user-input").value = data.query;
        
        // If we got valid text, send the message
        if (data.query && data.query.trim() !== "") {
            sendMessage();
        }
    })
    .catch(error => {
        console.error("Speech recognition error:", error);
        stopListening();
    });
}

function stopListening() {
    let popup = document.getElementById("listening-popup");
    let micButton = document.querySelector(".mic-button");
    
    isListening = false;
    micButton.classList.remove("active");
    popup.classList.add("hidden");
}

function stopSpeech() {
    // Visual feedback that the button was clicked
    const stopButton = document.querySelector('.stop-button');
    const originalContent = stopButton.innerHTML;
    stopButton.disabled = true;
    stopButton.style.backgroundColor = '#ffffff';
    stopButton.innerHTML = '⏱ Stopping...';
    
    // Make multiple attempts to stop the speech
    function attemptStopSpeech(attempts = 3) {
        fetch("/stop-speech", { 
            method: "POST",
            headers: { "Cache-Control": "no-cache" }  // Prevent caching
        })
        .then(response => response.json())
        .then(data => {
            console.log("Stop speech response:", data);
            
            if (data.success) {
                stopButton.style.backgroundColor = '#ffffff';
                stopButton.innerHTML = '✓ Stopped';
                
                setTimeout(() => {
                    stopButton.disabled = false;
                    stopButton.style.backgroundColor = '#ffffff';
                    stopButton.innerHTML = originalContent;
                }, 500);
            } 
            else if (attempts > 1) {
                // Try again
                console.log(`Speech stop attempt failed, trying again. ${attempts-1} attempts remaining`);
                setTimeout(() => attemptStopSpeech(attempts - 1), 500);
            }
            else {
                console.warn("Failed to stop speech after multiple attempts");
                stopButton.disabled = false;
                stopButton.style.backgroundColor = '#dc3545';
                stopButton.innerHTML = originalContent;
                
                // Last resort: reload the page
                if (confirm("Unable to stop speech. Would you like to reload the page to stop it?")) {
                    window.location.reload();
                }
            }
        })
        .catch(error => {
            console.error("Error stopping speech:", error);
            stopButton.disabled = false;
            stopButton.style.backgroundColor = '#dc3545';
            stopButton.innerHTML = originalContent;
        });
    }
    
    attemptStopSpeech();
}

function handleTextareaInput(event) {
    // Allow for shift+enter to create a new line without submitting
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
    
    // Auto-resize the textarea
    const textarea = event.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 150); // Max height of 150px
    textarea.style.height = newHeight + "px";
}

// Welcome message on page load
window.onload = function() {
    setTimeout(() => {
        const chatBox = document.getElementById("chat-box");
        const welcomeMessage = document.createElement("div");
        welcomeMessage.className = "ai-message";
        const welcomeText = "Hello! I'm TUTIX your AI Tutor. You can ask me questions directly, or upload PDF documents using the buttons below to get document-specific answers. How can I help you today?";
        
        // Create response content container
        let welcomeContent = document.createElement("div");
        welcomeContent.className = "response-content";
        welcomeContent.innerHTML = `<strong>TUTIX:</strong> ${welcomeText}`;
        
        // Create speak button for welcome message
        let welcomeSpeakButton = document.createElement("button");
        welcomeSpeakButton.className = "speak-response-button";
        welcomeSpeakButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        welcomeSpeakButton.title = "Click to read this message aloud";
        
        welcomeSpeakButton.addEventListener('click', function(e) {
            e.preventDefault();
            speakResponseText(welcomeText, welcomeSpeakButton);
        });
        
        // Create container for welcome and button
        let welcomeContainer = document.createElement("div");
        welcomeContainer.className = "message-container";
        welcomeContainer.appendChild(welcomeContent);
        welcomeContainer.appendChild(welcomeSpeakButton);
        
        welcomeMessage.appendChild(welcomeContainer);
        chatBox.appendChild(welcomeMessage);
        
        // Auto-speak welcome message (optional - remove if not wanted)
        // speakResponseText(welcomeText, welcomeSpeakButton);
    }, 500);
}

// Visual content functions
function toggleVisualControls() {
    const visualControls = document.getElementById('visual-controls');
    const visualButton = document.querySelector('.visual-button');
    
    visualControlsVisible = !visualControlsVisible;
    
    if (visualControlsVisible) {
        visualControls.classList.remove('hidden');
        visualButton.style.backgroundColor = 'var(--primary)';
        visualButton.style.color = 'var(--on-primary)';
    } else {
        visualControls.classList.add('hidden');
        visualButton.style.backgroundColor = '';
        visualButton.style.color = '';
    }
}

function generateVisual(visualType) {
    const userInput = document.getElementById("user-input").value.trim();
    
    if (!userInput) {
        alert('Please enter a query first before generating visual content.');
        return;
    }
    
    const chatBox = document.getElementById("chat-box");
    
    // Show loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'visual-content';
    loadingMessage.innerHTML = `
        <div class="visual-header">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Generating ${visualType} visual...
        </div>
    `;
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Generate visual content
    fetch('/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: userInput,
            visual_type: visualType
        })
    })
    .then(response => response.json())
    .then(data => {
        // Remove loading message
        chatBox.removeChild(loadingMessage);
        
        if (data.success && data.visual_data) {
            displayVisualContent(data.visual_data, [visualType]);
        } else {
            showVisualError(data.message || 'Failed to generate visual content');
        }
    })
    .catch(error => {
        console.error('Error generating visual:', error);
        chatBox.removeChild(loadingMessage);
        showVisualError('Error generating visual content');
    });
    
    // Hide visual controls after use
    toggleVisualControls();
}

function displayVisualContent(visualData, visualTypes) {
    const chatBox = document.getElementById('chat-box');
    
    const visualContainer = document.createElement('div');
    visualContainer.className = 'visual-content';
    
    const typeText = visualTypes.length > 0 ? visualTypes.join(', ') : 'visual';
    
    visualContainer.innerHTML = `
        <div class="visual-header">
            <i class="fa-solid fa-chart-simple"></i>
            Generated ${typeText} content
        </div>
        <img src="${visualData}" alt="Generated visual content" />
    `;
    
    chatBox.appendChild(visualContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showVisualSuggestion(visualTypes, query) {
    const chatBox = document.getElementById('chat-box');
    
    const suggestion = document.createElement('div');
    suggestion.className = 'visual-suggestion';
    
    const typeText = visualTypes.join(', ');
    
    suggestion.innerHTML = `
        <i class="fa-solid fa-lightbulb"></i>
        <span>I detected you might want ${typeText} content. Would you like me to generate it?</span>
        <button onclick="generateVisualFromSuggestion('${visualTypes[0]}', '${query}')">
            Generate ${visualTypes[0]}
        </button>
    `;
    
    chatBox.appendChild(suggestion);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function generateVisualFromSuggestion(visualType, query) {
    const chatBox = document.getElementById('chat-box');
    
    // Show loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'visual-content';
    loadingMessage.innerHTML = `
        <div class="visual-header">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Generating ${visualType} visual...
        </div>
    `;
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Generate visual content
    fetch('/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: query,
            visual_type: visualType
        })
    })
    .then(response => response.json())
    .then(data => {
        // Remove loading message
        chatBox.removeChild(loadingMessage);
        
        if (data.success && data.visual_data) {
            displayVisualContent(data.visual_data, [visualType]);
        } else {
            showVisualError(data.message || 'Failed to generate visual content');
        }
    })
    .catch(error => {
        console.error('Error generating visual:', error);
        chatBox.removeChild(loadingMessage);
        showVisualError('Error generating visual content');
    });
}

function showVisualError(message) {
    const chatBox = document.getElementById('chat-box');
    
    const errorContainer = document.createElement('div');
    errorContainer.className = 'visual-error';
    errorContainer.innerHTML = `
        <i class="fa-solid fa-exclamation-triangle"></i>
        ${message}
    `;
    
    chatBox.appendChild(errorContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ========================================
// Sidebar Chat History Management Functions
// ========================================

function toggleSidebar() {
    const sidebar = document.getElementById('history-sidebar');
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
    } else {
        sidebar.classList.remove('collapsed');
        if (!historyData.length) {
            loadSidebarHistory();
        }
    }
}

function loadSidebarHistory(page = 1, limit = HISTORY_ITEMS_PER_PAGE) {
    const sidebarMessages = document.getElementById('sidebar-messages');
    
    // Show loading indicator
    sidebarMessages.innerHTML = `
        <div class="loading-sidebar">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Loading...</span>
        </div>
    `;
    
    const offset = (page - 1) * limit;
    
    fetch(`/history?limit=${limit}&offset=${offset}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                historyData = data.history;
                displaySidebarMessages(data.history);
                updateSidebarStats(data.total_messages);
                currentHistoryPage = page;
            } else {
                showSidebarError('Failed to load chat history');
            }
        })
        .catch(error => {
            console.error('Error loading chat history:', error);
            showSidebarError('Error loading chat history');
        });
}

function displaySidebarMessages(messages) {
    const sidebarMessages = document.getElementById('sidebar-messages');
    
    if (messages.length === 0) {
        sidebarMessages.innerHTML = `
            <div class="loading-sidebar">
                <i class="fa-solid fa-comment-slash"></i>
                <span>No history</span>
            </div>
        `;
        return;
    }
    
    sidebarMessages.innerHTML = messages.map((message, index) => `
        <div class="sidebar-message ${message.role} ${selectedMessageId === message.id ? 'active' : ''}" 
             onclick="selectSidebarMessage('${message.id}', ${index})" 
             title="${message.content}">
            <div class="message-preview">
                <span class="message-role-icon">
                    ${message.role === 'user' ? '👤' : '🤖'}
                </span>
                <span class="message-time-sidebar">${formatSidebarTime(message.timestamp)}</span>
            </div>
            <div class="message-content-preview">
                ${truncateMessage(message.content, 80)}
            </div>
            ${message.message_type !== 'text' ? `
                <div class="message-type-indicator">
                    ${message.message_type === 'visual' ? '🎨' : '📄'}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function selectSidebarMessage(messageId, index) {
    selectedMessageId = messageId;
    
    // Update visual selection
    document.querySelectorAll('.sidebar-message').forEach(msg => {
        msg.classList.remove('active');
    });
    
    const selectedElement = document.querySelector(`[onclick="selectSidebarMessage('${messageId}', ${index})"]`);
    if (selectedElement) {
        selectedElement.classList.add('active');
    }
    
    // Optionally scroll to this message in main chat
    // This could highlight or scroll to the corresponding message in the main chat area
}

function formatSidebarTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffHours < 1) {
        return 'Now';
    } else if (diffHours < 24) {
        return `${Math.floor(diffHours)}h`;
    } else if (diffDays < 7) {
        return `${Math.floor(diffDays)}d`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

function updateSidebarStats(totalMessages) {
    const totalElement = document.getElementById('sidebar-total-messages');
    if (totalElement) {
        totalElement.textContent = totalMessages || 0;
    }
}

function handleSidebarSearch(event) {
    if (event.key === 'Enter') {
        performSidebarSearch();
    }
}

function performSidebarSearch() {
    const query = document.getElementById('sidebar-search-input').value.trim();
    
    if (!query) {
        loadSidebarHistory(); // Reset to normal view
        return;
    }
    
    const sidebarMessages = document.getElementById('sidebar-messages');
    
    // Show loading
    sidebarMessages.innerHTML = `
        <div class="loading-sidebar">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Searching...</span>
        </div>
    `;
    
    fetch('/history/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, limit: 30 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySidebarSearchResults(data.results, query);
        } else {
            showSidebarError('Search failed');
        }
    })
    .catch(error => {
        console.error('Error searching history:', error);
        showSidebarError('Search error');
    });
}

function displaySidebarSearchResults(results, query) {
    const sidebarMessages = document.getElementById('sidebar-messages');
    
    if (results.length === 0) {
        sidebarMessages.innerHTML = `
            <div class="loading-sidebar">
                <i class="fa-solid fa-search"></i>
                <span>No results for "${query}"</span>
            </div>
        `;
        return;
    }
    
    const resultsHtml = results.map((message, index) => `
        <div class="sidebar-message ${message.role}" 
             onclick="selectSidebarMessage('${message.id}', ${index})" 
             title="${message.content}">
            <div class="message-preview">
                <span class="message-role-icon">
                    ${message.role === 'user' ? '👤' : '🤖'}
                </span>
                <span class="message-time-sidebar">${formatSidebarTime(message.timestamp)}</span>
            </div>
            <div class="message-content-preview">
                ${highlightSearchTerm(truncateMessage(message.content, 80), query)}
            </div>
        </div>
    `).join('');
    
    sidebarMessages.innerHTML = resultsHtml;
    historyData = results;
}

function exportSidebarHistory() {
    fetch('/history/export')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Create download link
                const blob = new Blob([JSON.stringify(data.history, null, 2)], {
                    type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat_history_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                showSidebarError('Export failed');
            }
        })
        .catch(error => {
            console.error('Error exporting history:', error);
            showSidebarError('Export error');
        });
}

function clearSidebarHistory() {
    if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
        fetch('/history/clear', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    historyData = [];
                    loadSidebarHistory(); // Refresh the sidebar
                    updateSidebarStats(0);
                } else {
                    showSidebarError('Clear failed');
                }
            })
            .catch(error => {
                console.error('Error clearing history:', error);
                showSidebarError('Clear error');
            });
    }
}

function showSidebarError(message) {
    const sidebarMessages = document.getElementById('sidebar-messages');
    sidebarMessages.innerHTML = `
        <div class="loading-sidebar error">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
}

function truncateMessage(content, maxLength) {
    if (content.length <= maxLength) {
        return content;
    }
    return content.substring(0, maxLength) + '...';
}

function highlightSearchTerm(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function exportSidebarHistory() {
    fetch('/history/export')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const exportData = data.export_data;
                const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                    type: 'application/json'
                });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat_history_${exportData.session_id}_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showSidebarSuccess('History exported!');
            } else {
                showSidebarError('Export failed');
            }
        })
        .catch(error => {
            console.error('Error exporting history:', error);
            showSidebarError('Export error');
        });
}

function clearSidebarHistory() {
    if (confirm('Clear all chat history? This cannot be undone.')) {
        fetch('/history/clear', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSidebarSuccess('History cleared!');
                loadSidebarHistory(); // Refresh
            } else {
                showSidebarError('Clear failed');
            }
        })
        .catch(error => {
            console.error('Error clearing history:', error);
            showSidebarError('Clear error');
        });
    }
}

function showSidebarError(message) {
    const sidebarMessages = document.getElementById('sidebar-messages');
    sidebarMessages.innerHTML = `
        <div class="loading-sidebar" style="color: var(--error);">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
}

function showSidebarSuccess(message) {
    const sidebarMessages = document.getElementById('sidebar-messages');
    const currentContent = sidebarMessages.innerHTML;
    
    sidebarMessages.innerHTML = `
        <div class="loading-sidebar" style="color: #4caf50; background: #e8f5e9; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
            <i class="fa-solid fa-check"></i>
            <span>${message}</span>
        </div>
        ${currentContent}
    `;
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        loadSidebarHistory();
    }, 2000);
}

function loadChatHistory(page = 1, limit = HISTORY_ITEMS_PER_PAGE) {
    const historyMessages = document.getElementById('history-messages');
    
    // Show loading indicator
    historyMessages.innerHTML = `
        <div class="loading-history">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Loading chat history...</span>
        </div>
    `;
    
    const offset = (page - 1) * limit;
    
    fetch(`/history?limit=${limit}&offset=${offset}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                historyData = data.history;
                displayHistoryMessages(data.history);
                updatePagination(page, data.total_messages, limit);
                currentHistoryPage = page;
            } else {
                showHistoryError('Failed to load chat history');
            }
        })
        .catch(error => {
            console.error('Error loading chat history:', error);
            showHistoryError('Error loading chat history');
        });
}

function displayHistoryMessages(messages) {
    const historyMessages = document.getElementById('history-messages');
    
    if (messages.length === 0) {
        historyMessages.innerHTML = `
            <div class="loading-history">
                <i class="fa-solid fa-comment-slash"></i>
                <span>No chat history found</span>
            </div>
        `;
        return;
    }
    
    historyMessages.innerHTML = messages.map(message => `
        <div class="history-message ${message.role}" onclick="expandMessage(this)">
            <div class="message-header">
                <span class="message-role">
                    ${message.role === 'user' ? '👤' : '🤖'} ${message.role}
                </span>
                <span class="message-time">${message.formatted_time}</span>
            </div>
            <div class="message-content">
                ${truncateMessage(message.content, 150)}
            </div>
            ${message.message_type !== 'text' ? `<span class="message-type ${message.message_type}">${message.message_type}</span>` : ''}
        </div>
    `).join('');
}

function truncateMessage(content, maxLength) {
    if (content.length <= maxLength) {
        return content;
    }
    return content.substring(0, maxLength) + '...';
}

function expandMessage(messageElement) {
    const contentElement = messageElement.querySelector('.message-content');
    const isExpanded = contentElement.classList.contains('expanded');
    
    if (isExpanded) {
        contentElement.classList.remove('expanded');
        // Find the original message and truncate again
        const messageIndex = Array.from(messageElement.parentNode.children).indexOf(messageElement);
        const originalMessage = historyData[messageIndex];
        if (originalMessage) {
            contentElement.textContent = truncateMessage(originalMessage.content, 150);
        }
    } else {
        contentElement.classList.add('expanded');
        // Find the original message and show full content
        const messageIndex = Array.from(messageElement.parentNode.children).indexOf(messageElement);
        const originalMessage = historyData[messageIndex];
        if (originalMessage) {
            contentElement.textContent = originalMessage.content;
        }
    }
}

function updatePagination(currentPage, totalMessages, limit) {
    const totalPages = Math.ceil(totalMessages / limit);
    const paginationInfo = document.getElementById('pagination-info');
    const loadPrevious = document.getElementById('load-previous');
    const loadNext = document.getElementById('load-next');
    
    paginationInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalMessages} messages)`;
    
    loadPrevious.disabled = currentPage <= 1;
    loadNext.disabled = currentPage >= totalPages;
}

function loadPreviousMessages() {
    if (currentHistoryPage > 1) {
        loadChatHistory(currentHistoryPage - 1);
    }
}

function loadNextMessages() {
    loadChatHistory(currentHistoryPage + 1);
}

function loadHistoryStatistics() {
    fetch('/history/statistics')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const stats = data.statistics;
                document.getElementById('total-messages').textContent = stats.total_messages || 0;
            }
        })
        .catch(error => {
            console.error('Error loading statistics:', error);
        });
}

function searchHistory() {
    const searchPanel = document.getElementById('history-search');
    historySearchMode = !historySearchMode;
    
    if (historySearchMode) {
        searchPanel.classList.remove('hidden');
        document.getElementById('history-search-input').focus();
    } else {
        searchPanel.classList.add('hidden');
        // Reset to normal history view
        loadChatHistory();
    }
}

function performHistorySearch() {
    const query = document.getElementById('history-search-input').value.trim();
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }
    
    const historyMessages = document.getElementById('history-messages');
    
    // Show loading
    historyMessages.innerHTML = `
        <div class="loading-history">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Searching chat history...</span>
        </div>
    `;
    
    fetch('/history/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, limit: 50 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySearchResults(data.results, query);
        } else {
            showHistoryError('Search failed');
        }
    })
    .catch(error => {
        console.error('Error searching history:', error);
        showHistoryError('Error searching chat history');
    });
}

function displaySearchResults(results, query) {
    const historyMessages = document.getElementById('history-messages');
    
    if (results.length === 0) {
        historyMessages.innerHTML = `
            <div class="loading-history">
                <i class="fa-solid fa-search"></i>
                <span>No results found for "${query}"</span>
            </div>
        `;
        return;
    }
    
    const searchHeader = `
        <div class="search-result-header">
            <i class="fa-solid fa-search"></i>
            Found ${results.length} results for "${query}"
        </div>
    `;
    
    const resultsHtml = results.map(message => `
        <div class="history-message ${message.role}" onclick="expandMessage(this)">
            <div class="message-header">
                <span class="message-role">
                    ${message.role === 'user' ? '👤' : '🤖'} ${message.role}
                </span>
                <span class="message-time">${message.formatted_time}</span>
            </div>
            <div class="message-content">
                ${highlightSearchTerm(truncateMessage(message.content, 150), query)}
            </div>
            ${message.message_type !== 'text' ? `<span class="message-type ${message.message_type}">${message.message_type}</span>` : ''}
        </div>
    `).join('');
    
    historyMessages.innerHTML = searchHeader + '<div class="search-results">' + resultsHtml + '</div>';
    historyData = results;
}

function highlightSearchTerm(text, term) {
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function exportHistory() {
    fetch('/history/export')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const exportData = data.export_data;
                const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                    type: 'application/json'
                });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat_history_${exportData.session_id}_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showHistorySuccess('Chat history exported successfully!');
            } else {
                showHistoryError('Failed to export chat history');
            }
        })
        .catch(error => {
            console.error('Error exporting history:', error);
            showHistoryError('Error exporting chat history');
        });
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
        fetch('/history/clear', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showHistorySuccess('Chat history cleared successfully!');
                loadChatHistory(); // Refresh the display
                loadHistoryStatistics();
            } else {
                showHistoryError('Failed to clear chat history');
            }
        })
        .catch(error => {
            console.error('Error clearing history:', error);
            showHistoryError('Error clearing chat history');
        });
    }
}

function showHistoryError(message) {
    const historyMessages = document.getElementById('history-messages');
    historyMessages.innerHTML = `
        <div class="loading-history" style="color: var(--error);">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
}

function showHistorySuccess(message) {
    const historyMessages = document.getElementById('history-messages');
    const successDiv = document.createElement('div');
    successDiv.style.cssText = 'background: #4caf50; color: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; text-align: center;';
    successDiv.innerHTML = `<i class="fa-solid fa-check"></i> ${message}`;
    
    historyMessages.insertBefore(successDiv, historyMessages.firstChild);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// Add keyboard shortcut for history search
document.addEventListener('keydown', function(event) {
    // Ctrl + H to open history panel
    if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        toggleHistoryPanel();
    }
    
    // Enter key in search input to perform search
    if (event.target.id === 'history-search-input' && event.key === 'Enter') {
        event.preventDefault();
        performHistorySearch();
    }
});

// Initialize history panel on page load
document.addEventListener('DOMContentLoaded', function() {
    // Existing DOMContentLoaded code...
    
    // Load initial history statistics
    setTimeout(() => {
        loadHistoryStatistics();
    }, 1000);
});

function requestYouTubeRecommendations(topic) {
    if (!topic || topic.trim() === "") return;
    
    let chatBox = document.getElementById("chat-box");
    
    // Display user message
    let userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.innerHTML = `<strong>You:</strong> Can you recommend YouTube videos on ${topic}?`;
    chatBox.appendChild(userMessage);
    
    // Create and show thinking message with animated dots
    let thinkingMessage = document.createElement("div");
    thinkingMessage.className = "ai-message";
    setAIMessageToThinking(thinkingMessage);
    chatBox.appendChild(thinkingMessage);
    
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom

    // Send request to backend
    fetch("/youtube-recommendations", {
        method: "POST",
        body: JSON.stringify({ topic: topic }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Remove thinking message
        if (thinkingMessage && thinkingMessage.parentNode) {
            chatBox.removeChild(thinkingMessage);
        }
        
        if (data.success && data.recommendations) {
            // Display AI response with YouTube recommendations
            let aiMessage = document.createElement("div");
            aiMessage.className = "ai-message";
            
            // Create response content container
            let responseContent = document.createElement("div");
            responseContent.className = "response-content";
            responseContent.innerHTML = `<strong>TUTIX:</strong> Here are some YouTube videos on <strong>${data.topic}</strong> that you might find helpful:`;
            
            // Create speak button
            let speakButton = document.createElement("button");
            speakButton.className = "speak-response-button";
            speakButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            speakButton.title = "Click to read this response aloud";
            
            // Extract text content for speech
            const responseText = `Here are some YouTube videos on ${data.topic} that you might find helpful.`;
            
            speakButton.addEventListener('click', function(e) {
                e.preventDefault();
                speakResponseText(responseText, speakButton);
            });
            
            // Create container for response and button
            let messageContainer = document.createElement("div");
            messageContainer.className = "message-container";
            messageContainer.appendChild(responseContent);
            messageContainer.appendChild(speakButton);
            
            aiMessage.appendChild(messageContainer);
            
            // Add YouTube recommendations
            let youtubeContainer = document.createElement("div");
            youtubeContainer.className = "youtube-recommendations-container";
            youtubeContainer.innerHTML = data.recommendations;
            
            // Add enhanced error handling for images
            setTimeout(() => {
                const images = youtubeContainer.querySelectorAll('img');
                images.forEach(img => {
                    // Set initial error handler
                    img.onerror = function() {
                        const videoId = this.alt.split(' ').pop(); // Extract video ID from alt text
                        this.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                        this.onerror = null; // Prevent infinite loop
                    };
                    
                    // Preload check
                    const image = new Image();
                    image.onload = function() {
                        // Image loaded successfully
                    };
                    image.onerror = function() {
                        // Image failed to load, trigger error handler
                        img.onerror();
                    };
                    image.src = img.src;
                });
            }, 100);
            
            aiMessage.appendChild(youtubeContainer);
            chatBox.appendChild(aiMessage);
        } else {
            // Display error message
            let errorMessage = document.createElement("div");
            errorMessage.className = "ai-message error";
            errorMessage.innerHTML = `<strong>TUTIX:</strong> Sorry, I couldn't find YouTube recommendations for "${data.topic}". Please try a different topic.`;
            chatBox.appendChild(errorMessage);
        }
        
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
    })
    .catch(error => {
        console.error("Error requesting YouTube recommendations:", error);
        
        // Remove thinking message
        if (thinkingMessage && thinkingMessage.parentNode) {
            chatBox.removeChild(thinkingMessage);
        }
        
        // Display error message
        let errorMessage = document.createElement("div");
        errorMessage.className = "ai-message error";
        errorMessage.innerHTML = `<strong>TUTIX:</strong> Sorry, I encountered an error while searching for YouTube recommendations. Please try again.`;
        chatBox.appendChild(errorMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// YouTube Modal Functions
function showYouTubeInput() {
    const modal = document.getElementById('youtube-modal');
    modal.classList.remove('hidden');
    document.getElementById('youtube-topic').focus();
}

function closeYouTubeModal() {
    const modal = document.getElementById('youtube-modal');
    modal.classList.add('hidden');
    document.getElementById('youtube-topic').value = '';
}

function submitYouTubeRequest() {
    const topicInput = document.getElementById('youtube-topic');
    const topic = topicInput.value.trim();
    
    if (topic) {
        closeYouTubeModal();
        requestYouTubeRecommendations(topic);
    } else {
        alert('Please enter a topic for YouTube recommendations');
    }
}

// Allow Enter key to submit YouTube request
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('youtube-modal');
    const topicInput = document.getElementById('youtube-topic');
    
    // Check if YouTube modal is open and Enter key is pressed
    if (!modal.classList.contains('hidden') && event.key === 'Enter' && document.activeElement === topicInput) {
        event.preventDefault();
        submitYouTubeRequest();
    }
});

// Function to get related topics
function getRelatedTopics(topic) {
    fetch("/related-topics", {
        method: "POST",
        body: JSON.stringify({ topic: topic }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.related_topics) {
            displayRelatedTopics(data.related_topics);
        }
    })
    .catch(error => {
        console.error("Error getting related topics:", error);
    });
}

// Function to display related topics in the sidebar
function displayRelatedTopics(topics) {
    const relatedTopicsContent = document.getElementById("related-topics-content");
    
    if (!topics || topics.length === 0) {
        relatedTopicsContent.innerHTML = `
            <div class="loading-sidebar">
                <i class="fa-solid fa-lightbulb"></i>
                <span>No related topics found</span>
            </div>
        `;
        return;
    }
    
    let topicsHtml = "";
    topics.forEach(topic => {
        topicsHtml += `
            <div class="related-topic-item" onclick="requestRelatedTopic('${topic.title}')">
                <div class="related-topic-title">
                    <i class="fa-solid fa-arrow-turn-down"></i>
                    ${topic.title}
                </div>
                <div class="related-topic-description">
                    ${topic.description}
                </div>
            </div>
        `;
    });
    
    relatedTopicsContent.innerHTML = topicsHtml;
}

// Function to request information about a related topic
function requestRelatedTopic(topic) {
    const userInput = document.getElementById("user-input");
    userInput.value = `Tell me more about ${topic}`;
    sendMessage();
}

// Function to toggle related topics sidebar
function toggleRelatedTopicsSidebar() {
    const sidebar = document.getElementById("related-topics-sidebar");
    const toggleBtn = sidebar.querySelector(".sidebar-toggle-btn");
    
    relatedTopicsSidebarCollapsed = !relatedTopicsSidebarCollapsed;
    
    if (relatedTopicsSidebarCollapsed) {
        sidebar.classList.add("collapsed");
        toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    } else {
        sidebar.classList.remove("collapsed");
        toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    }
}
