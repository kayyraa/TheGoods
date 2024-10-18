import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import * as Fire from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import * as Api from "./api.js";

const App = initializeApp(Api.FirebaseConfig);
const Db = Fire.getFirestore(App);
const UsersCollection = Fire.collection(Db, "users");

const IsLoggedIn = localStorage.getItem("User");
const UsernameInput = document.getElementById("UsernameInput");
const PasswordInput = document.getElementById("PasswordInput");
const SubmitButton = document.getElementById("SubmitButton");

if (!IsLoggedIn && document.title !== "Account") {
    location.href = "../account.html";
}

if (UsernameInput && PasswordInput && SubmitButton) {
    SubmitButton.addEventListener("click", async () => {
        const Username = UsernameInput.value;
        const Password = PasswordInput.value;

        if (!Username || !Password) return;

        const UserDocRef = Fire.doc(UsersCollection, Username);
        const UserDoc = await Fire.getDoc(UserDocRef);

        if (!UserDoc.exists()) {
            const UserData = {
                username: Username,
                timestamp: Math.floor(Date.now() / 1000),
                cart: [],
                password: Password
            };

            await Fire.setDoc(UserDocRef, UserData);
            
            localStorage.setItem("User", JSON.stringify(UserData));
            location.href = "../index.html";
            return;
        }

        const UserData = UserDoc.data();

        if (UserData.password !== Password) return;

        localStorage.setItem("User", JSON.stringify(UserData));
        location.href = "../index.html";
    });
}