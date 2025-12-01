
// Mock Data for Programs and Exercises (Static Content)
const PROGRAMS_DATA = {
    'genesis': {
        id: 'genesis',
        name: 'GÉNESIS',
        description: 'Programa de prueba para principiantes. Fundamentos del movimiento.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop',
        exercises: [
            { name: 'Sentadilla Goblet', sets: 3, reps: '10-12', image: 'exercise_squat.png' },
            { name: 'Flexiones', sets: 3, reps: 'AMRAP', image: 'exercise_bench_press.png' },
            { name: 'Plancha Abdominal', sets: 3, reps: '30s', image: 'exercise_deadlift.png' }
        ]
    },
    'milon_n1': {
        id: 'milon_n1',
        name: 'MILON - Nivel 1',
        description: 'Fuerza y rendimiento general. Construye una base sólida.',
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1974&auto=format&fit=crop',
        exercises: [
            { name: 'Sentadilla Trasera', sets: 4, reps: '5', image: 'exercise_squat.png' },
            { name: 'Press Banca', sets: 4, reps: '5', image: 'exercise_bench_press.png' },
            { name: 'Peso Muerto', sets: 3, reps: '5', image: 'exercise_deadlift.png' }
        ]
    },
    'afrodita_n1': {
        id: 'afrodita_n1',
        name: 'AFRODITA - Nivel 1',
        description: 'Hipertrofia de glúteos y piernas. Enfoque estético y funcional.',
        image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop',
        exercises: [
            { name: 'Hip Thrust', sets: 4, reps: '10-12', image: 'program_afrodita_fitness.png' },
            { name: 'Sentadilla Búlgara', sets: 3, reps: '12', image: 'exercise_squat.png' },
            { name: 'Patada de Glúteo', sets: 3, reps: '15', image: 'program_afrodita_fitness.png' }
        ]
    }
};

// State Management
const state = {
    user: JSON.parse(localStorage.getItem('currentUser')) || null,
    purchases: [], // Will be fetched from Supabase
    students: JSON.parse(localStorage.getItem('professorStudents')) || [] // Local mock for students
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    if (state.user) {
        await fetchPurchases();
    }
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
        });
    });

    // Close Fullscreen Button
    const closeBtn = document.getElementById('close-fullscreen-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeFullscreenView);
    }
}

// --- Supabase Logic ---

