# App Icons and Splash Screens

This directory is for your mobile app's source images. To generate the necessary icons and splash screens for Android and iOS, please follow these steps:

1.  **Create Source Images:**
    *   **Icon:** Create an image named `icon.png` with dimensions of **1024x1024 pixels**.
    *   **Splash Screen:** Create an image named `splash.png` with dimensions of **2732x2732 pixels**.

2.  **Place Images Here:**
    *   Place both `icon.png` and `splash.png` directly into this `resources` folder.

3.  **Generate Assets (Requires `cordova-res`):**
    *   If you don't have it, install `cordova-res`:
        ```bash
        npm install -g cordova-res
        ```
    *   Run the generation command from your project's root directory:
        ```bash
        cordova-res ios --skip-config --copy
        cordova-res android --skip-config --copy
        ```

This process will use your source images to create all the different sizes required for both platforms and place them in the correct native project directories.
