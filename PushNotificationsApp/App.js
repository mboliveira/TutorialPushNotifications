/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Alert,
  ToastAndroid
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import axios from 'axios';

import firebase from 'react-native-firebase';
import { RNFirebase } from 'react-native-firebase';

import { Component } from 'react';


const API_URL =""; //TODO ADD API URL TO DO REGISTER

export default class App extends Component {
  
  componentDidMount() {

    this._createFirebaseChannel();

    this._createNotificationListeners();
  }

  _createFirebaseChannel() {

    // REQUIRED FOR ANDROID
    // Build a channel
    const channel = new firebase.notifications.Android.Channel(
      "PROGNOS_NOTIFICATION_CHANNEL_ID",
      'Prognos Notification Channel',
      firebase.notifications.Android.Importance.Max,
    ).setDescription('Prognos Notification Channel')
    .enableVibration(true);

    firebase.notifications().android.createChannel(channel);
  }

  _createNotificationListeners() {
    // RECEIVE NOTIFICATION
    firebase
      .notifications()
      .onNotification((notification: RNFirebase.notifications.Notification) => {
        this._showNotification(notification);
      });

    // FIRED WHEN OPEN NOTIFICATION AND APP ISN'T CLOSED
    firebase
      .notifications()
      .onNotificationOpened((notificationOpen: RNFirebase.notifications.NotificationOpen) => {
        this._notificationTapped(notificationOpen);
      });

    // FIRED WHEN OPEN NOTIFICATION AND APP IS CLOSED
    firebase
      .notifications()
      .getInitialNotification()
      .then((notificationOpen: RNFirebase.notifications.NotificationOpen) => {
        // App was opened by a notification
        this._notificationTapped(notificationOpen);
      });
  }


  _showNotification(notification: RNFirebase.notifications.Notification) {
    
      let title = notification.title ? notification.title : '';
      let body = notification.body ? notification.body : '';
      let data = notification.data;

      let localNotification = new firebase.notifications.Notification()
        .setTitle(title)
        .setBody(body)
        .setData(data)
        .setSound('default');

      
      localNotification
        .android.setChannelId("PROGNOS_NOTIFICATION_CHANNEL_ID")
        .android.setAutoCancel(true)
        .android.setBigText(body, title)
        .android.setPriority(firebase.notifications.Android.Priority.High);

      firebase
        .notifications()
        .displayNotification(localNotification)
        .catch((err) => Alert.alert('Error...: ' + err));
  }


  _notificationTapped(notificationOpen: RNFirebase.notifications.NotificationOpen) {
    if (
      notificationOpen &&
      notificationOpen.notification &&
      notificationOpen.notification.data
    ) {
      ToastAndroid.show('Data from notification: TagId: ' + notificationOpen.notification.data.tagId + " UserId: " + notificationOpen.notification.data.userId,ToastAndroid.SHORT);
    }
  }


  _register = async () => {
    // Retrieve the current registration token
    var token =  await firebase.messaging().getToken();
    
      axios.post(API_URL, {'pnsToken': token})
        .then(response => {
            ToastAndroid.show('Push notifications registered with success :)',ToastAndroid.SHORT);
          })
          .catch(error => {
            Alert.alert('Error: ' + error);
          });
  }

    
  render() {
      return (
            <>
              <StatusBar barStyle="dark-content" />
              <SafeAreaView>
                <ScrollView
                  contentInsetAdjustmentBehavior="automatic"
                  style={styles.scrollView}>
                  
                  <View style={styles.body}>
                    <View style={styles.sectionContainer}>
                      <Button
                        onPress={() => this._register()}
                        title="Register Push Notifications"
                        color="#841584"
                      />
                    </View>
                    
                  </View>
                </ScrollView>
              </SafeAreaView>
            </>
          );
  }
}

const styles = StyleSheet.create({
    scrollView: {
      backgroundColor: Colors.lighter,
    },
    engine: {
      position: 'absolute',
      right: 0,
    },
    body: {
      backgroundColor: Colors.white,
    },
    sectionContainer: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: Colors.black,
    },
    sectionDescription: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '400',
      color: Colors.dark,
    },
    highlight: {
      fontWeight: '700',
    },
    footer: {
      color: Colors.dark,
      fontSize: 12,
      fontWeight: '600',
      padding: 4,
      paddingRight: 12,
      textAlign: 'right',
    },
  });
