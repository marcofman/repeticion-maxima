
// Mock Data for Programs and Exercises
const PROGRAMS_DATA = {
    'genesis': {
        id: 'genesis',
        name: 'GÉNESIS',
        description: 'Programa de prueba para principiantes. Fundamentos del movimiento.',
        image: 'program_genesis.jpg', // We will map this to the generated image
        exercises: [
            { name: 'Sentadilla Goblet', sets: 3, reps: '10-12', image: 'exercise_squat.png' },
            { name: 'Flexiones', sets: 3, reps: 'AMRAP', image: 'exercise_bench_press.png' }, // Reusing bench press image for pushup concept
            { name: 'Plancha Abdominal', sets: 3, reps: '30s', image: 'exercise_deadlift.png' } // Placeholder
        ]
    },
    'milon_n1': {
        id: 'milon_n1',
        name: 'MILON - Nivel 1',
        description: 'Fuerza y rendimiento general. Construye una base sólida.',
        image: 'program_milon_strength.png',
        exercises: [
            { name: 'Sentadilla Trasera', sets: 4, reps: '5', image: 'exercise_squat.png' },
            { name: 'Press Banca', sets: 4, reps: '5', image: 'exercise_bench_press.png' },
            { name: 'Peso Muerto', sets: 3, reps: '5', image: 'exercise_deadlift.png' } // We need to generate this or use placeholder
        ]
    },
    'afrodita_n1': {
        id: 'afrodita_n1',
        name: 'AFRODITA - Nivel 1',
        description: 'Hipertrofia de glúteos y piernas. Enfoque estético y funcional.',
        image: 'program_afrodita_fitness.png',
        exercises: [
            { name: 'Hip Thrust', sets: 4, reps: '10-12', image: 'program_afrodita_fitness.png' },
            { name: 'Sentadilla Búlgara', sets: 3, reps: '12', image: 'exercise_squat.png' },
            { name: 'Patada de Glúteo', sets: 3, reps: '15', image: 'program_afrodita_fitness.png' }
        ]
    }
    // Add more as needed
};

// Image Mapping (In a real app, these would be URLs)
// Since we are in a local environment, we'll use relative paths to the artifacts we generated.
// Note: In the browser tool, we need to ensure these paths are accessible. 
// For this demo, we will assume the images are in the same directory or handle them via the `src` attribute.

// State Management
const state = {
    user: JSON.parse(localStorage.getItem('currentUser')) || null,
    purchases: JSON.parse(localStorage.getItem('userPurchases')) || []
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderHeader();
    renderMyPrograms();
    setupEventListeners();
    checkUrlParams();
}

function setupEventListeners() {
    // Buy Buttons
    document.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const planId = e.target.dataset.planId;
            handlePurchase(planId);
        });
    });

    // Levels Toggle
    document.querySelectorAll('.levels-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.dataset.target;
            const target = document.querySelector(targetId);
            target.classList.toggle('hidden');
            // Simple toggle logic, can be animated in CSS
            if (target.style.display === 'none' || !target.style.display) {
                target.style.display = 'block';
            } else {
                target.style.display = 'none';
            }
        });
    });

    // Hide level panels by default
    document.querySelectorAll('.levels-panel').forEach(el => el.style.display = 'none');
}

// --- Auth Logic ---

function login(email, password) {
    // Simulate API call
    if (email && password) {
        const user = { email, name: email.split('@')[0], id: Date.now() };
        state.user = user;
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Load purchases for this user (mock)
        const storedPurchases = localStorage.getItem(`purchases_${email}`);
        state.purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
        localStorage.setItem('userPurchases', JSON.stringify(state.purchases));

        closeModal();
        renderHeader();
        renderMyPrograms();
        alert(`¡Bienvenido, ${user.name}!`);
    } else {
        alert('Por favor ingresa email y contraseña.');
    }
}

function logout() {
    state.user = null;
    state.purchases = [];
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPurchases');
    renderHeader();
    renderMyPrograms();
    window.location.reload();
}

function register(name, email, password) {
    if (name && email && password) {
        login(email, password); // Auto login after register for demo
    } else {
        alert('Todos los campos son obligatorios.');
    }
}

// --- Purchase Logic ---

