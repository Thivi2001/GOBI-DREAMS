// Base URL for the backend API
const API_BASE_URL = "http://localhost:5000/api";



// Load services
const services = [
    { id: 1, name: "Wedding Photography :  ", description: " Capture your special day.  ", price: 10000, image: "images/image1.jpg" },
    { id: 2, name: "Pre-Wedding Shoot ", description: "Memorable pre-wedding moments.", price: 8000, image: "images/image2.jpg" },
    { id: 3, name: "Reception Photography", description: "Cherish your reception memories.", price: 9000, image: "images/image3.jpg" },
    { id: 4, name: "Birthday Photography", description: "Celebrate your birthday moments.", price: 5000, image: "images/image4.jpg" },
    { id: 5, name: "Out-Door Photography", description: "Capture outdoor adventures.", price: 7000, image: "images/image5.jpg" },
    { id: 6, name: "Puberty Ceremony Photography", description: "Special moments of growth.", price: 6000, image: "images/image6.jpg" },
    { id: 7, name: "Casual Photography", description: "Everyday moments captured.", price: 4000, image: "images/image7.jpg" },
    { id: 8, name: "Wild-Life Photography", description: "Explore the wild through photos.", price: 12000, image: "images/image8.jpg" },
];


let selectedService = null;
let additionalServices = [];

let externalPhotographers = [];
let selectedExternalPhotographer = null;
let photographerFee = 0;


let totalAmount = 0;

// Handle user signup
async function signup() {
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const phone = document.getElementById("signup-phone").value.trim();
    const address = document.getElementById("signup-address").value.trim();

    if (!name || !email || !password || !phone || !address) {
        alert("Please fill in all fields.");
        return;
    }

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    } else if (password.length < 6) {
        alert("Password must be at least 8 characters long.");
        return;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).+$/.test(password)) {
        alert("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*()).");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, phone, address }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = "login.html";
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert("Error signing up. Please try again.");
    }
}

// Handle user login
async function login() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    } else if (password.length < 6) {
        alert("Password must be at least 8 characters long.");
        return;
    }


    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("role", data.role);
            if (data.role === "admin") {
                localStorage.setItem('isAdmin', 'true')
            } else {
                localStorage.setItem('isAdmin', 'false')
            }

            alert(`Welcome, ${data.name}!`);
            window.location.href = "index.html";
        } else {
            alert(data.message);
        }


    } catch (error) {
        alert("Error logging in. Please try again.");
    }
}

async function loadExternalphotographers() {
    try {
        const response = await fetch(`${API_BASE_URL}/photographers`);
        const photographers = await response.json();
        externalPhotographers = photographers.map((photographer) => ({
            id: photographer.id,
            name: photographer.name
        }));
    } catch (error) {
        console.error("Error loading photographers:", error);
    }
}

async function loadAvailableExternalphotographers() {
    const bookingDate = document.getElementById("booking-date").value;
    if (!bookingDate) return;

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const bookings = await response.json();
        const bookedPhotographers = bookings
            .filter(b => b.bookingDate === bookingDate)
            .map(b => b.photographerId);

        const availablePhotographers = externalPhotographers.filter((photographer) => {
            return !bookedPhotographers.includes(photographer.id);
        });

        externalPhotographers = availablePhotographers;
    } catch (error) {
        console.error("Error filtering photographers:", error);
    }
}

function populatePhotographerDropdown() {
    const dropdown = document.getElementById("external-photographer");

    if (externalPhotographers.length === 0) {
        dropdown.innerHTML = `<option value="">No external photographers available</option>`;
        return;
    }

    dropdown.innerHTML = `<option value="">Select a photographer</option>`;
    externalPhotographers.forEach((photographer) => {
        dropdown.innerHTML += `<option value="${photographer.id}">${photographer.name}</option>`;
    });
}

