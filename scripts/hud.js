document.querySelectorAll("img").forEach(Image => Image.draggable = false);

document.querySelectorAll("[sync]").forEach(Node => {
    const Parts = Node.getAttribute("sync").split(":");
    const Target = document.querySelector(Parts[1]);

    const Padding = Node.getAttribute("padding"); 
    if (!Target) return;

    Node.style[Parts[0]] = `${Padding ? Target[Parts[2]] + parseFloat(Padding) : Target[Parts[2]]}${Parts[3]}`;
});

localStorage.getItem("LastFrame") ? SwitchFrame(localStorage.getItem("LastFrame")) : localStorage.setItem("LastFrame", "Home");-
HideDropdown();

const Transactions = localStorage.getItem("Transactions");
if (Transactions) {
    const Parsed = JSON.parse(Transactions);
    Parsed.forEach((Transaction, Index) => {
        const Node = document.createElement("div");
        Node.innerHTML = `
            <span style="
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
            ">${Transaction[0]}</span>
            <span style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);

                min-width: 4em;
                max-width: 4em;
                text-align: center;

                background-color: rgb(90, 140, 90);
                padding: 2px 8px;
                border-radius: 8px;
            ">${Transaction[1]}</span>
            <span style="
                position: absolute;

                top: 50%;
                right: 8px;
                transform: translateY(-50%);

                opacity: 0.5;
                font-weight: 600;
            ">${Transaction[2]}</span>
        `;
        Node.setAttribute("style", `
            position: relative;
            background-color: rgba(255, 255, 255, 0.125);

            border-radius: 8px;

            padding: 0 8px;
            font-weight: 600;
            
            width: calc(100% - 1em);
            height: 2em;

            order: ${Index};
        `);
        TransactionHistory.appendChild(Node);
    });
}

Buttons.Claim.addEventListener("click", async () => {
    if (Buttons.Claim.hasAttribute("disabled")) return;
    const User = JSON.parse(localStorage.getItem("User"));
    const UserDocuments = await new FireStorage("Users").GetDocumentsByField("Username", User.Username);
    const UserDocument = UserDocuments[0];

    let LastClaimTime = parseInt(UserDocument.LastClaim);
    let CurrentTime = Math.floor(Date.now() / 1000);
    const TimeDifference = Math.abs(LastClaimTime - CurrentTime);

    if (TimeDifference < 86400) {
        Buttons.Claim.setAttribute("disabled", "disabled");

        function Update() {
            const RemainingTime = (LastClaimTime + 86400) - Math.floor(Date.now() / 1000);
            Buttons.Claim.innerHTML = new Format(RemainingTime).ConvertEpochToReadable("hh:mm:ss");

            requestAnimationFrame(Update);
        }
        requestAnimationFrame(Update);

        return;
    }

    const WalletParts = UserDocument.Wallet.split("-");
    const NewWalletAmount = `${parseFloat(WalletParts[0]) + 10}-${WalletParts[1]}`;

    await new FireStorage("Users").UpdateDocument(UserDocument.id, {
        LastClaim: CurrentTime,
        Wallet: NewWalletAmount
    });

    const TransactionHistory = JSON.parse(localStorage.getItem("Transactions")) || [];
    TransactionHistory.push(["CLAIM", `${parseFloat(NumberInput.value).toFixed(2)}$`, new Format(Math.floor(Date.now() / 1000)).ConvertEpochToReadable("dd.mm.yyyy")]);
    localStorage.setItem("Transactions", JSON.stringify(TransactionHistory));
    location.reload();
});

Buttons.Send.addEventListener("click", async () => {
    const User = JSON.parse(localStorage.getItem("User"));
    const UserDocuments = await new FireStorage("Users").GetDocumentsByField("Username", User.Username);
    const UserDocument = UserDocuments[0];

    const SendPrompt = new Prompt({
        Title: "Send",
        Nodes: []
    }).Append();

    SendPrompt.querySelector(".Content").style.width = "calc(100% - 1em)";
    SendPrompt.querySelector(".Content").innerHTML = `
        <header>Send</header>
        <input type="text" placeholder="Recipient's Wallet ID">
        <input type="text" number placeholder="Amount">
        <button>Place Transaction</button>
    `;

    const NumberInput = SendPrompt.querySelector(".Content").querySelector("input[number]");
    SendPrompt.querySelector(".Content").querySelector("button").addEventListener("click", async () => {
        if (!SendPrompt.querySelector(".Content").querySelector("input").value) return;
        const RecipientDocuments = await new FireStorage("Users").GetDocumentsByField("WalletId", SendPrompt.querySelector(".Content").querySelector("input").value);
        const RecipientDocument = RecipientDocuments[0];
        if (!RecipientDocument) return;
        if (!NumberInput.value || isNaN(NumberInput.value) || !isFinite(NumberInput.value)) return;

        const WalletParts = UserDocument.Wallet.split("-");
        const NewUserWallet= `${parseFloat(WalletParts[0]) - parseFloat(NumberInput.value)}-${WalletParts[1]}`;
        const NewRecipientWallet = `${parseFloat(RecipientDocument.Wallet.split("-")[0]) + parseFloat(NumberInput.value)}-${RecipientDocument.Wallet.split("-")[1]}`;
        
        const TransactionHistory = JSON.parse(localStorage.getItem("Transactions")) || [];
        TransactionHistory.push(["SEND", `${parseFloat(NumberInput.value).toFixed(2)}$`, new Format(Math.floor(Date.now() / 1000)).ConvertEpochToReadable("dd.mm.yyyy")]);
        localStorage.setItem("Transactions", JSON.stringify(TransactionHistory));

        await new FireStorage("Users").UpdateDocument(RecipientDocument.id, { Wallet: NewRecipientWallet });
        await new FireStorage("Users").UpdateDocument(UserDocument.id, { Wallet: NewUserWallet });

        location.reload();
    });
});

new FireStorage("Items").GetDocuments().then((Documents) => {
    Documents.forEach((Document) => {
        const Node = document.createElement("div");
        Node.innerHTML = `
            <img src="${Document.Images[0]}">
            <span class="Name">${Document.Name}</span>
            <span class="Price">${parseFloat(Document.Price).toFixed(2)}${Document.Price[Document.Price.length - 1]}</span>
            ${Document.Offer ? `
                <span class="Offer">${Document.Offer}</span>
            ` : ""}
        `;
        Discover.appendChild(Node);
    });
});

if (localStorage.getItem("User")) {
    const UserDocuments = await new FireStorage("Users").GetDocumentsByField("Username", JSON.parse(localStorage.getItem("User")).Username);
    const UserDocument = UserDocuments[0];
    Buttons.Wallet.forEach(Node => Node.querySelector("header").innerHTML = new Format(UserDocument.Wallet).ConvertToCurrencyReadable());
}

Buttons.Wallet[0].addEventListener("click", () => SwitchFrame("Wallet"));
Buttons.ReturnHome.addEventListener("click", () => SwitchFrame("Home"));