function handlePurchase(planId) {
    if (!state.user) {
        openAuthModal();
        return;
    }

    if (state.purchases.includes(planId)) {
        alert('¡Ya tienes este programa! Revisa la sección "Mis Programas".');
        document.getElementById('mis-programas').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // Simulate purchase process
    const confirmPurchase = confirm(`¿Confirmar compra de ${planId}? (Simulación)`);
    if (confirmPurchase) {
        state.purchases.push(planId);
        localStorage.setItem('userPurchases', JSON.stringify(state.purchases));
        // Also save to user specific storage
        localStorage.setItem(`purchases_${state.user.email}`, JSON.stringify(state.purchases));

        alert('¡Compra exitosa! El programa ha sido añadido a tu cuenta.');
        renderMyPrograms();
        document.getElementById('mis-programas').scrollIntoView({ behavior: 'smooth' });
    }
}

// --- Rendering ---

function renderHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');

    let navContent = '';
    if (state.user) {
        navContent = `
      <div class="flex items-center gap-4">
        <span class="text-sm font-semibold hidden sm:inline">Hola, ${state.user.name}</span>
        <button onclick="logout()" class="text-sm font-bold text-red-500 hover:text-red-600">Cerrar Sesión</button>
        <a href="#mis-programas" class="px-4 py-2 rounded-lg bg-accent-vibrant text-black font-bold text-sm">Mis Programas</a>
      </div>
    `;
    } else {
        navContent = `
      <button onclick="openAuthModal()" class="px-4 py-2 rounded-lg bg-primary-dark text-white font-bold text-sm hover:bg-gray-800">Iniciar Sesión / Registro</button>
    `;
    }

    headerPlaceholder.innerHTML = `
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
           <!-- Logo Placeholder -->
           <div class="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-oswald font-bold">RM</div>
           <span class="font-oswald font-bold text-xl tracking-tighter">REPETICIÓN MÁXIMA</span>
        </div>
        <nav>
          ${navContent}
        </nav>
      </div>
    </header>
  `;
}

function renderMyPrograms() {
    const grid = document.getElementById('mis-programas-grid');
    const section = document.getElementById('mis-programas');

    if (!state.user) {
        grid.innerHTML = `
      <div class="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p class="text-gray-500 mb-4">Inicia sesión para ver tus programas adquiridos.</p>
        <button onclick="openAuthModal()" class="px-6 py-2 bg-primary-dark text-white rounded-lg font-bold">Ingresar</button>
      </div>
    `;
        return;
    }

    if (state.purchases.length === 0) {
        grid.innerHTML = `
      <div class="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p class="text-gray-500 mb-4">Aún no tienes programas. ¡Explora la tienda!</p>
        <a href="#programas" class="px-6 py-2 bg-accent-vibrant text-black rounded-lg font-bold">Ver Catálogo</a>
      </div>
    `;
        return;
    }

    grid.innerHTML = state.purchases.map(planId => {
        const program = PROGRAMS_DATA[planId] || { name: planId, description: 'Programa adquirido', image: 'hero_gym_dark.png' };
        // Use the mapped image or a default
        const imgSrc = program.image || 'hero_gym_dark.png';

        return `
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
        <div class="h-40 bg-gray-200 relative overflow-hidden group">
           <img src="${imgSrc}" alt="${program.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
           <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <button onclick="openProgramDetails('${planId}')" class="px-4 py-2 bg-white text-black font-bold rounded-full">Ver Entrenamientos</button>
           </div>
        </div>
        <div class="p-5 flex-1 flex flex-col">
          <h3 class="font-bold text-lg mb-1">${program.name}</h3>
          <p class="text-sm text-gray-600 mb-4 flex-1">${program.description}</p>
          <button onclick="openProgramDetails('${planId}')" class="w-full py-2 rounded-lg bg-primary-dark text-white font-bold text-sm hover:bg-gray-800">Acceder</button>
        </div>
      </div>
    `;
    }).join('');
}

function openProgramDetails(planId) {
    const program = PROGRAMS_DATA[planId];
    if (!program) {
        alert('Detalles no disponibles para este programa.');
        return;
    }

    const view = document.getElementById('fullscreen-program-view');
    const content = document.getElementById('fullscreen-content');

    // Populate Content
    content.innerHTML = `
    <div class="animate-fade-in">
      <div class="flex flex-col md:flex-row gap-8 mb-8">
        <div class="md:w-1/3">
           <img src="${program.image || 'hero_gym_dark.png'}" alt="${program.name}" class="w-full rounded-xl shadow-lg">
        </div>
        <div class="md:w-2/3">
          <h1 class="text-4xl md:text-5xl font-extrabold font-oswald mb-4 text-primary-dark">${program.name}</h1>
          <p class="text-xl text-gray-600 mb-6">${program.description}</p>
          <div class="flex gap-4">
             <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">Nivel 1</span>
             <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">Duración: 4 Semanas</span>
          </div>
        </div>
      </div>

      <div class="border-t pt-8">
        <h2 class="text-3xl font-bold font-oswald mb-6">Plan de Entrenamiento - Semana 1</h2>
        <div class="space-y-4">
          ${program.exercises ? program.exercises.map(ex => `
            <div class="exercise-item bg-gray-50 rounded-xl p-4 hover:bg-white hover:shadow-md transition">
              <img src="${ex.image}" alt="${ex.name}" class="exercise-img shadow-sm">
              <div class="flex-1">
                <h4 class="text-xl font-bold text-primary-dark mb-1">${ex.name}</h4>
                <p class="text-gray-500 text-sm mb-2">Enfoque en técnica y control.</p>
                <div class="flex gap-4 text-sm text-gray-700">
                  <span class="bg-white px-3 py-1 rounded border">Sets: <strong>${ex.sets}</strong></span>
                  <span class="bg-white px-3 py-1 rounded border">Reps: <strong>${ex.reps}</strong></span>
                </div>
              </div>
            </div>
          `).join('') : '<p>Contenido en desarrollo.</p>'}
        </div>
      </div>
    </div>
  `;

    // Show View
    view.classList.remove('hidden');
    // Small delay to allow display:block to apply before transition
    setTimeout(() => {
        view.classList.add('active');
    }, 10);

    // Disable body scroll
    document.body.style.overflow = 'hidden';
}

