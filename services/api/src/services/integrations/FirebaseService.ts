import * as admin from 'firebase-admin';
import { config } from '../../config';
import logger from '../../utils/logger';

let initialized = false;

export class FirebaseService {
  static initialize() {
    if (initialized) return;
    try {
      if (config.firebase.projectId && config.firebase.privateKey && config.firebase.clientEmail) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebase.projectId,
            privateKey: config.firebase.privateKey.replace(/\\n/g, '\n'),
            clientEmail: config.firebase.clientEmail,
          }),
        });
        initialized = true;
        logger.info('Firebase initialized');
      } else {
        logger.warn('Firebase not configured, push notifications disabled');
      }
    } catch (error) {
      logger.error('Firebase initialization failed', error);
    }
  }

  static async sendToUser(userId: string, title: string, body: string, data?: any): Promise<boolean> {
    if (!initialized) return false;
    try {
      const message: any = {
        notification: { title, body },
        data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : {},
        topic: `user_${userId}`,
      };
      await admin.messaging().send(message);
      return true;
    } catch (error) {
      logger.error('Firebase send failed', error);
      return false;
    }
  }

  static async sendToTopic(topic: string, title: string, body: string, data?: any): Promise<boolean> {
    if (!initialized) return false;
    try {
      const message: admin.messaging.TopicMessage = {
        notification: { title, body },
        data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : {},
        topic,
      };
      await admin.messaging().send(message);
      return true;
    } catch (error) {
      logger.error('Firebase topic send failed', error);
      return false;
    }
  }

  static async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    if (!initialized) return;
    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
    } catch (error) {
      logger.error('Firebase subscribe failed', error);
    }
  }

  static async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    if (!initialized) return;
    try {
      await admin.messaging().unsubscribeFromTopic(tokens, topic);
    } catch (error) {
      logger.error('Firebase unsubscribe failed', error);
    }
  }
}
