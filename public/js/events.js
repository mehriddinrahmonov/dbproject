let currentEvents = [];
let currentOffset = 0;
const EVENTS_LIMIT = 12;

document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadEvents();
    setupEventListeners();
});

/**
 * Load available categories
 */
async function loadCategories() {
    try {
        const data = await apiRequest('/events/meta/categories');
        const categoryFilter = document.getElementById('categoryFilter');

        if (data.data && data.data.length > 0) {
            data.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Load events from API
 */
async function loadEvents(append = false) {
    try {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');

        const params = new URLSearchParams({
            limit: EVENTS_LIMIT,
            offset: append ? currentOffset : 0,
            ...(searchInput?.value && { search: searchInput.value }),
            ...(categoryFilter?.value && { category: categoryFilter.value }),
            ...(statusFilter?.value && { status: statusFilter.value })
        });

        const data = await apiRequest(`/events?${params}`);

        if (!append) {
            currentEvents = data.data;
            currentOffset = 0;
        } else {
            currentEvents = [...currentEvents, ...data.data];
        }

        currentOffset += data.data.length;

        displayEvents(currentEvents, append);

        const loadMoreContainer = document.getElementById('loadMore');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = data.data.length === EVENTS_LIMIT ? 'block' : 'none';
        }

    } catch (error) {
        console.error('Error loading events:', error);
        const eventsGrid = document.getElementById('eventsGrid');
        eventsGrid.innerHTML = `
            <div class="loading">
                Failed to load events. Please try again later.
            </div>
        `;
    }
}

/**
 * Display events in grid
 */
function displayEvents(events, append = false) {
    const eventsGrid = document.getElementById('eventsGrid');

    if (!append) {
        eventsGrid.innerHTML = '';
    }

    if (events.length === 0) {
        eventsGrid.innerHTML = `
            <div class="loading">
                No concerts found. Try adjusting your filters.
            </div>
        `;
        return;
    }

    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
}

/**
 * Create event card element
 */
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.onclick = () => showEventDetails(event.id);

    const seatsRemaining = event.venue_capacity - (event.seats_taken || 0);
    const availability = seatsRemaining > 0 ? `${seatsRemaining} seats left` : 'Sold Out';
    const availabilityClass = seatsRemaining > 0 ? 'badge-success' : 'badge-danger';

    card.innerHTML = `
        <div class="event-image">
            <span>${getGenreEmoji(event.category)}</span>
        </div>
        <div class="event-details">
            <span class="event-category">${event.category}</span>
            <h3 class="event-title">${event.title}</h3>
            <div class="event-meta">
                <div>📅 ${formatDate(event.event_date)} at ${formatTime(event.start_time)}</div>
                <div>📍 ${event.venue_name}, ${event.venue_city}</div>
                <div>🎫 <span class="badge ${availabilityClass}">${availability}</span></div>
            </div>
            <div class="event-footer">
                <span class="ticket-info">View Details →</span>
            </div>
        </div>
    `;

    return card;
}

/**
 * Show event details in modal
 */
async function showEventDetails(eventId) {
    try {
        const data = await apiRequest(`/events/${eventId}`);
        const event = data.data;

        const modalBody = document.getElementById('modalBody');
        const seatsRemaining = event.venue_capacity - (event.seats_taken || 0);

        modalBody.innerHTML = `
            <div class="event-detail-header">
                <div class="event-detail-image">
                    <span style="font-size: 6rem;">${getGenreEmoji(event.category)}</span>
                </div>
                <h2>${event.title}</h2>
                <span class="badge">${event.category}</span>
            </div>
            
            <div class="event-detail-info" style="margin-top: 1.5rem;">
                <h3>Event Details</h3>
                <p style="color: var(--text-secondary); line-height: 1.8;">
                    ${event.description || 'Join us for an unforgettable concert experience!'}
                </p>
                
                <div style="margin-top: 1.5rem;">
                    <h4>📅 Date & Time</h4>
                    <p>${formatDate(event.event_date)} at ${formatTime(event.start_time)} - ${formatTime(event.end_time)}</p>
                </div>
                
                <div style="margin-top: 1rem;">
                    <h4>📍 Venue</h4>
                    <p><strong>${event.venue_name}</strong></p>
                    <p style="color: var(--text-secondary);">${event.venue_address}, ${event.venue_city}, ${event.venue_state}</p>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Capacity: ${event.venue_capacity} | ${event.venue_type}</p>
                </div>
                
                <div style="margin-top: 1rem;">
                    <h4>🎤 Organizer</h4>
                    <p>${event.organizer_company}</p>
                </div>
                
                <div style="margin-top: 1.5rem;">
                    <h4>🎫 Available Tickets</h4>
                    <p style="margin-bottom: 1rem;">${seatsRemaining} seats remaining</p>
                    ${displayTicketTypes(event.ticket_types, eventId)}
                </div>
            </div>
        `;

        openModal('eventModal');
    } catch (error) {
        console.error('Error loading event details:', error);
        showNotification('Failed to load event details', 'error');
    }
}

/**
 * Display ticket types
 */
function displayTicketTypes(ticketTypes, eventId) {
    if (!ticketTypes || ticketTypes.length === 0) {
        return '<p style="color: var(--text-secondary);">No tickets available</p>';
    }

    return ticketTypes.map(ticket => `
        <div class="ticket-type-card" style="
            background: var(--bg-dark);
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <div>
                <h5 style="margin-bottom: 0.25rem;">${ticket.type_name}</h5>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                    ${ticket.description || 'Standard admission'}
                </p>
                ${ticket.perks ? `<p style="font-size: 0.8rem; color: var(--accent);">✨ ${ticket.perks}</p>` : ''}
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                    ${ticket.quantity_available} available
                </p>
            </div>
            <div style="text-align: right;">
                <div class="price-tag" style="font-size: 1.5rem; margin-bottom: 0.5rem;">
                    ${formatPrice(ticket.price)}
                </div>
                <button class="btn btn-primary btn-sm" 
                        onclick="selectTicket(${eventId}, ${ticket.id}, '${ticket.type_name}', ${ticket.price})"
                        ${ticket.quantity_available === 0 ? 'disabled' : ''}>
                    ${ticket.quantity_available === 0 ? 'Sold Out' : 'Select'}
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Select ticket (simplified - adds to cart)
 */
function selectTicket(eventId, ticketTypeId, typeName, price) {
    let user = getCurrentUser();
    if (!user) {
        const email = prompt('Please enter your email to continue:');
        if (!email) return;

        user = { id: 1, email: email };
        setCurrentUser(user);
    }

    addToCart({
        eventId,
        ticketTypeId,
        typeName,
        price,
        timestamp: Date.now()
    });

    closeModal('eventModal');

    setTimeout(() => {
        if (confirm('Ticket added to cart! Go to checkout?')) {
            window.location.href = 'checkout.html';
        }
    }, 500);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => loadEvents());
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadEvents();
            }
        });
    }

    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => loadEvents());
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => loadEvents());
    }

    const loadMoreBtn = document.querySelector('#loadMore button');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => loadEvents(true));
    }
}
