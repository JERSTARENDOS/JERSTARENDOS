// TMDB API Configuration
const TMDB_CONFIG = {
    API_KEY: 'b26146034797244e5b37b1a25c2d9731', // Replace with your actual API key
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/',
    IMAGE_SIZES: {
        poster: 'w500',
        backdrop: 'w1280',
        profile: 'w185'
    }
};

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Global variables
let currentMovies = [];
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let currentCategory = 'popular';

/**
 * Initialize the application when the page loads
 */
function init() {
    setupEventListeners();
    loadMovies('popular');
    
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Check if API key is set
    if (TMDB_CONFIG.API_KEY === 'b26146034797244e5b37b1a25c2d9731') {
        showError('Please set your TMDB API key in the configuration');
    }
}

/**
 * Set up additional event listeners
 */
function setupEventListeners() {
    // Header background change on scroll
    window.addEventListener('scroll', handleScroll);
    
    // Modal close on outside click
    window.addEventListener('click', handleModalOutsideClick);
    
    // Mobile menu close on outside click
    document.addEventListener('click', handleMobileMenuOutsideClick);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
    
    // Search input with debounce
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => searchMovies(e.target.value), 500);
        });
        searchInput.addEventListener('focus', handleSearchFocus);
        searchInput.addEventListener('blur', handleSearchBlur);
    }
    
    // Close mobile menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    // Infinite scroll
    window.addEventListener('scroll', handleInfiniteScroll);
}

/**
 * Handle infinite scroll for loading more movies
 */
function handleInfiniteScroll() {
    if (isLoading || currentPage >= totalPages) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight - 1000) {
        loadMoreMovies();
    }
}

/**
 * Make API request to TMDB
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
async function makeApiRequest(endpoint, params = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
        const { data, timestamp } = cache.get(cacheKey);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
        cache.delete(cacheKey);
    }
    
    const queryString = new URLSearchParams({
        api_key: TMDB_CONFIG.API_KEY,
        ...params
    }).toString();
    
    const url = `${TMDB_CONFIG.BASE_URL}${endpoint}?${queryString}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache the response
        cache.set(cacheKey, { data, timestamp: Date.now() });
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Load movies from TMDB API
 * @param {string} category - Category of movies to load
 * @param {number} page - Page number
 */
async function loadMovies(category, page = 1) {
    isLoading = true;
    currentCategory = category;
    currentPage = page;
    
    if (page === 1) {
        showLoadingState();
    }
    
    try {
        let endpoint;
        let params = { page };
        
        switch (category) {
            case 'popular':
                endpoint = '/movie/popular';
                break;
            case 'trending':
                endpoint = '/trending/movie/week';
                break;
            case 'top_rated':
                endpoint = '/movie/top_rated';
                break;
            case 'upcoming':
                endpoint = '/movie/upcoming';
                break;
            case 'now_playing':
                endpoint = '/movie/now_playing';
                break;
            case 'tv_popular':
                endpoint = '/tv/popular';
                break;
            case 'tv_top_rated':
                endpoint = '/tv/top_rated';
                break;
            default:
                // Handle genre filtering
                endpoint = '/discover/movie';
                params.with_genres = getGenreId(category);
                break;
        }
        
        const data = await makeApiRequest(endpoint, params);
        
        const movies = data.results.map(transformApiData);
        
        if (page === 1) {
            currentMovies = movies;
        } else {
            currentMovies = [...currentMovies, ...movies];
        }
        
        totalPages = data.total_pages;
        displayMovies(currentMovies, page === 1);
        updatePageTitle(category);
        
    } catch (error) {
        showError('Failed to load movies. Please try again later.');
        console.error('Failed to load movies:', error);
    } finally {
        isLoading = false;
    }
}

/**
 * Load more movies (for infinite scroll)
 */
async function loadMoreMovies() {
    if (currentPage < totalPages) {
        await loadMovies(currentCategory, currentPage + 1);
    }
}

/**
 * Transform TMDB API data to our movie format
 * @param {Object} apiData - Raw API data
 * @returns {Object} Transformed movie object
 */
function transformApiData(apiData) {
    const isTV = apiData.hasOwnProperty('first_air_date');
    
    return {
        id: apiData.id,
        title: apiData.title || apiData.name,
        year: new Date(apiData.release_date || apiData.first_air_date || '').getFullYear() || 'N/A',
        rating: Math.round(apiData.vote_average * 10) / 10,
        genre: apiData.genre_ids?.[0] ? getGenreName(apiData.genre_ids[0]) : 'Unknown',
        type: isTV ? 'series' : 'movie',
        description: apiData.overview || 'No description available.',
        poster: apiData.poster_path ? 
                `${TMDB_CONFIG.IMAGE_BASE_URL}${TMDB_CONFIG.IMAGE_SIZES.poster}${apiData.poster_path}` : 
                null,
        backdrop: apiData.backdrop_path ?
                 `${TMDB_CONFIG.IMAGE_BASE_URL}${TMDB_CONFIG.IMAGE_SIZES.backdrop}${apiData.backdrop_path}` :
                 null,
        popularity: apiData.popularity,
        vote_count: apiData.vote_count,
        adult: apiData.adult,
        original_language: apiData.original_language
    };
}

