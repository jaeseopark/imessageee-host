# imessageforwarder (imf)

A WebSocket abstraction layer on top of Apple's Messages app. Once installed on an iCloud-enabled device, imf allows you to bring your own GUI to send/receive iMessages.

Why create a proxy when you can use the Messages app out of the box? With imf, the client is no longer bound to macOS. As an obvious example, you can write a webapp and access it from any device on your home network.

<img src="https://user-images.githubusercontent.com/20038316/138819386-082919f6-2581-4bb4-9460-d98ccbb4fce6.png" width=500 />

## Usage

Tested on:
* macOS 11.6
* Node 14.15.3

1. Install dependencies
     ```bash
     yarn install
     ```
1. Start the express app:
    ```bash
    yarn start

    # or

    IMF_PORT=1234 yarn start # customize the port
    ```
1. Proceed to installing [react-imf](https://github.com/jaeseopark/react-imf) or bring your own GUI. Happy messaging!

## Roadmap:

* Support for photo/video attachments
* Support for group chats
