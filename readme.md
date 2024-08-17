# Job Offer Letter Generator Bot

## Overview

The Job Offer Letter Generator Bot is a WhatsApp-based application that assists HR departments in creating and sending job offer letters. Built with Node.js, Express, MongoDB, and Twilio, this bot allows users to generate personalized job offer letters in PDF format and send them via WhatsApp.

## Features

- **Interactive Chat**: Engage with users via WhatsApp to gather information for the job offer letter.
- **PDF Generation**: Create a formatted job offer letter in PDF format.
- **File Storage**: Save generated PDFs to a local directory (`pdfs`).
- **WhatsApp Integration**: Send the generated PDF as a media message through WhatsApp using Twilio.

## Setup

### Prerequisites

- Node.js
- MongoDB
- Twilio account with WhatsApp messaging enabled
- Ngrok (for exposing local server to the internet)

### Installation

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/MitanshuKumawat/Job-Offer-Gnerator-Bot
    ```
    
2. **Navigate to the Project Directory:**

    Change to the project directory where you cloned the repository. For example:

    ```bash
    cd <repository-directory>
    ```

3. **Install Dependencies:**

    ```bash
    npm install
    ```

4. **Configure Environment:**
   - Replace the MongoDB connection string in `mongoose.connect` with your own.
   - Configure Twilio credentials and WhatsApp messaging settings.

5. **Run the Server:**

    ```bash
    node index.js
    ```

6. **Expose Local Server (if using Ngrok):**

    ```bash
    ngrok http 3000
    ```

   Update the Twilio webhook URL with the ngrok URL.

### Usage

- **Start a Conversation**: Send "hi" to initiate a conversation with the bot on WhatsApp.
- **Create a New Offer Letter**: Follow the prompts to enter details such as candidate name, position, salary, etc.
- **View Last Offer Letter**: Request the last generated offer letter to receive it via WhatsApp.


## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements!