function setupDateChangeListener() {
    const dateInput = document.getElementById("booking-date");
    dateInput.addEventListener("change", async function () {
        // Remove photographer fee if previously selected
        try {
            if (selectedExternalPhotographer) {

                let totalAmountRef = parseInt(localStorage.getItem('totalAmount'));
                totalAmountRef -= photographerFee;
                photographerFee = 0;
                selectedExternalPhotographer = null;
                totalAmount = totalAmountRef;
                document.getElementById("total-amount").innerText = `Total Amount: $${totalAmountRef}`;
                localStorage.setItem('totalAmount', totalAmountRef);
            }


        } catch (error) {
            console.error("Error removing photographer fee:", error);
        }

        await loadExternalphotographers();
        await loadAvailableExternalphotographers();
        populatePhotographerDropdown();
    });
}

// Load projects
async function loadProjects() {
    const container = document.getElementById("project-container");
    container.innerHTML = ""; // Clear the container

    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();

        projects.forEach((project) => {
            const projectCard = document.createElement("div");
            projectCard.className = "project-card";

            projectCard.innerHTML = `
                <img src="data:image/jpeg;base64,${project.image}" alt="${project.name}">
                <h3>${project.name}</h3>
                <p>Completed for: ${project.user}</p>
                <p>Rating: ${project.rating || 0}/5</p>
                ${isAdmin() ? `
                    <button onclick="editProject(${project.id})">Edit</button>
                    <button onclick="deleteProject(${project.id})">Delete</button>
                ` : `
                    <div class="rate-project">
                        <label for="rating-${project.id}">Rate this project:</label>
                        <input type="number" id="rating-${project.id}" min="1" max="5">
                        <button onclick="rateProject(${project.id})">Submit</button>
                    </div>
                `}
            `;

            container.appendChild(projectCard);
        });
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

// Add a new project
async function addProject() {
    const nameInput = document.getElementById("projectName");
    const userInput = document.getElementById("userName");
    const fileInput = document.getElementById("imageFile");
    const file = fileInput.files[0];

    if (!nameInput.value || !userInput.value || !file) {
        alert("Please fill in all fields.");
        return;
    }

    const formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("user", userInput.value);
    formData.append("image", file);
    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,

            },
            body: formData,
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            loadProjects();
        } else {
            alert(data.message || "Error adding project.");
        }
    } catch (error) {
        console.error("Error adding project:", error);
        alert("Error adding project.");
    }
}


// Delete a project
async function deleteProject(index) {
    if (confirm("Are you sure to delete this project?")) {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${index}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                loadProjects();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Error deleting project. Please try again.");
        }
    }
}

// Submit feedback
async function submitFeedback(index) {
    const ratingInput = document.getElementById(`rate-${index}`);
    const feedbackInput = document.getElementById(`feedback-${index}`);
    const rating = parseInt(ratingInput.value);
    const feedback = feedbackInput.value.trim();

    if ((rating >= 1 && rating <= 5) || feedback) {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${index}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
                body: JSON.stringify({ rating, feedback }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                loadProjects();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Error submitting feedback. Please try again.");
        }
    } else {
        alert("Please enter a rating (1-5) or a comment.");
    }
}


function loadServices() {
    try {
        const container = document.getElementById("services-container");
        container.innerHTML = "";

        services.forEach((service) => {
            const serviceCard = document.createElement("div");
            serviceCard.className = "service-card";

            serviceCard.innerHTML = `
      <img src="${service.image}" alt="${service.name}">
      <div style="display: flex; flex-direction: column; align-items: start; gap: 10px;">
      <h3>${service.name}</h3>
      <p>${service.description}</p>
      <p>Price: LKR ${service.price}</p>
      <button onclick="bookService(${service.id})">Book Now</button>
      </div>
    `;

            container.appendChild(serviceCard);
        });

    } catch (e) {
        console.error("Error loading services:", e);
    }
    console.log("Loading services...");


}

