// ===============================
// ELEMENTOS
// ===============================
const menu = document.getElementById('menu');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const cartItensContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cartCounter = document.getElementById('cart-count');
const addressInput = document.getElementById('address');
const addressWarn = document.getElementById('address-warn');
const phoneInput = document.getElementById('number');
const spanItem = document.getElementById("date-span");

// ===============================
// CONFIGURAÇÃO
// ===============================
const STORE_PHONE = "5511958385171"; // WhatsApp da loja
let cart = [];

// ===============================
// FORMATAÇÃO TELEFONE (DDD + CEL)
// ===============================
phoneInput.addEventListener("input", () => {
    let value = phoneInput.value.replace(/\D/g, "");

    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
        phoneInput.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
        phoneInput.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else {
        phoneInput.value = value;
    }
});

// ===============================
// ABRIR / FECHAR MODAL
// ===============================
cartBtn.addEventListener("click", () => cartModal.style.display = "flex");
closeModalBtn.addEventListener("click", () => cartModal.style.display = "none");

cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) cartModal.style.display = "none";
});

// ===============================
// ADICIONAR AO CARRINHO
// ===============================
menu.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart-btn");
    if (!btn) return;

    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);

    const item = cart.find(i => i.name === name);
    item ? item.quantity++ : cart.push({ name, price, quantity: 1 });

    updateCartModal();
});

// ===============================
// ATUALIZAR CARRINHO
// ===============================
function updateCartModal() {
    cartItensContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "flex justify-between mb-4 flex-col";

        div.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class="font-medium mt-2">
                        R$ ${(item.price * item.quantity).toFixed(2)}
                    </p>
                </div>
                <button class="remove-from-cart-btn" data-name="${item.name}">
                    Remover
                </button>
            </div>
        `;

        total += item.price * item.quantity;
        cartItensContainer.appendChild(div);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

// ===============================
// REMOVER ITEM
// ===============================
cartItensContainer.addEventListener("click", (e) => {
    if (!e.target.classList.contains("remove-from-cart-btn")) return;

    const name = e.target.dataset.name;
    const index = cart.findIndex(i => i.name === name);

    if (index !== -1) {
        cart[index].quantity > 1 ? cart[index].quantity-- : cart.splice(index, 1);
        updateCartModal();
    }
});

// ===============================
// VALIDAÇÃO ENDEREÇO
// ===============================
addressInput.addEventListener("input", () => {
    if (addressInput.value.trim()) {
        addressWarn.classList.add("hidden");
        addressInput.classList.remove("border-red-500");
    }
});

// ===============================
// HORÁRIO DE FUNCIONAMENTO
// ===============================
function checkRestaurantOpen() {
    const hour = new Date().getHours();
    return hour >= 23 && hour < 23;
}

if (spanItem) {
    spanItem.classList.toggle("bg-green-600", checkRestaurantOpen());
    spanItem.classList.toggle("bg-red-500", !checkRestaurantOpen());
}

// ===============================
// FINALIZAR PEDIDO (WHATSAPP)
// ===============================
checkoutBtn.addEventListener("click", () => {

    if (!checkRestaurantOpen()) {
        alert("Ops! O restaurante está fechado no momento.");
        return;
    }

    if (!cart.length) return;

    if (!addressInput.value.trim()) {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    const customerPhone = phoneInput.value.replace(/\D/g, "");
    if (customerPhone.length < 10) {
        alert("Digite um telefone válido com DDD.");
        return;
    }

    const itemsText = cart.map(i =>
        `• ${i.name} | Qtd: ${i.quantity} | R$ ${(i.price * i.quantity).toFixed(2)}`
    ).join("\n");

    const message = `
📦 *PEDIDO - KING OF BURGERS*

${itemsText}

📍 *Endereço:*
${addressInput.value}

📱 *Telefone do cliente:*
${phoneInput.value}
    `;

    const encodedMessage = encodeURIComponent(message);

    // 🔥 TENTA ABRIR DIRETO NO APP (MOBILE)
    const whatsappApp = `whatsapp://send?phone=${STORE_PHONE}&text=${encodedMessage}`;
    const whatsappWeb = `https://api.whatsapp.com/send?phone=${STORE_PHONE}&text=${encodedMessage}`;

    window.location.href = whatsappApp;

    // 🔁 FALLBACK AUTOMÁTICO PARA WEB
    setTimeout(() => {
        window.open(whatsappWeb, "_blank");
    }, 500);

    cart = [];
    updateCartModal();
    cartModal.style.display = "none";
});
