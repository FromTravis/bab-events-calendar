// ==========================================================================
// Basque Agenda - Application Controller
// ==========================================================================

// Global state
let allEvents = [];
let customEvents = [];
let selectedCity = 'all';
let selectedCategory = 'all';
let searchQuery = '';
let selectedDateStr = null; // Format YYYY-MM-DD

// Calendar navigation state
let calendarDate = new Date(2026, 5, 14); // Set default to June 2026 based on metadata
const TODAY_STR = "2026-06-14"; // Fixed local time anchor for upcoming event filtering

// DOM Elements
const daysContainer = document.getElementById('daysContainer');
const currentMonthYear = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const searchInput = document.getElementById('searchInput');
const eventsGrid = document.getElementById('eventsGrid');
const listTitle = document.getElementById('listTitle');
const resetDateFilterBtn = document.getElementById('resetDateFilterBtn');

// Modals
const detailsModal = document.getElementById('detailsModal');
const addEventModal = document.getElementById('addEventModal');
const openAddEventModalBtn = document.getElementById('openAddEventModalBtn');
const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
const closeAddEventModalBtn = document.getElementById('closeAddEventModalBtn');
const addEventForm = document.getElementById('addEventForm');

// Theme Toggler
const themeToggleBtn = document.getElementById('themeToggleBtn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadEventsData();
  setupEventListeners();
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
}

function toggleTheme() {
  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    localStorage.setItem('theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem('theme', 'dark');
  }
}

// Data loading and merging
async function loadEventsData() {
  // 1. Load custom events added by the user
  const stored = localStorage.getItem('custom_events');
  customEvents = stored ? JSON.parse(stored) : [];

  // 2. Load default static events (available globally from events.js)
  const defaultEvents = typeof DEFAULT_EVENTS !== 'undefined' ? DEFAULT_EVENTS : [];

  // 3. Load scraped events
  let scrapedEvents = [];
  try {
    const response = await fetch('scraped_events.json');
    if (response.ok) {
      scrapedEvents = await response.json();
      console.log(`Loaded ${scrapedEvents.length} events from scraped_events.json`);
    } else {
      console.warn("Could not load scraped_events.json, using fallback defaults");
    }
  } catch (error) {
    console.warn("Fetch failed for scraped_events.json (likely running locally via file://), using fallback defaults");
  }

  // 4. Merge all sources and deduplicate by Title + Date
  const merged = [...customEvents, ...scrapedEvents, ...defaultEvents];
  allEvents = [];
  const seen = new Set();
  
  for (const ev of merged) {
    const key = `${ev.title.toLowerCase()}_${ev.date}`;
    if (!seen.has(key)) {
      seen.add(key);
      allEvents.push(ev);
    }
  }

  console.log(`Total unique events registered: ${allEvents.length}`);
  
  // Render initial state
  renderCalendar();
  renderEventsList();
}

// Event Listeners setup
function setupEventListeners() {
  // Calendar Nav
  prevMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  });
  nextMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
  });

  // Search input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderEventsList();
    renderCalendar(); // Redraw dots matching query filters
  });

  // City filtering
  document.querySelectorAll('.city-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.city-pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      selectedCity = e.target.dataset.city;
      renderEventsList();
      renderCalendar();
    });
  });

  // Category filtering
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = e.target.closest('.category-btn');
      activeBtn.classList.add('active');
      selectedCategory = activeBtn.dataset.category;
      renderEventsList();
      renderCalendar();
    });
  });

  // Reset selected date filter
  resetDateFilterBtn.addEventListener('click', () => {
    selectedDateStr = null;
    resetDateFilterBtn.classList.add('hide');
    // Remove active highlight class from calendar days
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('active-day'));
    renderEventsList();
  });

  // Modals management
  openAddEventModalBtn.addEventListener('click', () => {
    // Set date input default to selected date or today
    const dateInput = document.getElementById('formDate');
    dateInput.value = selectedDateStr || TODAY_STR;
    addEventModal.classList.remove('hide');
  });

  closeDetailsModalBtn.addEventListener('click', () => detailsModal.classList.add('hide'));
  closeAddEventModalBtn.addEventListener('click', () => addEventModal.classList.add('hide'));
  
  // Close modals on clicking overlay background
  detailsModal.addEventListener('click', (e) => {
    if (e.target === detailsModal) detailsModal.classList.add('hide');
  });
  addEventModal.addEventListener('click', (e) => {
    if (e.target === addEventModal) addEventModal.classList.add('hide');
  });

  // Handle Event submission
  addEventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addNewEvent();
  });

  // Theme button
  themeToggleBtn.addEventListener('click', toggleTheme);
}

