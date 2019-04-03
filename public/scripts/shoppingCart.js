let user;
let posts;
let numImageSets = 0;
init();

function init() {
    const request = new Request("/api/getCurrentUser");

    fetch(request).then((res) => {
        if (res.status === 401) {
            window.location = "/login";
        } else {
            return res.json();
        }
    }).then((json) => {
        user = json.user;
        posts = json.user.shortlist;
        const signInDiv = document.querySelector("#userInfo");
        signInDiv.removeChild(signInDiv.lastElementChild);

        const a = document.createElement("a");
        a.setAttribute("href", "/pages/userProfile.html");
        const imageContainer = document.createElement("div");
        imageContainer.className = "topBarImageContainer";
        const image = document.createElement("img");
        image.className = "profileImage";
        image.setAttribute("src", user.avatar);
        imageContainer.appendChild(image);
        a.appendChild(imageContainer);
        imageContainer.appendChild(image);
        signInDiv.appendChild(a);
        if (user.shortlist.length === 0) {
            const emptyInfoDiv = document.createElement("div");
            emptyInfoDiv.id = "emptyInformation";
            const text = document.createTextNode("Your shopping cart is currently empty");

            emptyInfoDiv.appendChild(text);
            document.querySelector("#posts").appendChild(emptyInfoDiv);
        } else {
            for (let i = 0; i < posts.length; i++) {
                generatePost(posts[i], user).then((resultDiv) => {
                    document.querySelector("#posts").firstElementChild.before(resultDiv.postDiv);
                    document.querySelector("#posts").firstElementChild.before(resultDiv.label);
                }).catch((error) => {
                    console.log(error);
                });
            }
            const endOfResults = document.createElement("div");
            endOfResults.id = "endOfResults";
            endOfResults.appendChild(document.createTextNode("End of Results"));
            document.querySelector("#posts").appendChild(endOfResults);
        }
    });
}

function generatePost(post, user) {
    const posts = document.querySelector("#posts");
    while (posts.lastElementChild) {
        posts.removeChild(posts.lastElementChild);
    }
    return new Promise((resolve, reject) => {
        fetch("/api/getUser/" + post.seller).then((result) => {
            return result.json();
        }).then((json) => {
            const label = document.createElement("label");
            label.setAttribute("class", "container");
            const input = document.createElement("input");
            input.setAttribute("type", "checkbox");
            input.setAttribute("checked", "checked");
            input.setAttribute("class", "check");
            input.addEventListener("click", updateOrderSummary);
            label.appendChild(input);
            const spanInLabel = document.createElement("span");
            spanInLabel.setAttribute("class", "checkmark");
            label.appendChild(spanInLabel);
            input.checked = false;
            if (!post.byCreditCard) {
                input.disabled = true;
            }

            const seller = json;
            const postDiv = document.createElement("div");
            postDiv.className = "post";

            const sellerProfilePhoto = document.createElement("img");
            sellerProfilePhoto.className = "profilePhoto";
            sellerProfilePhoto.setAttribute("src", seller.avatar);
            sellerProfilePhoto.setAttribute("alt", "sellerPhoto");

            const sellerNameSpan = document.createElement("span");
            sellerNameSpan.className = "userName";
            sellerNameSpan.appendChild(document.createTextNode(seller.firstName + " " + seller.lastName));

            postDiv.appendChild(sellerProfilePhoto);
            postDiv.appendChild(sellerNameSpan);
            postDiv.appendChild(document.createElement("br"));

            postDiv.id = post._id;

            const categorySpan = document.createElement("span");
            categorySpan.className = "category";
            categorySpan.appendChild(document.createTextNode("Title: " + post.title));
            postDiv.appendChild(categorySpan);

            const conditionSpan = document.createElement("span");
            conditionSpan.className = "condition";
            conditionSpan.appendChild(document.createTextNode("Condition: " + post.condition));
            postDiv.appendChild(conditionSpan);

            const timeSpan = document.createElement("span");
            timeSpan.className = "timespan";
            const date = new Date(post.postingDate);
            timeSpan.appendChild(document.createTextNode("Posting Time: " +
                +date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ` ${date.getHours()}:${date.getMinutes()}`));
            postDiv.appendChild(timeSpan);

            const priceDiv = document.createElement("div");
            priceDiv.className = "price";
            priceDiv.appendChild(document.createTextNode("CAD " + post.price));
            postDiv.appendChild(priceDiv);

            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "description";
            descriptionDiv.appendChild(document.createTextNode(post.description));
            postDiv.appendChild(descriptionDiv);

            if (post.image.length > 0) {
                const pictureContainer = document.createElement("div");
                const lightboxAttr = `pictureSet${numImageSets}`;
                for (let k = 0; k < post.image.length; k++) {
                    const a = document.createElement("a");
                    a.setAttribute("href", "/" + post.image[k]);
                    a.setAttribute("data-lightbox", lightboxAttr);
                    const image = document.createElement("img");
                    image.className = "itemPicture";
                    image.setAttribute("src", "/" + post.image[k]);
                    a.appendChild(image);
                    pictureContainer.appendChild(a);
                }
                postDiv.appendChild(pictureContainer);
            }
            numImageSets++;

            postDiv.appendChild(document.createElement("hr"));

            const contactSeller = document.createElement("button");
            contactSeller.className = "contactSeller";
            contactSeller.addEventListener("click", contactTheSeller);
            contactSeller.appendChild(document.createTextNode("Contact Seller"));

            const removeButton = document.createElement("button");
            removeButton.className="removeFromCart";
            removeButton.appendChild(document.createTextNode("Remove from Cart"));
            removeButton.addEventListener("click", removeFromCart);
            postDiv.appendChild(removeButton);

            if (!post.byCreditCard) {
                const canNotProcess = document.createElement("button");
                canNotProcess.className="canNotProcess";
                canNotProcess.appendChild(document.createTextNode("You have to contact seller to buy this item."));
                canNotProcess.disabled = true;
                postDiv.appendChild(canNotProcess);
            }
            resolve({label: label, postDiv: postDiv});
        });
    });
}