/**
 * Get genre name by ID
 * @param {number} genreId - Genre ID
 * @returns {string} Genre name
 */
function getGenreName(genreId) {
    const genres = {
        28: 'action',
        12: 'adventure',
        16: 'animation',
        35: 'comedy',
        80: 'crime',
        99: 'documentary',
        18: 'drama',
        10751: 'family',
        14: 'fantasy',
        36: 'history',
        27: 'horror',
        10402: 'music',
        9648: 'mystery',
        10749: 'romance',
        878: 'sci-fi',
        10770: 'tv-movie',
        53: 'thriller',
        10752: 'war',
        37: 'western'
    };
    
    return genres[genreId] || 'unknown';
}

/**
 * Get genre ID by name
 * @param {string} genreName - Genre name
 * @returns {number} Genre ID
 */
function getGenreId(genreName) {
    const genres = {
        'action': 28,
        'adventure': 12,
        'animation': 16,
        'comedy': 35,
        'crime': 80,
        'documentary': 99,
        'drama': 18,
        'family': 10751,
        'fantasy': 14,
        'history': 36,
        'horror': 27,
        'music': 10402,
        'mystery': 9648,
        'romance': 10749,
        'sci-fi': 878,
        'thriller': 53,
        'war': 10752,
        'western': 37
    };
    
    return genres[genreName] || 28; // Default to action
}

/**
 * Search movies using TMDB API
 * @param {string} query - Search query
 */
async function searchMovies(query) {
    if (query.trim() === '') {
        await loadMovies(currentCategory);
        hideSearchResults();
        return;
    }
    
    isLoading = true;
    showLoadingState();
    
    try {
        const data = await makeApiRequest('/search/multi', {
            query: query.trim(),
            page: 1
        });
        
        const movies = data.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(transformApiData);
        
        currentMovies = movies;
        displayMovies(movies, true);
        updateSearchResults(movies.length, query);
        
    } catch (error) {
        showError('Search failed. Please try again.');
        console.error('Search failed:', error);
    } finally {
        isLoading = false;
    }
}

/**
 * Get detailed movie information
 * @param {number} movieId - Movie ID
 * @param {string} mediaType - 'movie' or 'tv'
 * @returns {Promise<Object>} Detailed movie data
 */
async function getMovieDetails(movieId, mediaType = 'movie') {
    const endpoint = `/${mediaType}/${movieId}`;
    const params = {
        append_to_response: 'credits,videos,reviews'
    };
    
    try {
        return await makeApiRequest(endpoint, params);
    } catch (error) {
        console.error('Failed to load movie details:', error);
        throw error;
    }
}

/**
 * Show detailed movie information in modal
 * @param {Object} movie - Movie object to display
 */
