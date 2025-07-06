import { doc, setDoc, collection, getDocs, deleteDoc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";


export type Activity = ActivitySingle | ActivitySevenToSmoke;

export interface vote {
    memberID: string;
    vote: 0 | 1 | "TIE";
    timestamp: number;
}

export interface Member {
  id: string;
  name: string;
  activityID: string;
  joinTime: number;

  // for seven to smoke
  spectator?: boolean;
}

export interface Battle {
  id: string;
  name: string;
  description: string;
  memberIDs: string[]; // 2 members
  winnerID: string | null;
  votes: vote[];
  status: "PENDING" | "ONGOING" | "VOTING" | "VOTED"| "COMPLETED";
  startTime: number | null;
  endTime: number | null;
}

export interface ActivitySingle {
  id: string;
  adminID: string;
  name: string;
  memberIDs: string[];
  currentBattleID: string | null;
  inviteCode: string; // 邀請碼
  description: string;
  type: "single";
}

export interface ActivitySevenToSmoke {
  id: string;
  adminID: string;
  name: string;
  memberIDs: string[];
  currentBattleID: string | null;
  inviteCode: string; // 邀請碼
  description: string;

  // seven to smoke 專屬設定
  sevenToSmokeConfig: {
    targetScore: number; // 幾分獲勝
  };

  // seven to smoke 狀態
  sevenToSmokeState: {
    queue: string[]; // 排隊順序（memberID）
    onStage: [string, string]; // 場上兩位選手
    scores: { [memberID: string]: number }; // 每位分數
    winnerID?: string | null; // 若已分出勝負
  };
  type: "sevenToSmoke";
}

/////// Activity ////////

export const getActivities = async (adminID: string) => {
  const activitiesRef = collection(db, "activities");
  const snapshot = await getDocs(activitiesRef);
  return snapshot.docs.map((doc) => (doc.data() as Activity)).filter((activity) => activity.adminID === adminID);
};

export const getActivity = async (activityID: string) => {
  const activityRef = doc(db, "activities", activityID);
  const snapshot = await getDoc(activityRef);
  return snapshot.data() as Activity;
};

// 即時監聽活動變化
export const subscribeToActivity = (activityID: string, callback: (activity: Activity | null) => void) => {
  const activityRef = doc(db, "activities", activityID);
  return onSnapshot(activityRef, (doc) => {
    if (doc.exists()) {
      const activity = doc.data() as Activity;
      callback(activity);
    } else {
      callback(null);
    }
  });
};

export const createActivity = async (activity: Activity) => {
  const activityRef = doc(db, "activities", activity.id);
  await setDoc(activityRef, activity);
};

export const deleteActivity = async (id: string) => {
  const activityRef = doc(db, "activities", id);
  await deleteDoc(activityRef);
};

export const updateActivityInfo = async (activity: Activity) => {
  const activityRef = doc(db, "activities", activity.id);
  await updateDoc(activityRef, {
    name: activity.name,
    description: activity.description,
  });
};

export const updateActivityMember = async (activity: Activity, memberID: string) => {
  const activityRef = doc(db, "activities", activity.id);
  await updateDoc(activityRef, {
    memberIDs: arrayUnion(memberID),
  });
};

export const deleteActivityMember = async (activity: Activity, memberID: string) => {
  const activityRef = doc(db, "activities", activity.id);
  await updateDoc(activityRef, {
    memberIDs: arrayRemove(memberID),
  });
};

export const updateActivityMembers = async (activityId: string, memberIDs: string[]) => {
  const activityRef = doc(db, "activities", activityId);
  await updateDoc(activityRef, {
    memberIDs: memberIDs,
  });
};

/////// Member ////////

export const createMember = async (member: Member) => {
  const memberRef = doc(db, "members", member.id);
  await setDoc(memberRef, member);
};

export const getMember = async (memberID: string) => {
  const memberRef = doc(db, "members", memberID);
  const snapshot = await getDoc(memberRef);
  return snapshot.data() as Member;
};

export const getMembers = async (activityID: string) => {
  const membersRef = collection(db, "members");
  const snapshot = await getDocs(membersRef);
  return snapshot.docs
    .map((doc) => (doc.data() as Member))
    .filter((member) => member.activityID === activityID);
};

// 即時監聽活動成員變化
export const subscribeToActivityMembers = (activityID: string, callback: (members: Member[]) => void) => {
  const membersRef = collection(db, "members");
  const q = query(membersRef, orderBy("joinTime", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs
      .map((doc) => (doc.data() as Member))
      .filter((member) => member.activityID === activityID);
    callback(members);
  });
};

export const updateMember = async (member: Member) => {
  const memberRef = doc(db, "members", member.id);
  await updateDoc(memberRef, {
    name: member.name,
  });
};

export const updateMemberSpectator = async (memberID: string, spectator: boolean) => {
  const memberRef = doc(db, "members", memberID);
  await updateDoc(memberRef, {
    spectator: spectator
  });
};

export const deleteMember = async (memberID: string) => {
  const memberRef = doc(db, "members", memberID);
  await deleteDoc(memberRef);
};

/////// Battle ////////

export const createBattle = async (activityID: string, battle: Battle) => {
  const battleRef = doc(db, `activities/${activityID}/battles`, battle.id);
  await setDoc(battleRef, battle);
};

export const deleteBattle = async (activityID: string, battleID: string) => {
  const activityRef = doc(db, "activities", activityID);
  const battleRef = doc(activityRef, "battles", battleID);
  await deleteDoc(battleRef);
};

export const getBattles = async (activityID: string) => {
  const activityRef = doc(db, "activities", activityID);
  const snapshot = await getDocs(collection(activityRef, "battles"));
  return snapshot.docs.map((doc) => (doc.data() as Battle));
};

// 即時監聽戰鬥變化
export const subscribeToBattles = (activityID: string, callback: (battles: Battle[]) => void) => {
  const activityRef = doc(db, "activities", activityID);
  const battlesRef = collection(activityRef, "battles");
  const q = query(battlesRef, orderBy("status", "desc"), orderBy("startTime", "asc"));
  
  return onSnapshot(q, (snapshot) => {
      const battles = snapshot.docs.map((doc) => (doc.data() as Battle));
    callback(battles);
  });
};

export const getBattle = async (activityID: string, battleID: string) => {
  const activityRef = doc(db, "activities", activityID);
  const battleRef = doc(activityRef, "battles", battleID);
  const snapshot = await getDoc(battleRef);
  return snapshot.data() as Battle;
};

export const updateBattleStatus = async (activityID: string, battleID: string, status: Battle["status"]) => {
  const activityRef = doc(db, "activities", activityID);
  const battleRef = doc(activityRef, "battles", battleID);
  await updateDoc(battleRef, { status });
};

export const updateBattleWinner = async (activityID: string, battleID: string, winnerID: string) => {
  const activityRef = doc(db, "activities", activityID);
  const battleRef = doc(activityRef, "battles", battleID);
  await updateDoc(battleRef, { winnerID });
};

export const resetBattle = async (activityID: string, battleID: string) => {
  const activityRef = doc(db, "activities", activityID);
  const battleRef = doc(activityRef, "battles", battleID);
  await updateDoc(battleRef, { winnerID: null, status: "PENDING" });
  const votesRef = collection(battleRef, "votes");
  const snapshot = await getDocs(votesRef);
  // 使用 Promise.all 確保所有刪除操作完成
  await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
};

/////// Vote ////////

export const createVote = async (activityID: string, battleID: string, vote: vote) => {
  const activityRef = doc(db, "activities", activityID);
  const battleRef = doc(activityRef, "battles", battleID);
  const voteRef = doc(battleRef, "votes", vote.memberID);
  await setDoc(voteRef, vote);
};

export const deleteVote = async (activityID: string, battleID: string, memberID: string) => {
  const activityRef = doc(db, "activities", activityID);
  const battleRef = doc(activityRef, "battles", battleID);
  const voteRef = doc(battleRef, "votes", memberID);
  await deleteDoc(voteRef);
};

export const getVotes = async (activityID: string, battleID: string) => {
  const activityRef = doc(db, "activities", activityID);
  const battleRef = doc(activityRef, "battles", battleID);
  const snapshot = await getDocs(collection(battleRef, "votes"));
  return snapshot.docs.map((doc) => doc.data() as vote);
};

// 即時監聽投票變化
export const subscribeToVotes = (activityID: string, battleID: string, callback: (votes: vote[]) => void) => {
  const activityRef = doc(db, "activities", activityID);
  const battleRef = doc(activityRef, "battles", battleID);
  const votesRef = collection(battleRef, "votes");
  const q = query(votesRef, orderBy("timestamp", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const votes = snapshot.docs.map((doc) => doc.data() as vote);
    callback(votes);
  });
};

// 生成邀請碼
export const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// 根據邀請碼查找活動
export const getActivityByInviteCode = async (inviteCode: string) => {
  const activitiesRef = collection(db, "activities");
  const snapshot = await getDocs(activitiesRef);
  const activity = snapshot.docs
    .map((doc) => (doc.data() as Activity))
    .find((activity) => activity.inviteCode === inviteCode);
  return activity || null;
};

export const getMemberName = (members: Member[], memberId: string) => {
  const member = members.find(m => m.id === memberId);
  return member ? member.name : memberId;
};

export const copyInviteLink = (inviteCode: string) => {
  const inviteLink = `${window.location.origin}/join/${inviteCode}`;
  navigator.clipboard.writeText(inviteLink);
  alert('邀請連結已複製到剪貼簿！');
};

export const getVoteCounts = (votes: vote[]) => {
  const counts = { 0: 0, 1: 0, "TIE": 0 };
  votes.forEach(vote => {
      counts[vote.vote]++;
  });
  return counts;
};

export const getWinner = (members: Member[], battle: Battle, voteCounts: { 0: number, 1: number, "TIE": number }) => {
  if (voteCounts[0] > voteCounts[1]) {
      return getMemberName(members, battle.memberIDs[0]);
  } else if (voteCounts[1] > voteCounts[0]) {
      return getMemberName(members, battle.memberIDs[1]);
  } else {
      return "TIE";
  }
};

/////// Seven To Smoke ////////

export const updateSevenToSmokeState = async (activityID: string, state: ActivitySevenToSmoke["sevenToSmokeState"]) => {
  const activityRef = doc(db, "activities", activityID);
  await updateDoc(activityRef, {
    sevenToSmokeState: state
  });
};

export const updateSevenToSmokeConfig = async (activityID: string, config: ActivitySevenToSmoke["sevenToSmokeConfig"]) => {
  const activityRef = doc(db, "activities", activityID);
  await updateDoc(activityRef, {
    sevenToSmokeConfig: config
  });
};

export const initializeSevenToSmokeState = async (activityID: string, memberIDs: string[]) => {
  
  
  const initialState = {
    queue: memberIDs.slice(2),
    onStage: [memberIDs[0] as string, memberIDs[1] as string] as [string, string],
    scores: memberIDs.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
  };
  await updateSevenToSmokeState(activityID, initialState);
};

export const updateSevenToSmokeQueue = async (activityID: string, queue: string[]) => {
  const activityRef = doc(db, "activities", activityID);
  await updateDoc(activityRef, {
    "sevenToSmokeState.queue": queue
  });
};

export const updateSevenToSmokeScores = async (activityID: string, scores: { [memberID: string]: number }) => {
  const activityRef = doc(db, "activities", activityID);
  await updateDoc(activityRef, {
    "sevenToSmokeState.scores": scores
  });
};

export const updateSevenToSmokeOnStage = async (activityID: string, onStage: [string, string]) => {
  const activityRef = doc(db, "activities", activityID);
  await updateDoc(activityRef, {
    "sevenToSmokeState.onStage": onStage
  });
};

export const setSevenToSmokeWinner = async (activityID: string, winnerID: string) => {
  const activityRef = doc(db, "activities", activityID);
  await updateDoc(activityRef, {
    "sevenToSmokeState.winnerID": winnerID
  });
};

export const resetSevenToSmokeState = async (activityID: string) => {
  const activityRef = doc(db, "activities", activityID);
  await updateDoc(activityRef, {
    sevenToSmokeState: {
      queue: [],
      onStage: ['', ''],
      scores: {},
      winnerID: null
    }
  });
};