/*********************** Chat Box ************************/

const chat = document.querySelector('#chat');
const sendButton = document.querySelector("#sendButton");
sendButton.addEventListener('click', sendMessage);

function sendMessage(e) {
    e.preventDefault();

    if (e.target.classList.contains("submit")) {
        const message = document.querySelector("#messageBox").value;
        if (message.length > 0 && message.length < 200) {
            addMessage(message);
        }
    }
    chat.scrollTop = chat.scrollHeight;
}


// helper function for sendMessage, add message to chat window
function addMessage(msg) {
    const newMessage = document.createElement('p');
    newMessage.className = "chatOutText";
    newMessage.innerText = msg;
    const bubble = document.createElement('div');
    bubble.className = "chatOutBubble";
    bubble.appendChild(newMessage);
    const messageContainer = document.createElement('div');
    messageContainer.appendChild(bubble);
    chat.appendChild(messageContainer);
}

/*********************** Contact Seller by User "user" ************************/

// Show / Hide chatbox
const chatShow = document.querySelector("#chatShow");
const chatHide = document.querySelector("#chatHide");
chatHide.addEventListener('click', hideChatRoom);
chatShow.addEventListener('click', showChatRoom);

function showChatRoom(e) {
    e.preventDefault();
    const chatRoom = document.querySelector('#chatRoom');
    chatRoom.style.display = "block";
}

function hideChatRoom(e) {
    e.preventDefault();
    const chatRoom = document.querySelector('#chatRoom');
    chatRoom.style.display = "none";
}