async function fetchPurchases() {
    if (!state.user || !state.user.id) return;

    // Real Supabase Query
    try {
        const { data, error } = await sb
            .from('purchases')
            .select('plan_id')
            .eq('user_id', state.user.id);

        if (error) {
            console.warn('Supabase fetch error (expected if table missing in demo):', error);
            // Fallback to local storage for demo continuity
            const localPurchases = JSON.parse(localStorage.getItem(`purchases_${state.user.email}`)) || [];
            state.purchases = localPurchases;
        } else {
            state.purchases = data.map(p => p.plan_id);
            // Merge with local for hybrid demo experience
            const localPurchases = JSON.parse(localStorage.getItem(`purchases_${state.user.email}`)) || [];
            state.purchases = [...new Set([...state.purchases, ...localPurchases])];
        }
    } catch (err) {
        console.error('Supabase connection failed:', err);
        // Fallback
        const localPurchases = JSON.parse(localStorage.getItem(`purchases_${state.user.email}`)) || [];
        state.purchases = localPurchases;
        setTimeout(() => dashboard.classList.add('hidden'), 300);
    }

    function addStudent() {
        const name = document.getElementById('student-name').value;
        const email = document.getElementById('student-email').value;
        const notes = document.getElementById('student-notes').value;

        const newStudent = { id: Date.now(), name, email, notes, date: new Date().toLocaleDateString() };
        state.students.push(newStudent);
        localStorage.setItem('professorStudents', JSON.stringify(state.students));

        // Clear form
        document.getElementById('add-student-form').reset();
        renderStudentList();
        alert('Alumno guardado correctamente.');
    }

    function renderStudentList() {
        const tbody = document.getElementById('student-list-body');
        if (state.students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-500">No hay alumnos registrados.</td></tr>';
            return;
        }

        tbody.innerHTML = state.students.map(s => `
    <tr class="hover:bg-gray-700/50 transition">
      <td class="py-3 font-bold text-white">${s.name}</td>
      <td class="py-3 text-gray-400">${s.email || '-'}</td>
      <td class="py-3 text-gray-400 truncate max-w-xs">${s.notes}</td>
      <td class="py-3 text-right">
        <button onclick="deleteStudent(${s.id})" class="text-red-400 hover:text-red-300 text-xs font-bold uppercase">Eliminar</button>
      </td>
    </tr>
  `).join('');
    }

    function deleteStudent(id) {
        if (confirm('¿Eliminar alumno?')) {
            state.students = state.students.filter(s => s.id !== id);
            localStorage.setItem('professorStudents', JSON.stringify(state.students));
            renderStudentList();
        }
    }

    // --- Routine Generator Logic ---

    window.generateQuickRoutine = function () {
        const authors = [
            {
                name: "John Meadows (Mountain Dog)",
                style: "Alta Intensidad / Drop Sets",
                routine: "1. Press Inclinado con Mancuernas: 3x8 (Drop set en la última)<br>2. Aperturas en Máquina: 3x12 (Estiramiento forzado 10s)<br>3. Sentadilla Hack: 1x20 (Widowmaker)<br>4. Peso Muerto Rumano: 3x10 (Tempo 3-1-1)"
            },
            {
                name: "Mark Rippetoe (Starting Strength)",
                style: "Fuerza Básica 5x5",
                routine: "1. Sentadilla Trasera: 3x5<br>2. Press Militar: 3x5<br>3. Power Clean: 5x3<br>4. Dominadas: 3xFallo"
            },
            {
                name: "Louie Simmons (Westside Barbell)",
                style: "Max Effort / Dynamic Effort",
                routine: "1. Box Squat (Max Effort): 1RM del día<br>2. Good Mornings: 3x8 (Pesado)<br>3. Reverse Hypers: 4x15<br>4. Trabajo de Tríceps con Bandas: 100 reps total"
            },
            {
                name: "Charles Poliquin",
                style: "German Volume Training (GVT)",
                routine: "1. Press Banca: 10x10 (60% 1RM, Tempo 4-0-1-0)<br>2. Dominadas Supinas: 10x10 (Tempo 4-0-1-0)<br>3. Face Pulls: 3x12<br>4. Curl Martillo: 3x10"
            }
        ];

        const random = authors[Math.floor(Math.random() * authors.length)];

        const resultDiv = document.getElementById('routine-res');
        resultDiv.innerHTML = `
    <div class="bg-slate-800 p-4 rounded-lg border border-slate-600 mt-2 animate-fade-in">
      <h4 class="text-accent-vibrant font-bold text-lg mb-1">${random.name}</h4>
      <span class="text-xs font-bold bg-slate-700 px-2 py-1 rounded text-gray-300 mb-3 inline-block">${random.style}</span>
      <p class="text-sm text-gray-200 leading-relaxed">${random.routine}</p>
    </div>
  `;
    }

    // --- Rendering ---

    const navContent = state.user
        ? `
        <div class="flex items-center gap-4">
            <span class="text-sm text-gray-300 hidden sm:block">Hola, <span class="text-accent-vibrant font-bold">${state.user.name}</span></span>
            ${state.user.role === 'admin' ? '<button onclick="openDashboard()" class="px-4 py-2 rounded-lg bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20">Panel Profe</button>' : ''}
            <button onclick="logout()" class="px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-white transition text-sm font-bold">Salir</button>
        </div>
        `
        : `
        <button onclick="openAuthModal()" class="px-6 py-2 rounded-lg bg-accent-vibrant text-black font-bold text-sm hover:bg-orange-600 transition shadow-lg shadow-orange-500/20 uppercase tracking-wide">
            Iniciar Sesión
        </button>
        `;

    headerPlaceholder.innerHTML = `
    <header class="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div class="flex items-center gap-3 group cursor-pointer" onclick="window.scrollTo(0,0)">
           <div class="w-10 h-10 bg-gradient-to-br from-accent-vibrant to-orange-600 rounded-lg flex items-center justify-center text-black font-oswald font-bold text-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">RM</div>
           <div class="flex flex-col">
             <span class="font-oswald font-bold text-xl tracking-tighter text-white leading-none">REPETICIÓN</span>
             <span class="font-oswald font-bold text-xl tracking-tighter text-accent-vibrant leading-none">MÁXIMA</span>
           </div>
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

    if (!state.user) {
        grid.innerHTML = `
      <div class="col-span-full text-center py-12 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
        <p class="text-gray-400 mb-4">Inicia sesión para ver tus programas adquiridos.</p>
        <button onclick="openAuthModal()" class="px-6 py-2 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600">Ingresar</button>
      </div>
    `;
        return;
    }

    if (state.purchases.length === 0) {
        grid.innerHTML = `
      <div class="col-span-full text-center py-12 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
        <p class="text-gray-400 mb-4">Aún no tienes programas. ¡Explora la tienda!</p>
        <a href="#programas" class="px-6 py-2 bg-accent-vibrant text-black rounded-lg font-bold hover:bg-orange-600">Ver Catálogo</a>
      </div>
    `;
        return;
    }

    grid.innerHTML = state.purchases.map(planId => {
        const program = PROGRAMS_DATA[planId] || { name: planId, description: 'Programa adquirido', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop' };
        const imgSrc = program.image;

        return `
      <div class="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700 flex flex-col group hover:border-accent-vibrant/50 transition-colors">
        <div class="h-40 relative overflow-hidden">
           <img src="${imgSrc}" alt="${program.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100">
           <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>
        <div class="p-5 flex-1 flex flex-col">
          <h3 class="font-bold text-lg mb-1 text-white font-oswald tracking-wide">${program.name}</h3>
          <p class="text-sm text-gray-400 mb-4 flex-1">${program.description}</p>
          <button onclick="openProgramDetails('${planId}')" class="w-full py-2 rounded-lg bg-white text-black font-bold text-sm hover:bg-gray-200 uppercase tracking-wider">Acceder</button>
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

    content.innerHTML = `
    <div class="animate-fade-in">
      <div class="flex flex-col md:flex-row gap-8 mb-8">
        <div class="md:w-1/3">
           <img src="${program.image}" alt="${program.name}" class="w-full rounded-xl shadow-2xl border border-gray-200/10">
        </div>
        <div class="md:w-2/3">
          <h1 class="text-5xl md:text-6xl font-black font-oswald mb-4 text-primary-dark">${program.name}</h1>
          <p class="text-xl text-gray-600 mb-6 font-light">${program.description}</p>
          <div class="flex gap-4">
             <span class="px-4 py-1 rounded-full bg-primary-dark text-white font-bold text-sm uppercase tracking-wider">Nivel 1</span>
             <span class="px-4 py-1 rounded-full bg-gray-200 text-gray-800 font-bold text-sm uppercase tracking-wider">4 Semanas</span>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 pt-8">
        <h2 class="text-3xl font-bold font-oswald mb-6 text-primary-dark">Plan de Entrenamiento - Semana 1</h2>
        <div class="space-y-4">
          ${program.exercises ? program.exercises.map(ex => `
            <div class="exercise-item bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition flex gap-4 items-center">
              <img src="${ex.image}" alt="${ex.name}" class="w-24 h-24 object-cover rounded-lg bg-gray-100">
              <div class="flex-1">
                <h4 class="text-xl font-bold text-primary-dark mb-1">${ex.name}</h4>
                <p class="text-gray-500 text-sm mb-2">Enfoque en técnica y control.</p>
                <div class="flex gap-3 text-sm text-gray-700">
                  <span class="bg-gray-100 px-3 py-1 rounded font-mono">Sets: <strong>${ex.sets}</strong></span>
                  <span class="bg-gray-100 px-3 py-1 rounded font-mono">Reps: <strong>${ex.reps}</strong></span>
                </div>
              </div>
            </div>
          `).join('') : '<p>Contenido en desarrollo.</p>'}
        </div>
      </div>
    </div>
  `;

    view.classList.remove('hidden');
    setTimeout(() => view.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function closeFullscreenView() {
    const view = document.getElementById('fullscreen-program-view');
    view.classList.remove('active');
    setTimeout(() => {
        view.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}

// --- Modals ---

function openAuthModal() {
    const html = `
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold font-oswald text-white">Acceso de Usuarios</h2>
      <p class="text-gray-400 text-sm">Ingresa para ver tus programas</p>
    </div>
    
    <div class="flex gap-2 mb-6 p-1 bg-slate-800 rounded-lg border border-slate-700">
      <button onclick="switchAuthTab('login')" id="tab-login" class="flex-1 py-2 rounded-md text-sm font-bold bg-slate-600 text-white shadow-sm transition-all">Login</button>
      <button onclick="switchAuthTab('register')" id="tab-register" class="flex-1 py-2 rounded-md text-sm font-bold text-gray-400 hover:text-white transition-all">Registro</button>
    </div>

    <form id="login-form" class="auth-form space-y-4" onsubmit="event.preventDefault(); login(this.email.value, this.password.value)">
      <input type="email" name="email" placeholder="Tu correo electrónico" required>
      <input type="password" name="password" placeholder="Contraseña" required>
      <button type="submit" class="w-full py-3 rounded-lg bg-accent-vibrant text-black font-bold hover:bg-orange-600 transition uppercase tracking-wide">Entrar</button>
    </form>

    <form id="register-form" class="auth-form space-y-4 hidden" onsubmit="event.preventDefault(); register(this.name.value, this.email.value, this.password.value)">
      <input type="text" name="name" placeholder="Nombre completo" required>
      <input type="email" name="email" placeholder="Tu correo electrónico" required>
      <input type="password" name="password" placeholder="Crea una contraseña" required>
      <button type="submit" class="w-full py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition uppercase tracking-wide">Crear Cuenta</button>
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
        tabLogin.classList.add('bg-slate-600', 'text-white');
        tabLogin.classList.remove('text-gray-400');
        tabRegister.classList.remove('bg-slate-600', 'text-white');
        tabRegister.classList.add('text-gray-400');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabRegister.classList.add('bg-slate-600', 'text-white');
        tabRegister.classList.remove('text-gray-400');
        tabLogin.classList.remove('bg-slate-600', 'text-white');
        tabLogin.classList.add('text-gray-400');
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
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.getElementById('modal-body').innerHTML = content;
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal() {
    const modal = document.getElementById('main-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Global helpers
window.calc1RM = function () {
    const w = parseFloat(document.getElementById('rm-peso').value);
    const r = parseInt(document.getElementById('rm-reps').value);
    if (!w || !r) return;
    const rm = Math.round(w * (1 + r / 30));
    document.getElementById('rm-res').innerHTML = `Tu 1RM estimado es: <strong class="text-accent-vibrant text-lg">${rm} kg</strong>`;
}

window.openAuthModal = openAuthModal;
window.openDashboard = openDashboard;
window.closeDashboard = closeDashboard;
window.addStudent = addStudent;
window.deleteStudent = deleteStudent;