async function showMovieDetails(movie) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    if (!modal || !modalTitle || !modalContent) return;

    modalTitle.textContent = movie.title;
    modalContent.innerHTML = '<div class="loading"></div>';
    
    modal.style.display = 'block';
    
    try {
        const details = await getMovieDetails(movie.id, movie.type);
        
        // Get director/creator info
        const director = details.credits?.crew?.find(person => person.job === 'Director');
        const creator = details.created_by?.[0];
        
        // Get main cast (first 5)
        const mainCast = details.credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || 'Not available';
        
        // Get trailer
        const trailer = details.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        
        // Get genres
        const genres = details.genres?.map(g => g.name).join(', ') || 'Not specified';
        
        modalContent.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <strong>Year:</strong> ${movie.year}<br>
                <strong>Rating:</strong> ${movie.rating}/10 (${details.vote_count || 0} votes)<br>
                <strong>Genres:</strong> ${genres}<br>
                <strong>Type:</strong> ${capitalizeFirst(movie.type)}<br>
                ${director ? `<strong>Director:</strong> ${director.name}<br>` : ''}
                ${creator ? `<strong>Creator:</strong> ${creator.name}<br>` : ''}
                <strong>Runtime:</strong> ${details.runtime ? details.runtime + ' min' : details.number_of_seasons ? details.number_of_seasons + ' seasons' : 'Not specified'}<br>
                <strong>Language:</strong> ${details.original_language?.toUpperCase() || 'Not specified'}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Cast:</strong><br>
                ${mainCast}
            </div>
            <div style="margin-bottom: 1.5rem;">
                <strong>Description:</strong><br>
                ${movie.description}
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="cta-button" onclick="playMovie('${movie.title}')">
                    ▶ Watch Now
                </button>
                ${trailer ? `<button class="cta-button" onclick="watchTrailer('${trailer.key}')" 
                            style="background: rgba(255, 107, 107, 0.2);">
                    🎬 Watch Trailer
                </button>` : ''}
                <button class="cta-button" onclick="addToWatchlist('${movie.title}')" 
                        style="background: rgba(255, 255, 255, 0.1);">
                    + Watchlist
                </button>
            </div>
        `;
        
    } catch (error) {
        modalContent.innerHTML = `
            <div style="color: #ff6b6b; margin-bottom: 1rem;">
                Failed to load detailed information. Please try again later.
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Basic Info:</strong><br>
                Year: ${movie.year}<br>
                Rating: ${movie.rating}/10<br>
                Genre: ${capitalizeFirst(movie.genre)}<br>
                Type: ${capitalizeFirst(movie.type)}
            </div>
            <div style="margin-bottom: 1.5rem;">
                <strong>Description:</strong><br>
                ${movie.description}
            </div>
        `;
    }
    
    // Add animation
    const modalContentEl = modal.querySelector('.modal-content');
    modalContentEl.style.transform = 'translate(-50%, -50%) scale(0.8)';
    modalContentEl.style.opacity = '0';
    
    setTimeout(() => {
        modalContentEl.style.transition = 'all 0.3s ease';
        modalContentEl.style.transform = 'translate(-50%, -50%) scale(1)';
        modalContentEl.style.opacity = '1';
    }, 10);
}

/**
 * Watch trailer on YouTube
 * @param {string} videoKey - YouTube video key
 */
function watchTrailer(videoKey) {
    window.open(`https://www.youtube.com/watch?v=${videoKey}`, '_blank');
}

/**
 * Filter movies by category (updated for API)
 * @param {string} category - Category to filter by
 */
async function filterMovies(category) {
    // Update active button
    updateActiveButton(category);
    
    // Map UI categories to API categories
    const categoryMap = {
        'all': 'popular',
        'movies': 'popular',
        'series': 'tv_popular',
        'trending': 'trending'
    };
    
    const apiCategory = categoryMap[category] || category;
    await loadMovies(apiCategory);
}

/**
 * Show loading state
 */