function contactTheSeller(e) {
    e.preventDefault();

    const postId = e.target.parentElement.id;

    const postRequest = new Request(`/api/findSeller/${postId}`, {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    });

    fetch(postRequest).then((res) => {
        if (res.status === 200) {
            return res.json();
        }else if (res.status === 401) {
            window.location = '/login';
        } else {
            window.alert("Seller not found.");
        }
    }).then((json) => {
        const keyword = json.username;

        if(keyword === thisUser){
            window.alert("This is your item.");
            return;
        }

        // find if the user to chat exists
        const newChat = {
            user1: thisUser,
            user2: keyword
        };

        const request = new Request("/api/createChat", {
            method: 'post',
            body: JSON.stringify(newChat),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        });
        fetch(request).then((res2) => {
            if (res2.status === 200) {
                return res2.json();
            }
        }).then((json) => {

            loadChatHistory(json);
            // set up chat box
            const chatName = document.querySelector('#chatName');
            chatName.innerText = keyword;
            const chatRoom = document.querySelector('#chatRoom');
            chatRoom.style.display = "block";
        })
    })
}

/*********************** Select Books for Checkout ************************/


function updateOrderSummary(e) {
    const orderSummary = document.getElementById("checkout");
    const h4 = orderSummary.getElementsByTagName("h4")[0];
    const spanCount = h4.getElementsByTagName("span")[0];
    const count = spanCount.getElementsByTagName("b")[0];
    count.innerText = 0;
    const summary = document.getElementById("summary");
    const costSpan = summary.getElementsByTagName("span")[0];
    const cost = costSpan.getElementsByTagName("b")[0];
    cost.innerText = "$0.00";

    const books = document.getElementsByClassName("book");
    const len = books.length;
    for (let c = 0; c < len; c++) {
        orderSummary.removeChild(books[0]);
    }
    let sum = 0;
    let curCount = 0;
    const bookDivs = Array.from(document.querySelectorAll(".post"));
    const boosIdsInOrderOfDOM = bookDivs.map((post) => {return post.id});
    for (let i = 0; i<posts.length;i++) {
        const checkboxes = document.getElementsByClassName("check");
        if (checkboxes[i].checked) {
            const book = document.createElement("p");
            book.setAttribute("class", "book");
            const spanElement = document.createElement("span");
            spanElement.setAttribute("class", "amount");
            const bElement = document.createElement("b");

            const thisId = boosIdsInOrderOfDOM[i];
            let index = 0;
            for (let i = 0 ; i < posts.length; i++) {
                if (posts[i]._id === thisId) {
                    index = i;
                }
            }

            bElement.appendChild(document.createTextNode(`$${posts[index].price}`));
            spanElement.appendChild(bElement);
            book.appendChild(document.createTextNode(`${posts[index].title}`));
            book.appendChild(spanElement);
            const hrElement = document.getElementsByTagName("hr");
            hrElement[hrElement.length-1].before(book);
            sum += parseFloat(posts[index].price);
            curCount++;
        }
    }
    count.innerText = curCount;
    document.querySelector("#sum").innerHTML = "";
    document.querySelector("#sum").innerHTML = "$" + sum;

}

/*********************** Place the Order ************************/

// Jump to the payment page
const placeOrder = document.querySelector("#payButton");
placeOrder.addEventListener("click", jumpToPayment);

function jumpToPayment(e) {
    //Store the transaction info in localstorage,
    //The actual server call happen in the payment page.
    localStorage.buyer = user.username;

    document.location = "../pages/payment.html";
}

function removeFromCart(e) {
    const postId = e.target.parentElement.id;
    const request = new Request("/api/removeFromCart/" + postId, {
        method: 'delete',
    });
    fetch(request).then((newUser) => {
        if (newUser.status === 401) {
            window.location = '/login';
        } else {
            return newUser.json();
        }
    }).then((newUser) => {
        updateShoppingCart(newUser.newUser.shortlist.length);
        //Change the button to remove the item from shopping cart.
        e.target.className = "addToCart";
        e.target.innerHTML = "";
        e.target.appendChild(document.createTextNode("Add to Cart"));
        e.target.removeEventListener("click", removeFromCart);
        e.target.addEventListener("click", addToCart);
        user = newUser.newUser;
    });
}

function updateShoppingCart(newNumber) {
    const shoppingCartNumber = document.querySelector("#cartNumber");
    shoppingCartNumber.innerText = newNumber;
}