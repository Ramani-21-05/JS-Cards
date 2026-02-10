import { openDB } from 'idb';
import kanjiData from '../data/kanji-n5.json';

const DB_NAME = 'jsCardsDB';
const DB_VERSION = 3;

export async function initDB() {
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('kanji')) {
          db.createObjectStore('kanji', { keyPath: 'kanji' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'kanji' });
        }
        if (!db.objectStoreNames.contains('scores')) {
          db.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  } catch (error) {
    console.error('Failed to initialize DB:', error);
    throw error;
  }
}

export async function loadDefaultData() {
  try {
    const db = await initDB();
    const count = await db.count('kanji');
    
    if (count === 0) {
      const tx = db.transaction('kanji', 'readwrite');
      for (const kanji of kanjiData) {
        await tx.store.add(kanji);
      }
      await tx.done;
    }
  } catch (error) {
    console.error('Failed to load default data:', error);
    throw error;
  }
}

export async function getAllKanji() {
  try {
    const db = await initDB();
    return await db.getAll('kanji');
  } catch (error) {
    console.error('Failed to get kanji:', error);
    return [];
  }
}

export async function getKanjiByChar(kanjiChar) {
  try {
    const db = await initDB();
    return await db.get('kanji', kanjiChar);
  } catch (error) {
    console.error('Failed to get kanji by char:', error);
    return null;
  }
}

export async function updateKanji(kanji) {
  try {
    const db = await initDB();
    return await db.put('kanji', kanji);
  } catch (error) {
    console.error('Failed to update kanji:', error);
    throw error;
  }
}

export async function addKanji(kanji) {
  try {
    const db = await initDB();
    await db.add('kanji', kanji);
  } catch (error) {
    console.error('Failed to add kanji:', error);
    throw error;
  }
}

export async function deleteKanji(kanjiChar) {
  try {
    const db = await initDB();
    await db.delete('kanji', kanjiChar);
    await db.delete('progress', kanjiChar);
  } catch (error) {
    console.error('Failed to delete kanji:', error);
    throw error;
  }
}

export async function getSettings() {
  try {
    const db = await initDB();
    const settings = await db.getAll('settings');
    return settings.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to get settings:', error);
    return {};
  }
}

export async function saveSettings(key, value) {
  try {
    const db = await initDB();
    await db.put('settings', { key, value });
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

export async function updateProgress(kanjiChar, progressData, userEmail = 'guest') {
  try {
    const db = await initDB();
    const key = `${userEmail}_${kanjiChar}`;
    const existing = await db.get('progress', key);
    await db.put('progress', {
      kanji: key,
      kanjiChar,
      userEmail,
      ...existing,
      ...progressData,
      lastSeen: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to update progress:', error);
    throw error;
  }
}

export async function getProgress(kanjiChar, userEmail = 'guest') {
  try {
    const db = await initDB();
    const key = `${userEmail}_${kanjiChar}`;
    return await db.get('progress', key);
  } catch (error) {
    console.error('Failed to get progress:', error);
    return null;
  }
}

export async function getDueCards(userEmail = 'guest') {
  try {
    const db = await initDB();
    const allProgress = await db.getAll('progress');
    const now = new Date().getTime();
    
    // Filter by user email
    const userProgress = allProgress.filter(p => p.userEmail === userEmail);
    
    return userProgress.filter(p => {
      if (!p.lastSeen) return true; // New cards
      const lastSeenTime = new Date(p.lastSeen).getTime();
      const intervalMs = p.interval * 24 * 60 * 60 * 1000; // Convert days to ms
      return (lastSeenTime + intervalMs) < now;
    }).map(p => p.kanjiChar);
  } catch (error) {
    console.error('Failed to get due cards:', error);
    return [];
  }
}

export async function saveScore(scoreData) {
  try {
    const db = await initDB();
    await db.add('scores', {
      ...scoreData,
      date: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to save score:', error);
    throw error;
  }
}

export async function getAllScores() {
  try {
    const db = await initDB();
    const scores = await db.getAll('scores');
    return scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Failed to get scores:', error);
    return [];
  }
}
