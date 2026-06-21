import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  orderBy,
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { ActivityLog, EcoChallenge, ActivityType, AICoachMessage } from "../types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  points: number;
  activeStreak: number;
  createdAt: string;
}

// Ensure preloaded seeds exist in Firestore challenges collection for the user
export async function ensureUserChallengesAndProfile(uid: string, email: string, displayName: string): Promise<UserProfile> {
  if (uid === "guest_user") {
    let profile: UserProfile = {
      uid: "guest_user",
      email: email || "guest@ecoflow.app",
      displayName: displayName || "Guest Explorer",
      points: 355,
      activeStreak: 5,
      createdAt: new Date().toISOString()
    };
    const saved = localStorage.getItem("guest_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        profile.points = (typeof parsed.points === "number" && !isNaN(parsed.points)) ? parsed.points : 355;
        profile.activeStreak = (typeof parsed.activeStreak === "number" && !isNaN(parsed.activeStreak)) ? parsed.activeStreak : 5;
      } catch (e) {
        console.error("Malformed local guest profile:", e);
      }
    }
    localStorage.setItem("guest_profile", JSON.stringify(profile));

    const savedChallenges = localStorage.getItem("guest_challenges");
    if (!savedChallenges) {
      const defaultChallenges: EcoChallenge[] = [
        {
          id: "chal_1",
          title: "Eco Commuter",
          description: "Walk, bike, or take public transit for your transport needs today.",
          type: "daily",
          co2Value: 4.8,
          points: 100,
          completed: true,
          category: ActivityType.TRANSPORT,
        },
        {
          id: "chal_2",
          title: "Green Gourmet",
          description: "Consume entirely plant-based (vegan or vegetarian) meals today.",
          type: "daily",
          co2Value: 3.5,
          points: 120,
          completed: false,
          category: ActivityType.FOOD,
        },
        {
          id: "chal_3",
          title: "Phantom Power Slayer",
          description: "Unplug standby home appliances before going to bed.",
          type: "daily",
          co2Value: 1.2,
          points: 50,
          completed: false,
          category: ActivityType.ELECTRICITY,
        },
        {
          id: "chal_4",
          title: "Zero Waste Marathon",
          description: "Separate paper, scrap metal, plastic bottle recycling, compost organic waste.",
          type: "weekly",
          co2Value: 8.5,
          points: 300,
          completed: true,
          category: ActivityType.WASTE,
        },
        {
          id: "chal_5",
          title: "Thrift Master",
          description: "Choose vintage or local second-hand products instead of brand-new items.",
          type: "weekly",
          co2Value: 12.0,
          points: 400,
          completed: false,
          category: ActivityType.SHOPPING,
        },
      ];
      localStorage.setItem("guest_challenges", JSON.stringify(defaultChallenges));
    }
    return profile;
  }

  const userDocRef = doc(db, "users", uid);
  let userSnap;
  try {
    userSnap = await getDoc(userDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
  
  let profile: UserProfile;

  if (!userSnap.exists()) {
    // Create new profile record
    profile = {
      uid,
      email: email || "",
      displayName: displayName || email?.split("@")[0] || "Eco Companion",
      points: 350,
      activeStreak: 5,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(userDocRef, profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  } else {
    profile = userSnap.data() as UserProfile;
    // Fill in missing parts if needed
    if (!profile.points) profile.points = 350;
    if (!profile.activeStreak) profile.activeStreak = 5;
    if (!profile.displayName) profile.displayName = displayName || email?.split("@")[0] || "Eco Companion";
  }

  // Check if challenges exist in subcollection
  const challengesColRef = collection(db, "users", uid, "challenges");
  let chalSnap;
  try {
    chalSnap = await getDocs(challengesColRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/challenges`);
  }

  if (chalSnap.empty) {
    // Seed initial challenges for this specific user
    const defaultChallenges: EcoChallenge[] = [
      {
        id: "chal_1",
        title: "Eco Commuter",
        description: "Walk, bike, or take public transit for your transport needs today.",
        type: "daily",
        co2Value: 4.8,
        points: 100,
        completed: true,
        category: ActivityType.TRANSPORT,
      },
      {
        id: "chal_2",
        title: "Green Gourmet",
        description: "Consume entirely plant-based (vegan or vegetarian) meals today.",
        type: "daily",
        co2Value: 3.5,
        points: 120,
        completed: false,
        category: ActivityType.FOOD,
      },
      {
        id: "chal_3",
        title: "Phantom Power Slayer",
        description: "Unplug standby home appliances before going to bed.",
        type: "daily",
        co2Value: 1.2,
        points: 50,
        completed: false,
        category: ActivityType.ELECTRICITY,
      },
      {
        id: "chal_4",
        title: "Zero Waste Marathon",
        description: "Separate paper, scrap metal, plastic bottle recycling, compost organic waste.",
        type: "weekly",
        co2Value: 8.5,
        points: 300,
        completed: true,
        category: ActivityType.WASTE,
      },
      {
        id: "chal_5",
        title: "Thrift Master",
        description: "Choose vintage or local second-hand products instead of brand-new items.",
        type: "weekly",
        co2Value: 12.0,
        points: 400,
        completed: false,
        category: ActivityType.SHOPPING,
      },
    ];

    for (const chal of defaultChallenges) {
      const docRef = doc(db, "users", uid, "challenges", chal.id);
      try {
        await setDoc(docRef, chal);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${uid}/challenges/${chal.id}`);
      }
    }
  }

  return profile;
}

// Fetch Logs for specific user from Firestore
export async function fetchUserLogs(uid: string): Promise<ActivityLog[]> {
  if (uid === "guest_user") {
    const saved = localStorage.getItem("guest_logs");
    if (saved) {
      return JSON.parse(saved);
    } else {
      const defaultLogs: ActivityLog[] = [
        {
          id: "seed_log_1",
          userId: "guest_user",
          type: ActivityType.TRANSPORT,
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          carbonFootprint: 1.8,
          co2Saved: 3.2,
          co2Emoji: "🚲",
          details: {
            transport: { distance: 12, mode: "bicycle" }
          },
          notes: "Biked to the office this morning. Zero direct tailpipe emissions!"
        },
        {
          id: "seed_log_2",
          userId: "guest_user",
          type: ActivityType.FOOD,
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          carbonFootprint: 0.9,
          co2Saved: 4.5,
          co2Emoji: "🥗",
          details: {
            food: { meals: 1, dietType: "vegetarian" }
          },
          notes: "Had a delightful local, organic vegetarian lunch today."
        }
      ];
      localStorage.setItem("guest_logs", JSON.stringify(defaultLogs));
      return defaultLogs;
    }
  }

  const colRef = collection(db, "users", uid, "logs");
  const q = query(colRef);
  let snap;
  try {
    snap = await getDocs(q);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/logs`);
  }
  const logsArr: ActivityLog[] = [];
  snap.forEach((d) => {
    logsArr.push({ id: d.id, ...d.data() } as ActivityLog);
  });
  // Sort descending by timestamp
  return logsArr.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Fetch Challenges for specific user from Firestore
export async function fetchUserChallenges(uid: string): Promise<EcoChallenge[]> {
  if (uid === "guest_user") {
    const saved = localStorage.getItem("guest_challenges");
    if (saved && saved !== "[]") {
      return JSON.parse(saved);
    }
    const defaultChallenges: EcoChallenge[] = [
      {
        id: "chal_1",
        title: "Eco Commuter",
        description: "Walk, bike, or take public transit for your transport needs today.",
        type: "daily",
        co2Value: 4.8,
        points: 100,
        completed: false,
        category: ActivityType.TRANSPORT,
      },
      {
        id: "chal_2",
        title: "Green Gourmet",
        description: "Consume entirely plant-based (vegan or vegetarian) meals today.",
        type: "daily",
        co2Value: 3.5,
        points: 120,
        completed: false,
        category: ActivityType.FOOD,
      },
      {
        id: "chal_3",
        title: "Phantom Power Slayer",
        description: "Unplug standby home appliances before going to bed.",
        type: "daily",
        co2Value: 1.2,
        points: 50,
        completed: false,
        category: ActivityType.ELECTRICITY,
      },
      {
        id: "chal_4",
        title: "Zero Waste Marathon",
        description: "Separate paper, scrap metal, plastic bottle recycling, compost organic waste.",
        type: "weekly",
        co2Value: 8.5,
        points: 300,
        completed: false,
        category: ActivityType.WASTE,
      },
      {
        id: "chal_5",
        title: "Thrift Master",
        description: "Choose vintage or local second-hand products instead of brand-new items.",
        type: "weekly",
        co2Value: 12.0,
        points: 400,
        completed: false,
        category: ActivityType.SHOPPING,
      },
    ];
    localStorage.setItem("guest_challenges", JSON.stringify(defaultChallenges));
    return defaultChallenges;
  }

  const colRef = collection(db, "users", uid, "challenges");
  let snap;
  try {
    snap = await getDocs(colRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/challenges`);
  }
  const challengesArr: EcoChallenge[] = [];
  snap.forEach((d) => {
    challengesArr.push(d.data() as EcoChallenge);
  });
  return challengesArr;
}

