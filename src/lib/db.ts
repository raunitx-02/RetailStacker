// In-memory mock database for Vercel deployment (since Vercel is read-only)
const globalDb: any = {
  users: [],
  otps: {}
};

export const getDB = () => globalDb;
export const saveDB = (data: any) => {
  // In a real app, save to Postgres/MongoDB here
  globalDb.users = data.users;
  globalDb.otps = data.otps;
};

export const findUser = (email: string) => {
  const db = getDB();
  return db.users.find((u: any) => u.email === email);
};

export const saveUser = (user: any) => {
  const db = getDB();
  const idx = db.users.findIndex((u: any) => u.email === user.email);
  if (idx >= 0) {
    db.users[idx] = { ...db.users[idx], ...user }; // update existing
  } else {
    db.users.push(user); // insert new
  }
  saveDB(db);
};

export const setOtp = (email: string, otp: string) => {
  const db = getDB();
  db.otps[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min
  saveDB(db);
};

export const verifyOtp = (email: string, otp: string) => {
  const db = getDB();
  const record = db.otps[email];
  if (!record) return false;
  if (record.otp === otp && Date.now() < record.expires) {
    delete db.otps[email];
    saveDB(db);
    return true;
  }
  return false;
};