function showLoadingState() {
    const grid = document.getElementById('movieGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <div class="loading" style="margin: 0 auto 1rem;"></div>
                <p>Loading amazing movies for you...</p>
            </div>
        `;
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    const grid = document.getElementById('movieGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #ff6b6b;">
                <p>⚠️ ${message}</p>
                <button class="cta-button" onclick="location.reload()" style="margin-top: 1rem;">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Keep all the original functions that are still relevant
function handleScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.9)';
    }
}

function handleSearchFocus() {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.style.transform = 'scale(1.05)';
    }
}

function handleSearchBlur() {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.style.transform = 'scale(1)';
    }
}

function handleKeyDown(event) {
    if (event.key === 'Escape') {
        closeModal();
        closeMobileMenu();
    }
}

function handleModalOutsideClick(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    
    if (!navLinks || !toggleBtn) return;
    
    navLinks.classList.toggle('active');
    
    if (navLinks.classList.contains('active')) {
        toggleBtn.innerHTML = '✕';
        toggleBtn.style.transform = 'rotate(180deg)';
    } else {
        toggleBtn.innerHTML = '☰';
        toggleBtn.style.transform = 'rotate(0deg)';
    }
}

function closeMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    
    if (!navLinks || !toggleBtn) return;
    
    navLinks.classList.remove('active');
    toggleBtn.innerHTML = '☰';
    toggleBtn.style.transform = 'rotate(0deg)';
}

function handleMobileMenuOutsideClick(event) {
    const navLinks = document.getElementById('navLinks');
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (!nav.contains(event.target) && navLinks.classList.contains('active')) {
        closeMobileMenu();
    }
}

function displayMovies(movieList, clearGrid = true) {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;

    if (clearGrid) {
        grid.innerHTML = '';
    }

    if (movieList.length === 0 && clearGrid) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; opacity: 0.7;">No movies found matching your criteria.</p>';
        return;
    }

    const startIndex = clearGrid ? 0 : grid.children.length;

    movieList.forEach((movie, index) => {
        if (!clearGrid && index < startIndex) return;
        
        const movieCard = createMovieCard(movie, index);
        grid.appendChild(movieCard);
    });

    // Add stagger animation to new cards
    const cards = grid.querySelectorAll('.movie-card');
    const newCards = clearGrid ? cards : Array.from(cards).slice(startIndex);
    
    newCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function createMovieCard(movie, index) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.onclick = () => showMovieDetails(movie);

    const fullStars = Math.floor(movie.rating / 2);
    const halfStar = movie.rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    const starDisplay = '★'.repeat(fullStars) + 
                       (halfStar ? '☆' : '') + 
                       '☆'.repeat(emptyStars);

    let posterContent = '';
    if (movie.poster) {
        posterContent = `
            <img src="${movie.poster}" 
                 alt="${movie.title} Poster" 
                 onerror="this.parentElement.innerHTML='<div class=\\'placeholder\\'>${movie.title}</div>'"
                 loading="lazy">
            <div class="poster-overlay">
                <div style="color: white; font-size: 0.9rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                    ${movie.type.toUpperCase()}
                </div>
            </div>
            <button class="play-button" onclick="event.stopPropagation(); playMovie(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                ▶
            </button>
        `;
    } else {
        posterContent = `<div class="placeholder">${movie.title}</div>`;
    }

    movieCard.innerHTML = `
        <div class="movie-poster">
            ${posterContent}
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-year">${movie.year} • ${movie.type.toUpperCase()}</div>
            <div class="movie-rating">
                <span class="stars">${starDisplay}</span>
                <span>${movie.rating}/10</span>
            </div>
        </div>
    `;

    return movieCard;
}

function updateActiveButton(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = Array.from(document.querySelectorAll('.category-btn'))
        .find(btn => btn.textContent.toLowerCase() === category || 
              (category === 'sci-fi' && btn.textContent === 'Sci-Fi'));
    
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function updatePageTitle(category) {
    const sectionTitle = document.querySelector('.section h2');
    if (sectionTitle) {
        const titles = {
            'popular': 'Popular Movies',
            'trending': 'Trending Now',
            'top_rated': 'Top Rated Movies',
            'upcoming': 'Upcoming Movies',
            'now_playing': 'Now Playing',
            'tv_popular': 'Popular TV Series',
            'tv_top_rated': 'Top Rated Series',
            'action': 'Action Movies',
            'comedy': 'Comedy Movies',
            'drama': 'Drama Movies',
            'horror': 'Horror Movies',
            'sci-fi': 'Sci-Fi Movies'
        };
        
        sectionTitle.textContent = titles[category] || 'Featured Movies';
    }
}

function updateSearchResults(count, query) {
    let resultInfo = document.querySelector('.search-results');
    
    if (!resultInfo) {
        resultInfo = document.createElement('div');
        resultInfo.className = 'search-results';
        resultInfo.style.cssText = `
            margin-bottom: 1rem;
            opacity: 0.8;
            font-size: 0.9rem;
        `;
        document.querySelector('.section').insertBefore(resultInfo, document.getElementById('movieGrid'));
    }
    
    if (query.trim()) {
        resultInfo.textContent = `Found ${count} result${count !== 1 ? 's' : ''} for "${query}"`;
        resultInfo.style.display = 'block';
    } else {
        resultInfo.style.display = 'none';
    }
}

function hideSearchResults() {
    const resultInfo = document.querySelector('.search-results');
    if (resultInfo) {
        resultInfo.style.display = 'none';
    }
}

function playMovie(movieTitle) {
    showModal(`Playing "${movieTitle}"`, 'This is a demo. In a real app, this would start the movie player.');
}

function addToWatchlist(movieTitle) {
    showModal('Added to Watchlist', `"${movieTitle}" has been added to your watchlist!`);
}

function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    if (!modal || !modalTitle || !modalContent) return;

    modalTitle.textContent = title;
    modalContent.textContent = content;

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Navigate back to home/beginning
 */
function goHome() {
    // Close any open modals
    closeModal();
    closeMobileMenu();
    
    // Clear search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Hide search results
    hideSearchResults();
    
    // Reset to popular movies (beginning state)
    currentCategory = 'popular';
    currentPage = 1;
    
    // Update active button to show "Popular" as active
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const popularBtn = document.querySelector('.category-btn');
    if (popularBtn) {
        popularBtn.classList.add('active');
    }
    
    // Smooth scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Load popular movies
    loadMovies('popular');
    
    // Show a subtle notification
    showHomeNotification();
}

/**
 * Show a subtle notification when returning home
 */
function showHomeNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 107, 107, 0.9);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        z-index: 1001;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    notification.textContent = '🏠 Welcome back to Jerry!';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize the page when loaded
window.onload = init;