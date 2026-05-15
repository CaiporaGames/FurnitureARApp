# installed with command:
npx @react-native-community/cli init FurnitureARApp --version 0.83.0

# How to run project.
1. Open a new terminal run:npm start or npx react-native start --reset-cache
2. In another terminal run:npx react-native run-android
or these two in a separated powershell:
& "C:\Users\timot\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
& "C:\Users\timot\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell am start -n com.furniturearapp/com.furniturearapp.MainActivity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER