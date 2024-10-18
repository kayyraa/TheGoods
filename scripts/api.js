export const FirebaseConfig = {
    apiKey: "AIzaSyAwaCl4GmRPxoP4xkYdjsksFL15NzK8xWs",
    authDomain: "thegoods-3e516.firebaseapp.com",
    projectId: "thegoods-3e516",
    storageBucket: "thegoods-3e516.appspot.com",
    messagingSenderId: "166367603510",
    appId: "1:166367603510:web:6fb24d4224668c7ed82197",
    measurementId: "G-9Q9MYSKLT9"
};

export function FormatTime(EpochTime) {
    const DateObj = new Date(EpochTime * 1000);
    const Day = String(DateObj.getDate()).padStart(2, '0');
    const Month = String(DateObj.getMonth() + 1).padStart(2, '0');
    const Year = DateObj.getFullYear();
    const Hours = String(DateObj.getHours()).padStart(2, '0');
    const Minutes = String(DateObj.getMinutes()).padStart(2, '0');

    return `${Day}.${Month}.${Year} ${Hours}:${Minutes}`;
}