// Generate calendar cells dynamically
function renderCalendar() {
  daysContainer.innerHTML = '';
  
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  
  // Set month title
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  currentMonthYear.textContent = `${monthNames[month]} ${year}`;
  
  // Calculate first day of month and total days
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1, ...
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  // Adjust so Monday is index 0
  let adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  
  // Render empty cells for padding before 1st of month
  for (let i = 0; i < adjustedFirstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    daysContainer.appendChild(emptyDay);
  }
  
  // Render actual days
  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dayCell.dataset.date = dayStr;
    
    // Add day number
    const dayNumSpan = document.createElement('span');
    dayNumSpan.className = 'day-num';
    dayNumSpan.textContent = day;
    dayCell.appendChild(dayNumSpan);
    
    // Is today?
    if (dayStr === TODAY_STR) {
      dayCell.classList.add('today');
    }
    
    // Is active/selected?
    if (dayStr === selectedDateStr) {
      dayCell.classList.add('active-day');
    }
    
    // Get events for this specific day (under active filters)
    const dayEvents = getFilteredEventsForDate(dayStr);
    
    if (dayEvents.length > 0) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'day-events-dots';
      
      // Render maximum 4 dots to avoid clutter
      dayEvents.slice(0, 4).forEach(ev => {
        const dot = document.createElement('span');
        dot.className = `dot ${getCategoryClass(ev.category)}`;
        dotsContainer.appendChild(dot);
      });
      dayCell.appendChild(dotsContainer);
    }
    
    // Clicking a day cell
    dayCell.addEventListener('click', () => {
      if (selectedDateStr === dayStr) {
        // Double click resets filter
        selectedDateStr = null;
        dayCell.classList.remove('active-day');
        resetDateFilterBtn.classList.add('hide');
      } else {
        document.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('active-day'));
        selectedDateStr = dayStr;
        dayCell.classList.add('active-day');
        resetDateFilterBtn.classList.remove('hide');
      }
      renderEventsList();
    });
    
    daysContainer.appendChild(dayCell);
  }
}

// Filters helper for drawing dots on calendar days
function getFilteredEventsForDate(dateStr) {
  return allEvents.filter(ev => {
    if (ev.date !== dateStr) return false;
    
    // Apply location filter
    if (selectedCity !== 'all' && ev.location !== selectedCity) return false;
    
    // Apply category filter
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(query);
      const matchDesc = ev.description.toLowerCase().includes(query);
      const matchVenue = ev.venue.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchVenue) return false;
    }
    
    return true;
  });
}

// Category identifier to CSS class
function getCategoryClass(category) {
  switch (category) {
    case 'Concerts & Music': return 'music';
    case 'Sports & Surf': return 'sports';
    case 'Gastronomy & Markets': return 'gastronomy';
    case 'Culture & Heritage': return 'culture';
    case 'Community & Family': return 'family';
    default: return 'culture';
  }
}