function bookService(serviceId) {

    const selectedService = services.find((service) => service.id === serviceId);
    localStorage.setItem("selectedService", JSON.stringify(selectedService));

    let additionalServices = [];
    let totalAmount = selectedService.price;
    localStorage.setItem('totalAmount', totalAmount);
    selectedExternalPhotographer = null;
    photographerFee = 0;

    // Reset UI
    document.getElementById("booked-service").innerText = `Service: ${selectedService.name}`;
    document.getElementById("service-amount").innerText = `Amount: $${selectedService.price}`;
    document.getElementById("total-amount").innerText = `Total Amount: $${totalAmount}`;
    document.getElementById("booking-date").value = "";

    // Populate Additional Services Dropdown
    const additionalDropdown = document.getElementById("additional-service");
    additionalDropdown.innerHTML = `<option value="">Select a service</option>`;
    services.forEach((service) => {
        if (service.id !== selectedService.id) {
            additionalDropdown.innerHTML += `<option value="${service.id}">${service.name} - $${service.price}</option>`;
        }
    });

    additionalDropdown.onchange = function () {


        const selectedId = parseInt(this.value);
        if (!selectedId) {
            if (additionalServices.length > 0) {
                const previousService = services.find((s) => s.id === additionalServices[0]);
                totalAmount -= previousService.price;
                additionalServices.pop();
                document.getElementById("total-amount").innerText = `Total Amount: $${totalAmount}`;
                localStorage.setItem('totalAmount', totalAmount);
            }
            return
        };

        const additional = services.find((s) => s.id === selectedId);
        if (additional && !additionalServices.includes(selectedId) && additionalServices.length === 0) {
            additionalServices.push(selectedId);
            totalAmount += additional.price;
            document.getElementById("total-amount").innerText = `Total Amount: $${totalAmount}`;
            localStorage.setItem('totalAmount', totalAmount);
        } else if (additional && !additionalServices.includes(selectedId) && additionalServices.length > 0) {
            const previousService = services.find((s) => s.id === additionalServices[0]);
            totalAmount -= previousService.price;
            totalAmount += additional.price;
            additionalServices.pop();
            additionalServices.push(selectedId);
            document.getElementById("total-amount").innerText = `Total Amount: $${totalAmount}`;
            localStorage.setItem('totalAmount', totalAmount);
        }
    };

    // Photographer dropdown listener
    const photographersDropdown = document.getElementById("external-photographer");
    photographersDropdown.onchange = function () {



        const selectedId = parseInt(this.value);


        if (selectedId && selectedExternalPhotographer !== selectedId) {
            if (!selectedExternalPhotographer) {
                photographerFee = 3000;
                totalAmount = parseInt(localStorage.getItem('totalAmount'));
                totalAmount += photographerFee;

            }
            selectedExternalPhotographer = selectedId;
        } else {
            if (selectedExternalPhotographer) {
                totalAmount -= photographerFee;
                photographerFee = 0;
                selectedExternalPhotographer = null;
            }
        }

        document.getElementById("total-amount").innerText = `Total Amount: $${totalAmount}`;
        localStorage.setItem('totalAmount', totalAmount);


    };

    // Setup listener for date changes
    setupDateChangeListener();

    // Show popup
    document.getElementById("booking-popup").classList.remove("hidden");
}


function addAdditionalService() {
    const additionalServiceId = parseInt(document.getElementById("additional-service").value);
    if (!additionalServiceId) return;

    const additionalService = services.find((service) => service.id === additionalServiceId);
    additionalServices.push(additionalService);
    totalAmount += additionalService.price;

    document.getElementById("total-amount").innerText = `Total Amount: $${totalAmount}`;
}

function checkout() {
    const bookingDate = document.getElementById("booking-date").value;

    if (!bookingDate) {
        alert("Please select a booking date.");
        return;
    }

    const dateObj = new Date(bookingDate); // Convert string to Date object
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if bookingDate is before today
    if (dateObj < today) {
        alert("Booking date cannot be in the past.");
        return;
    }

    // Store date in localStorage for later use
    localStorage.setItem("bookingDate", bookingDate);

    document.getElementById("booking-popup").classList.add("hidden");
    document.getElementById("payment-popup").classList.remove("hidden");
}

function closePopup1() {
    populatePhotographerDropdown();
    document.getElementById("booking-popup").classList.add("hidden");
}

function closePopup2() {
    populatePhotographerDropdown();
    document.getElementById("payment-popup").classList.add("hidden");
}

