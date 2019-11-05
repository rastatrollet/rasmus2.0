/* eslint-disable no-console */

import { register } from 'register-service-worker';
import store from './store';

store.commit('setOnline', navigator.onLine);

window.addEventListener('offline', () => store.commit('setOnline', false));
window.addEventListener('online', () => store.commit('setOnline', true));
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  store.commit('setBeforeInstallPrompt', event);
});

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        'App is being served from cache by a service worker.\n' +
          'For more details, visit https://goo.gl/AFskqB'
      );
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updated() {
      store.commit('setUpdateAvailable', true);
      console.log('New content is available; please refresh.');
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    }
  });
}