// Render dynamic list of events
function renderEventsList() {
  eventsGrid.innerHTML = '';
  
  // Header text updates
  if (selectedDateStr) {
    const dateObj = new Date(selectedDateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('fr-FR', options);
    listTitle.textContent = `Événements le ${dateFormatted}`;
  } else {
    listTitle.textContent = "Prochains événements";
  }

  // Filter global events array
  let filtered = allEvents.filter(ev => {
    // Filter by date
    if (selectedDateStr) {
      if (ev.date !== selectedDateStr) return false;
    } else {
      // If no date selected, show all events from today onwards (upcoming)
      if (ev.date < TODAY_STR) return false;
    }
    
    // Filter by city
    if (selectedCity !== 'all' && ev.location !== selectedCity) return false;
    
    // Filter by category
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(query);
      const matchDesc = ev.description.toLowerCase().includes(query);
      const matchVenue = ev.venue.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchVenue) return false;
    }
    
    return true;
  });

  // Sort chronologically
  filtered.sort((a, b) => a.date.localeCompare(b.date));

  // Render cards
  if (filtered.length === 0) {
    eventsGrid.innerHTML = `
      <div class="no-events-state">
        <i class="fa-solid fa-calendar-minus"></i>
        <h3>Aucun événement trouvé</h3>
        <p>Essayez de modifier vos filtres ou de faire une autre recherche.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    // Default image fallback if none provided
    const imgUrl = ev.image || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80";
    
    // Formatting date beautifully
    const dateParts = ev.date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    
    card.innerHTML = `
      <div class="event-card-img" style="background-image: url('${imgUrl}')">
        <span class="event-badge" data-category="${ev.category}">${ev.category}</span>
      </div>
      <div class="event-card-body">
        <div>
          <span class="event-card-city ${ev.location.toLowerCase()}">${ev.location}</span>
        </div>
        <h3 class="event-card-title">${ev.title}</h3>
        <div class="event-card-meta">
          <div><i class="fa-solid fa-calendar"></i> ${formattedDate}</div>
          <div><i class="fa-solid fa-clock"></i> ${ev.time}</div>
          <div><i class="fa-solid fa-location-dot"></i> ${ev.venue}</div>
        </div>
        <p class="event-card-desc">${ev.description}</p>
        <div class="event-card-footer">
          <span class="event-card-venue">${ev.venue}</span>
          <button class="event-card-btn" onclick="openDetailsModal(${JSON.stringify(ev).replace(/"/g, '&quot;')})">Détails</button>
        </div>
      </div>
    `;
    
    eventsGrid.appendChild(card);
  });
}

// Open Event Details Modal
window.openDetailsModal = function(ev) {
  document.getElementById('modalTitle').textContent = ev.title;
  document.getElementById('modalDescription').textContent = ev.description;
  document.getElementById('modalVenue').textContent = ev.venue;
  document.getElementById('modalTime').textContent = ev.time;
  
  // Format Date for modal
  const dateObj = new Date(ev.date);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('modalDate').textContent = dateObj.toLocaleDateString('fr-FR', options);
  
  document.getElementById('modalLocation').textContent = `${ev.location} (${ev.venue})`;
  
  // Set Category badge
  const catBadge = document.getElementById('modalCategoryBadge');
  catBadge.textContent = ev.category;
  catBadge.dataset.category = ev.category;
  
  // Set Hero Image
  const imgUrl = ev.image || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80";
  document.getElementById('modalHeroImage').style.backgroundImage = `url('${imgUrl}')`;
  
  // Set external link
  const linkBtn = document.getElementById('modalLinkBtn');
  if (ev.url) {
    linkBtn.href = ev.url;
    linkBtn.classList.remove('hide');
  } else {
    linkBtn.classList.add('hide');
  }
  
  detailsModal.classList.remove('hide');
};

// Add New Event Form Submission
function addNewEvent() {
  const title = document.getElementById('formTitle').value;
  const date = document.getElementById('formDate').value;
  const time = document.getElementById('formTime').value;
  const location = document.getElementById('formLocation').value;
  const category = document.getElementById('formCategory').value;
  const venue = document.getElementById('formVenue').value;
  const image = document.getElementById('formImage').value;
  const description = document.getElementById('formDescription').value;
  
  const newEv = {
    title,
    date,
    time,
    location,
    category,
    venue,
    image,
    description,
    url: ""
  };
  
  customEvents.push(newEv);
  localStorage.setItem('custom_events', JSON.stringify(customEvents));
  
  // Reload and render
  loadEventsData();
  
  // Close modal and reset
  addEventModal.classList.add('hide');
  addEventForm.reset();
}
