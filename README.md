# imessageforwarder

A node express app to send iMessages. The app is be hosted on an iCloud-enabled Mac and uses Apple Script to interact with Apple's Messages app.

## Usage

Tested on:
* macOS 10.15.7
* Node 14.15.3

1. Allow Terminal to use the Messages app in System Preferences. Follow [this guide](https://help.rescuetime.com/article/59-how-do-i-enable-accessibility-permissions-on-mac-osx).
1. Start the express app:
    ```bash
    yarn start
    ```
1. Test by sending a [message](src/IMFMessage.ts):
    ```bash
    curl --location --request POST 'localhost:5000/msg' \
      --header 'Content-Type: application/json' \
      --data-raw '{
        "content": {
          "text": "test message"
        },
        "phoneOrEmail": "+17801234567"
      }'
    ```
    Note: this only works if you have previously sent a message to the recipient on your Mac.
1. Go write your own GUI.

## Roadmap:

* Two-way communication -- ie. events for incoming messages
* Support for photo attachments
