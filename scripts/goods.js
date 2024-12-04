import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import * as Fire from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import * as Api from "./api.js";

const App = initializeApp(Api.FirebaseConfig);
const Db = Fire.getFirestore(App);
const UsersCollection = Fire.collection(Db, "users");
const GoodsCollection = Fire.collection(Db, "goods");

const CartButton = document.getElementById("CartButton");
const CartContent = document.getElementById("CartContent");
const SaleContainer = document.querySelector(".Sale");

function GenerateItem(ItemData) {
    var Active = false;

    const Item = document.createElement("div");
    SaleContainer.appendChild(Item);

    const Name = document.createElement("header");
    Name.textContent = ItemData.name;
    Item.appendChild(Name);

    const Description = document.createElement("p");
    Description.textContent = ItemData.description;
    Item.appendChild(Description);

    const Price = document.createElement("div");
    Price.classList.add("PriceLabel");
    Price.textContent = `$${ItemData.price}`;
    Item.appendChild(Price);

    if (ItemData.sale) {
        const Sale = document.createElement("a");
        Sale.textContent = `${ItemData.sale}% Off`;
        Price.appendChild(Sale);
    }

    const Timestamp = document.createElement("small");
    Timestamp.textContent = Api.FormatTime(ItemData.timestamp)
    Item.appendChild(Timestamp);

    const AddToCartButton = document.createElement("div");
    AddToCartButton.setAttribute("button", "");
    AddToCartButton.innerHTML = "Add to Cart";
    Item.appendChild(AddToCartButton);

    Item.addEventListener("click", () => {
        Active = !Active;
        
        if (Active) {
            AddToCartButton.style.opacity = "1";
            AddToCartButton.style.pointerEvents = "all";

            Item.style.width = "100%";
            Item.style.height = "85%";
        } else {
            AddToCartButton.style.opacity = "0";
            AddToCartButton.style.pointerEvents = "none";

            Item.style.width = "";
            Item.style.height = "";
        }
    });
}

async function FetchItems() {
    const Items = await Fire.getDocs(GoodsCollection);
    Items.forEach(Item => {
        const Data = Item.data();
        GenerateItem(Data);
    });
}

document.addEventListener("DOMContentLoaded", FetchItems);

const Username = JSON.parse(localStorage.getItem("User")).username;

const UserDocRef = Fire.doc(UsersCollection, Username);
Fire.getDoc(UserDocRef).then((Document) => {
    const UserData = Document.data();
    const CartItems = UserData.cart || [];
    CartContent.innerHTML = `Cart (${CartItems.length > 0 ? CartItems.length : "Empty"})`;
});