function closeFullscreenView() {
    const view = document.getElementById('fullscreen-program-view');
    view.classList.remove('active');

    // Wait for transition to finish before hiding
    setTimeout(() => {
        view.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scroll
    }, 300);
}

// Add to setupEventListeners
function setupEventListeners() {
    // Buy Buttons
    document.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const planId = e.target.dataset.planId;
            handlePurchase(planId);
        });
    });

    // Levels Toggle
    document.querySelectorAll('.levels-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.dataset.target;
            const target = document.querySelector(targetId);
            target.classList.toggle('hidden');
            if (target.style.display === 'none' || !target.style.display) {
                target.style.display = 'block';
            } else {
                target.style.display = 'none';
            }
        });
    });

    // Close Fullscreen Button
    const closeBtn = document.getElementById('close-fullscreen-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeFullscreenView);
    }

    // Hide level panels by default
    document.querySelectorAll('.levels-panel').forEach(el => el.style.display = 'none');
}

// --- Modals ---

function openAuthModal() {
    const html = `
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold font-oswald">Acceso de Usuarios</h2>
      <p class="text-gray-600 text-sm">Ingresa para ver tus programas</p>
    </div>
    
    <div class="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
      <button onclick="switchAuthTab('login')" id="tab-login" class="flex-1 py-2 rounded-md text-sm font-bold bg-white shadow-sm">Login</button>
      <button onclick="switchAuthTab('register')" id="tab-register" class="flex-1 py-2 rounded-md text-sm font-bold text-gray-500 hover:text-black">Registro</button>
    </div>

    <form id="login-form" class="auth-form space-y-4" onsubmit="event.preventDefault(); login(this.email.value, this.password.value)">
      <input type="email" name="email" placeholder="Tu correo electrónico" required>
      <input type="password" name="password" placeholder="Contraseña" required>
      <button type="submit" class="w-full py-3 rounded-lg bg-accent-vibrant text-black font-bold hover:opacity-90">Entrar</button>
    </form>

    <form id="register-form" class="auth-form space-y-4 hidden" onsubmit="event.preventDefault(); register(this.name.value, this.email.value, this.password.value)">
      <input type="text" name="name" placeholder="Nombre completo" required>
      <input type="email" name="email" placeholder="Tu correo electrónico" required>
      <input type="password" name="password" placeholder="Crea una contraseña" required>
      <button type="submit" class="w-full py-3 rounded-lg bg-black text-white font-bold hover:bg-gray-800">Crear Cuenta</button>
    </form>
  `;
    showModal(html);
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.add('bg-white', 'shadow-sm');
        tabLogin.classList.remove('text-gray-500');
        tabRegister.classList.remove('bg-white', 'shadow-sm');
        tabRegister.classList.add('text-gray-500');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabRegister.classList.add('bg-white', 'shadow-sm');
        tabRegister.classList.remove('text-gray-500');
        tabLogin.classList.remove('bg-white', 'shadow-sm');
        tabLogin.classList.add('text-gray-500');
    }
}

function showModal(content) {
    let modal = document.getElementById('main-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'main-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="closeModal()">×</button>
        <div id="modal-body"></div>
      </div>
    `;
        document.body.appendChild(modal);

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.getElementById('modal-body').innerHTML = content;
    // Small delay to allow CSS transition
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal() {
    const modal = document.getElementById('main-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            // Optional: remove from DOM or just hide
            // modal.remove(); 
        }, 300);
    }
}

// Global helpers
window.calc1RM = function () {
    const w = parseFloat(document.getElementById('rm-peso').value);
    const r = parseInt(document.getElementById('rm-reps').value);
    if (!w || !r) return;
    const rm = Math.round(w * (1 + r / 30));
    document.getElementById('rm-res').innerHTML = `Tu 1RM estimado es: <strong>${rm} kg</strong>`;
}

window.generateQuickRoutine = function () {
    const routines = [
        "A: Sentadilla 3x5, Press Banca 3x5, Remo Pendlay 3x8",
        "B: Peso Muerto 1x5, Press Militar 3x5, Dominadas 3xMax",
        "Full Body: Prensa 3x12, Flexiones 3x15, Zancadas 2x20"
    ];
    const random = routines[Math.floor(Math.random() * routines.length)];
    document.getElementById('routine-res').innerHTML = `<strong>Rutina Sugerida:</strong><br>${random}`;
}