function closePaymentPopup() {
    document.getElementById("payment-popup").classList.add("hidden");
}

async function processPayment() {
    const cardName = document.getElementById("card-name").value;
    const cardNumber = document.getElementById("card-number").value;
    const expiryDate = document.getElementById("expiry-date").value;
    const cvv = document.getElementById("cvv").value;


    const externalPhotographer = document.getElementById("external-photographer").value;
    const additionalService = document.getElementById("additional-service").value;
    const service = JSON.parse(localStorage.getItem("selectedService"));
    const bookingDate = localStorage.getItem("bookingDate");


    const dateObj = new Date(bookingDate); // Retrieve the date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if bookingDate is before today
    if (dateObj < today) {
        alert("Booking date cannot be in the past.");
        return;
    }
    console.log("externalPhotographer", externalPhotographer);
    console.log("additionalService", additionalService);
    console.log("service", service);
    console.log("totalAmount", totalAmount);

    if (!cardName || !cardNumber || !expiryDate || !cvv) {
        alert("Please fill in all payment details.");
        return;
    } else if (!/^[0-9]{16}$/.test(cardNumber)) {
        alert("Please enter a valid card number.");
        return;
    } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/.test(expiryDate)) {
        alert("Please enter a valid expiry date (MM/YY).");
        return;
    } else if (!/^[0-9]{3}$/.test(cvv)) {
        alert("Please enter a valid CVV.");
        return;
    }

    if (!bookingDate) {
        alert("Booking date is missing.");
        return;
    }

    try {

        const addService = parseInt(additionalService);
        const paymentData = {
            serviceId: service.id,
            additionalServices: (addService || 0),
            photographerId: (externalPhotographer || 0),
            totalAmount: parseInt(localStorage.getItem('totalAmount')),
            bookingDate: dateObj.toISOString(), // Include the date
        }

        document.getElementById("card-name").innerHTML = ""
        document.getElementById("card-number").innerHTML = ""
        document.getElementById("cvv").innerHTML = ""
        document.getElementById("expiry-date").innerHTML = ""

        console.log("payment", paymentData);

        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify(paymentData),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Payment Successful!");
            closePaymentPopup();
            loadServices();

        } else {
            alert("Payment failed!");
            closePaymentPopup();
        }
    } catch (error) {
        alert("Payment failed!");
        closePaymentPopup();
    }

}

// Check if the user is an admin
function isAdmin() {


    return sessionStorage.getItem("role") === "admin"; // Check if the user is an admin
}

function toggleAdminFeatures() {
    try {
        const adminForm = document.getElementById("admin-form");
        adminForm.style.display = isAdmin() ? "block" : "none"; // Show admin form for admins only
    } catch (e) {
        console.error("Error toggling admin features:", e);
    }

}


// Load photographers for users
async function loadPhotographers() {

    try {
        const container = document.getElementById("photographers-container");
        container.innerHTML = ""; // Clear the container

        const response = await fetch(`${API_BASE_URL}/photographers`);
        const photographers = await response.json();

        photographers.forEach((photographer) => {
            const photographerCard = document.createElement("div");
            photographerCard.className = "photographer-card";

            photographerCard.innerHTML = `
                <img src="data:image/jpeg;base64,${photographer.image}" alt="${photographer.name}">
                <h3>${photographer.name}</h3>
                <h3>${photographer.description}</h3>
                ${isAdmin() ? `
                    <button onclick="editPhotographer(${photographer.id})">Edit</button>
                    <button onclick="deletePhotographer(${photographer.id})">Delete</button>
                ` : ""}
            `;

            container.appendChild(photographerCard);
        });

        const adminForm = document.getElementById("admin-photographer-form");
        adminForm.style.display = isAdmin() ? "block" : "none";
    } catch (error) {
        console.error("Error loading photographers:", error);
    }
}