// Update or toggle challenge completion in Firestore
export async function toggleUserChallenge(uid: string, challengeId: string, currentCompleted: boolean, pointsValue: number): Promise<{ success: boolean; newPoints: number }> {
  if (uid === "guest_user") {
    const savedChallenges = localStorage.getItem("guest_challenges");
    let chals: EcoChallenge[] = [];
    if (savedChallenges) {
      chals = JSON.parse(savedChallenges);
    }
    const updatedChals = chals.map(c => 
      c.id === challengeId ? { ...c, completed: !currentCompleted } : c
    );
    localStorage.setItem("guest_challenges", JSON.stringify(updatedChals));

    const savedProfile = localStorage.getItem("guest_profile");
    let newPoints = 350;
    if (savedProfile) {
      const profile = JSON.parse(savedProfile) as UserProfile;
      const diff = !currentCompleted ? pointsValue : -pointsValue;
      newPoints = Math.max(0, (profile.points || 0) + diff);
      profile.points = newPoints;
      localStorage.setItem("guest_profile", JSON.stringify(profile));
    }
    return { success: true, newPoints };
  }

  const chalDocRef = doc(db, "users", uid, "challenges", challengeId);
  try {
    await updateDoc(chalDocRef, {
      completed: !currentCompleted
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/challenges/${challengeId}`);
  }

  const userDocRef = doc(db, "users", uid);
  let userSnap;
  try {
    userSnap = await getDoc(userDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
  let newPoints = 350;
  if (userSnap.exists()) {
    const profile = userSnap.data() as UserProfile;
    const diff = !currentCompleted ? pointsValue : -pointsValue;
    newPoints = Math.max(0, (profile.points || 0) + diff);
    try {
      await updateDoc(userDocRef, {
        points: newPoints
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  }

  return { success: true, newPoints };
}

// Save log into user Firestore collection
export async function addUserLog(uid: string, log: ActivityLog): Promise<void> {
  if (uid === "guest_user") {
    const saved = localStorage.getItem("guest_logs");
    let logsArr: ActivityLog[] = [];
    if (saved) {
      logsArr = JSON.parse(saved);
    }
    logsArr = [log, ...logsArr];
    localStorage.setItem("guest_logs", JSON.stringify(logsArr));
    return;
  }

  const docRef = doc(db, "users", uid, "logs", log.id);
  try {
    await setDoc(docRef, log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/logs/${log.id}`);
  }
}

// Delete log from user Firestore collection
export async function deleteUserLog(uid: string, logId: string): Promise<void> {
  if (uid === "guest_user") {
    const saved = localStorage.getItem("guest_logs");
    let logsArr: ActivityLog[] = [];
    if (saved) {
      logsArr = JSON.parse(saved);
    }
    logsArr = logsArr.filter(l => l.id !== logId);
    localStorage.setItem("guest_logs", JSON.stringify(logsArr));
    return;
  }

  const docRef = doc(db, "users", uid, "logs", logId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/logs/${logId}`);
  }
}
