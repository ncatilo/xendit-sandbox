# Xendit Sandbox

![image](/public/ui.png)

#### Prerequisite installs

- Activated account at Xendit https://dashboard.xendit.co
- Visual Studio Code https://code.visualstudio.com
- Node JS https://nodejs.org
- Git https://git-scm.com/downloads

#### Setup

1.  Clone this repository to your machine with this Terminal command:
    ```
    git clone https://github.com/ncatilo/xendit-sandbox
    ```
    or download it from https://github.com/ncatilo/xendit-sandbox/archive/refs/heads/main.zip
2. In the Terminal, go to the root directory and run ```npm i``` to install its dependencies.

3. Create/Fetch API keys from your Xendit account at https://dashboard.xendit.co/settings/developers#api-keys.

4. In the root directory, create a file named *.env* with the following keys and their corresponding API key values:

    ```
    TEST_ENV_SECRET_KEY=
    LIVE_ENV_SECRET_KEY=
    CALLBACK_VERIFICATION_TOKEN=
    REDIRECT_HOST=http://localhost:3000
    PORT=3000
    ```
5. For the callbacks/webhooks from Xendit to work with *http://localhost:3000* on your machine:

    - Sign-up, download ***ngrok*** and follow instructions from https://ngrok.com/download (Free plan)

    - Launching **ngrok** in your terminal would look similar to this: 
    
    ![image](/public/ngrok.png)

    - Copy onto your clipboard your *ngrok hostname* from the Terminal

    - Under TEST mode at https://dashboard.xendit.co/settings/developers, register in the *Callback URL* section:

        - *Payment Request* 

            - Captured Succeeded (New Payments API)<br />*https://{ngrok hostname}/api/callback/payment/captured/success*

            - Captured Failed (New Payments API)<br />*https://{ngrok hostname}/api/callback/payment/captured/failed*

            - Payment Succeeded (New Payments API)<br />*https://{ngrok hostname}/api/callback/payment/charged/success*

            - Payment Failed (New Payments API)<br />*https://{ngrok hostname}/api/callback/payment/charged/failed*
    
        - *Payment Method*

            - Payment Method<br />*https://{ngrok hostname}/api/callback/payment/method/status*

6. In *Visual Studio Code*, open the root directory and press F5 or go to menu, *Run > Start Debugging*.

7. Launch the app at http://localhost:3000 on your browser.

Developer Guides are here:
https://drive.google.com/drive/folders/1X4bu1g54CaEgRerWFKykJVYItgy5Ldsx
