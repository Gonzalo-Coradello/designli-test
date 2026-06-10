import messaging from '@react-native-firebase/messaging'

messaging().setBackgroundMessageHandler(async () => {
  // System tray notification is shown automatically when payload includes notification field
})

import 'expo-router/entry'