// Add a new photographer
async function addPhotographer() {
    const nameInput = document.getElementById("photographerName");
    const description = document.getElementById("description");
    const fileInput = document.getElementById("photographerImage");

    const file = fileInput.files[0];

    if (!nameInput.value || !file) {
        alert("Please provide a name and an image.");
        return;
    }

    const formData = new FormData();
    formData.append('name', nameInput.value);
    formData.append('image', file);
    formData.append('description', description.value);

    try {


        const response = await fetch(`${API_BASE_URL}/photographers`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            try {
                loadPhotographers();
            } catch (editPhotographer) {
                console.error("Error editing photographer:", editPhotographer);
            }

        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error adding photographer:", error);
    }
}

// Edit photographer (show prompt and send PUT request)
async function editPhotographer(id) {
    let newName = prompt("Enter new name for the photographer:");
    if (newName === null) {
        newName = ""; // Default to empty string if cancelled
    }; // Cancelled

    let newDescription = prompt("Enter new description for the photographer:");
    if (newDescription === null) {
        newDescription = ""; // Default to empty string if cancelled
    }; // Cancelled

    try {
        const response = await fetch(`${API_BASE_URL}/photographers/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({ name: newName, description: newDescription }),
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            loadPhotographers();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error editing photographer:", error);
    }
}


// Delete photographer
async function deletePhotographer(id) {
    if (!confirm("Are you sure you want to delete this photographer?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/photographers/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            loadPhotographers();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error deleting photographer:", error);
    }
}


// Window onload handler
window.onload = function () {
    toggleAdminFeatures();
    loadProjects();
    loadServices();
    loadExternalphotographers();
    loadPhotographers();
    loadBookings();
};

async function rateProject(projectId) {
    const ratingInput = document.getElementById(`rating-${projectId}`);
    const rating = parseInt(ratingInput.value);

    if (!rating || rating < 1 || rating > 5) {
        alert("Please enter a valid rating between 1 and 5.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/rate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({ rating }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            loadProjects();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error rating project:", error);
    }
}



document.addEventListener('DOMContentLoaded', function() {
    toggleAdminFeatures();
    if (localStorage.getItem('isAdmin') === 'true') {
        const navbar = document.querySelector('.navbar');
        if (navbar && !navbar.querySelector('#bookings-link')) {
            const bookingsLink = document.createElement('a');
            bookingsLink.href = 'bookings.html';
            bookingsLink.id = 'bookings-link';
            bookingsLink.textContent = 'Bookings';
            navbar.appendChild(bookingsLink);
        }
    }

    // Add click handler for booking report link (if present)
    const reportLink = document.getElementById('booking-report-link');
    if (reportLink) {
        reportLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('http://localhost:5000/api/report/bookings-report', '_blank');
        });
    }

    // --- Bookings page logic ---
    // Only run this if we're on bookings.html
    if (window.location.pathname.endsWith('bookings.html')) {
        // Only allow admin
        if (localStorage.getItem('isAdmin') !== 'true') {
            window.location.href = 'index.html';
            return;
        }

        const tableBody = document.querySelector('#bookings-table tbody');
        const printBtn = document.getElementById('print-report-btn');

        // Fetch all bookings
        async function loadBookings() {
            tableBody.innerHTML = '';
            const res = await fetch('http://localhost:5000/api/bookings/admin');
            const bookings = await res.json();
            bookings.forEach(booking => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${booking.serviceName || ''}</td>
                    <td>${booking.bookingDate || ''}</td>
                    <td>${booking.totalAmount}</td>
                    <td>${booking.photographerId || ''}</td>
                    <td>${booking.additionalServices || ''}</td>
                    <td>
                        <select data-id="${booking.id}" class="status-select">
                            <option value="Booked" ${booking.status === 'Booked' ? 'selected' : ''}>Booked</option>
                            <option value="In Progress" ${booking.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Finished" ${booking.status === 'Finished' ? 'selected' : ''}>Finished</option>
                        </select>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }

        // Handle status change
        tableBody.addEventListener('change', async function(e) {
            if (e.target.classList.contains('status-select')) {
                const bookingId = e.target.getAttribute('data-id');
                const newStatus = e.target.value;
                await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
            }
        });

        // Print report button
        printBtn.addEventListener('click', function() {
            window.open('http://localhost:5000/api/report/bookings-report', '_blank');
        });

        loadBookings();
    }
});