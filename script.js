// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
const SUPABASE_URL = "https://arwxqomdfquhkneufnnh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyd3hxb21kZnF1aGtuZXVmbm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODc3MjUsImV4cCI6MjA3Nzg2MzcyNX0.ts0LsML3MBHAEptN9xmUdsFZDX7wETbbWvAVhtrtcqc";

// Inicializar cliente
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables Globales
let currentUser = null;
let userPurchases = new Set(); // Aquí guardaremos los IDs de los planes comprados

// CORREO DE ADMINISTRADOR (TÚ) - Solo este correo verá el panel de profe
const ADMIN_EMAIL = "edfmarcoflores@gmail.com"; 


// ==========================================
// 1. INICIALIZACIÓN Y LOGIN
// ==========================================

window.addEventListener('load', () => {
    console.log("Sistema Repetición Máxima: Iniciando...");
    checkSession();
    setupStoreButtons(); // Prepara los botones de compra para que sean inteligentes
});

async function checkSession() {
    // Verificar si hay sesión activa
    const { data: { session } } = await sb.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        updateUI(true);
        await loadUserPrograms(); // Cargar compras reales desde la DB
    } else {
        updateUI(false);
    }
}

function updateUI(isLoggedIn) {
    const authStatus = document.getElementById('auth-status');
    // Buscamos si existe el elemento en el HTML (puede que esté oculto en móvil)
    if (authStatus) {
        if (isLoggedIn) {
            // Mostrar parte del correo
            authStatus.innerHTML = `Hola, <span class="text-accent-vibrant font-bold">${currentUser.email.split('@')[0]}</span>`;
            authStatus.classList.remove('hidden');
        } else {
            // Mostrar botón de entrar
            authStatus.innerHTML = `<button onclick="login()" class="underline hover:text-accent-vibrant font-bold">Iniciar Sesión</button>`;
            authStatus.classList.remove('hidden');
        }
    }
}

async function login() {
    const email = prompt("Ingresa tu correo para iniciar sesión:");
    if (!email) return;
    
    alert("Enviando enlace mágico a tu correo...");
    const { error } = await sb.auth.signInWithOtp({ email });
    
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("¡Listo! Revisa tu bandeja de entrada (y SPAM) para entrar.");
    }
}


// ==========================================
// 2. CARGA DE COMPRAS Y PERMISOS
// ==========================================

async function loadUserPrograms() {
    if (!currentUser) return;

    // Consultar tabla 'purchases'
    const { data: purchases, error } = await sb
        .from('purchases')
        .select('plan_id, status')
        .eq('user_id', currentUser.id);

    if (error) {
        console.error("Error cargando programas:", error);
        return;
    }

    // Guardar los IDs en memoria para consultar rápido después
    userPurchases.clear();
    purchases.forEach(p => userPurchases.add(p.plan_id));

    // Mostrar las tarjetas en la sección "Mis Programas"
    renderMyPrograms(purchases);
}

function renderMyPrograms(purchases) {
    const grid = document.getElementById('mis-programas-grid');
    if (!grid) return;

    if (purchases && purchases.length > 0) {
        grid.innerHTML = ''; // Limpiar mensaje de "vacío"
        
        // Diccionario para traducir IDs raros a Nombres Reales
        // IMPORTANTE: Aquí van tanto los UUIDs reales como los nombres cortos antiguos
        const planNames = {
            'milon_n1': 'Milón - Nivel 1',
            '9ba1907c-01f4-4dc9-9b68-87653e136ea5': 'Milón - Nivel 1', // UUID Real
            'afrodita_n1': 'Afrodita - Nivel 1',
            'hercules': 'Hércules',
            'kronos': 'Kronos',
            'genesis': 'Génesis (Demo)'
        };

        purchases.forEach(p => {
            const nombre = planNames[p.plan_id] || 'Programa Exclusivo';
            
            const card = document.createElement('div');
            card.className = "bg-primary-dark text-white p-6 rounded-xl border border-gray-700 flex flex-col justify-between shadow-lg hover:border-accent-vibrant transition-colors";
            card.innerHTML = `
                <div>
                    <h3 class="text-xl font-bold text-accent-vibrant mb-2 font-oswald uppercase">${nombre}</h3>
                    <p class="text-xs text-gray-400 mb-4">Estado: <span class="text-green-400">Activo</span></p>
                </div>
                <button onclick="openProgramViewer('${p.plan_id}')" class="w-full py-3 bg-white text-black font-bold uppercase text-sm rounded hover:bg-gray-200 transition-colors">
                    ABRIR PROGRAMA
                </button>
            `;
            grid.appendChild(card);
        });
    }
}


// ==========================================
// 3. BOTONES INTELIGENTES (LÓGICA DE TIENDA)
// ==========================================

function setupStoreButtons() {
    // Busca todos los botones de compra (los que tienen data-plan-id)
    const buttons = document.querySelectorAll('button[data-plan-id]');
    
    buttons.forEach(btn => {
        // Clonar para limpiar eventos viejos
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            const planId = newBtn.getAttribute('data-plan-id');
            const planUUID = getUUIDFor(planId); // Convertir si es necesario

            // 1. ¿El usuario está logueado y tiene el plan?
            if (currentUser && (userPurchases.has(planId) || userPurchases.has(planUUID))) {
                // SÍ lo tiene -> Abrir visor directamente
                openProgramViewer(planId);
            } else {
                // NO lo tiene -> Mostrar mensaje de venta
                if(currentUser) {
                     alert("Aún no tienes acceso a este nivel. ¡Cómpralo para desbloquear!");
                     // Aquí iría el redirect a MercadoPago en el futuro
                } else {
                     alert("Inicia sesión o regístrate para comprar este programa.");
                     login(); // Abrir login
                }
            }
        });
    });
}

// Ayuda a convertir nombres cortos a UUIDs si usaste UUIDs en la base de datos
function getUUIDFor(shortId) {
    const map = {
        'milon_n1': '9ba1907c-01f4-4dc9-9b68-87653e136ea5',
        // Puedes agregar más aquí si copias más IDs de Supabase
    };
    return map[shortId] || shortId;
}


// ==========================================
// 4. BITÁCORA DE PROFESOR (DASHBOARD REAL)
// ==========================================

function openAuthModal() {
    if (!currentUser) {
        alert("Debes iniciar sesión primero para verificar si eres profesor.");
        login();
        return;
    }

    // VERIFICACIÓN DE SEGURIDAD
    if (currentUser.email === ADMIN_EMAIL) {
        showTeacherDashboard();
    } else {
        alert("⛔ ACCESO DENEGADO\nEsta sección es exclusiva para el Profesor Marco Flores.");
    }
}

function showTeacherDashboard() {
    // HTML del Panel de Control
    const dashboardHTML = `
    <div id="teacher-dash" class="fixed inset-0 z-[100] bg-gray-900 text-white overflow-y-auto p-6 animate-fade-in">
        <div class="max-w-6xl mx-auto">
            <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
                <h1 class="text-3xl font-oswald text-accent-vibrant uppercase">PANEL DE CONTROL - PROFESOR</h1>
                <button onclick="document.getElementById('teacher-dash').remove()" class="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold transition">CERRAR</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Sección Alumnos -->
                <div class="bg-black p-6 rounded-xl border border-gray-800">
                    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">👥 Gestión de Alumnos</h3>
                    <p class="text-gray-400 text-sm mb-4">Lista de alumnos registrados en la plataforma.</p>
                    
                    <div class="bg-gray-800 rounded p-4 h-64 overflow-y-auto">
                        <p class="text-gray-500 text-sm text-center italic mt-10">Conectando con Supabase para traer lista...</p>
                        <!-- Aquí podrías inyectar la lista real con otra función -->
                    </div>
                    <button class="mt-4 w-full border border-accent-vibrant text-accent-vibrant py-2 rounded hover:bg-accent-vibrant hover:text-black font-bold transition">
                        + Agregar Nuevo Alumno
                    </button>
                </div>

                <!-- Sección Notas -->
                <div class="bg-black p-6 rounded-xl border border-gray-800">
                    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">📝 Notas Rápidas</h3>
                    <textarea class="w-full h-40 bg-gray-900 border border-gray-700 p-4 rounded text-white focus:outline-none focus:border-accent-vibrant" placeholder="Escribe recordatorios o pendientes aquí..."></textarea>
                    <button class="mt-4 bg-accent-vibrant text-black font-bold py-2 px-4 rounded w-full hover:bg-orange-600 transition">
                        GUARDAR NOTA
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', dashboardHTML);
}


// ==========================================
// 5. VISOR FULL SCREEN (Pantalla Completa)
// ==========================================

function openProgramViewer(planId) {
    // Muestra el contenido del programa en grande
    const viewerHTML = `
    <div id="program-viewer" class="fixed inset-0 z-[100] bg-black text-white overflow-y-auto animate-fade-in">
        <div class="max-w-5xl mx-auto min-h-screen bg-gray-900 relative border-x border-gray-800 shadow-2xl">
            
            <!-- Barra Superior -->
            <div class="sticky top-0 bg-black/95 backdrop-blur-md p-4 border-b border-gray-800 flex justify-between items-center z-50">
                <h2 class="text-xl font-oswald text-accent-vibrant uppercase tracking-wider">ENTRENAMIENTO: ${planId.toUpperCase().replace('_',' ')}</h2>
                <button onclick="document.getElementById('program-viewer').remove(); document.body.style.overflow='';" class="px-4 py-2 bg-white text-black font-bold text-xs rounded hover:bg-gray-300 transition-colors uppercase">
                    ✕ Cerrar
                </button>
            </div>

            <!-- Contenido -->
            <div class="p-6 md:p-12 space-y-12">
                <!-- Bienvenida -->
                <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl border-l-4 border-accent-vibrant shadow-lg">
                    <h1 class="text-3xl md:text-5xl font-bold mb-3 font-oswald uppercase text-white">Fase 1: Construcción</h1>
                    <p class="text-gray-300 text-lg">Enfócate en la técnica perfecta y controla la fase excéntrica (bajada). RIR 2-3 en todas las series.</p>
                </div>

                <!-- Ejemplo de Rutina -->
                <div>
                    <h3 class="text-2xl font-oswald uppercase text-white border-b border-gray-700 pb-2 mb-6">Día 1: Torso / Empuje</h3>
                    
                    <div class="space-y-4">
                        <!-- Ejercicio -->
                        <div class="bg-black p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 border border-gray-800 hover:border-accent-vibrant transition-all group">
                            <div class="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-500 font-mono group-hover:text-white">VIDEO</div>
                            <div class="flex-1">
                                <h4 class="font-bold text-xl text-white mb-1">Press Banca con Barra</h4>
                                <p class="text-sm text-gray-400">Retrae escápulas. Baja controlado al pecho.</p>
                            </div>
                            <div class="bg-gray-900 px-6 py-3 rounded border border-gray-700 text-center min-w-[140px]">
                                <span class="block text-accent-vibrant font-bold text-2xl font-oswald">3 x 8-10</span>
                                <span class="text-[10px] text-gray-500 uppercase tracking-widest">Series x Reps</span>
                            </div>
                        </div>

                         <!-- Ejercicio -->
                        <div class="bg-black p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 border border-gray-800 hover:border-accent-vibrant transition-all group">
                            <div class="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-500 font-mono group-hover:text-white">VIDEO</div>
                            <div class="flex-1">
                                <h4 class="font-bold text-xl text-white mb-1">Press Militar Mancuernas</h4>
                                <p class="text-sm text-gray-400">Sentado. Espalda recta. Rango completo.</p>
                            </div>
                            <div class="bg-gray-900 px-6 py-3 rounded border border-gray-700 text-center min-w-[140px]">
                                <span class="block text-accent-vibrant font-bold text-2xl font-oswald">3 x 10-12</span>
                                <span class="text-[10px] text-gray-500 uppercase tracking-widest">Series x Reps</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', viewerHTML);
    document.body.style.overflow = 'hidden'; // Bloquear scroll de la web principal
}


// ==========================================
// 6. GENERADOR DE RUTINAS & HERRAMIENTAS
// ==========================================

function generateQuickRoutine() {
    // Autores variados
    const authors = [
        {
            name: "Estilo John Meadows (Mountain Dog)",
            desc: "Alta intensidad, pre-activación y ejercicios de estiramiento bajo carga.",
            routine: "1. Curl Femoral (Drop set 12/8/20)<br>2. Sentadilla Hack (3x8 bajando lento)<br>3. Prensa (3x15 pies juntos)<br>4. Zancadas (2 sets al fallo)"
        },
        {
            name: "Estilo Mark Rippetoe (Starting Strength)",
            desc: "Básicos pesados. 5 repeticiones. Fuerza bruta.",
            routine: "1. Sentadilla (3x5)<br>2. Press Militar (3x5)<br>3. Peso Muerto (1x5)<br>Descanso: 3-5 min entre series."
        },
        {
            name: "Estilo Louie Simmons (Westside)",
            desc: "Método conjugado. Día de esfuerzo máximo.",
            routine: "1. Box Squat (Buscar 1RM)<br>2. Buenos Días (3x8 pesado)<br>3. Extensiones de Tríceps (4x15)<br>4. Trabajo de Abdomen pesado."
        },
        {
            name: "Estilo Charles Poliquin (GVT)",
            desc: "Entrenamiento Alemán de Volumen. Acumulación pura.",
            routine: "1. Sentadilla (10 series x 10 repeticiones)<br>2. Curl Femoral (10 series x 10 repeticiones)<br>Tempo: 4-0-2-0."
        }
    ];

    const random = Math.floor(Math.random() * authors.length);
    const selected = authors[random];

    const resultBox = document.getElementById('routine-res');
    resultBox.innerHTML = `
        <div class="border-l-4 border-accent-vibrant pl-4 py-2 bg-white/50 rounded">
            <strong class="text-accent-vibrant block text-lg font-oswald uppercase mb-1">${selected.name}</strong>
            <p class="text-xs text-gray-600 italic mb-3 border-b border-gray-200 pb-2">${selected.desc}</p>
            <div class="text-sm font-medium text-gray-800 leading-relaxed">
                ${selected.routine}
            </div>
        </div>
    `;
    resultBox.classList.remove('hidden');
}

function calc1RM() {
    const peso = parseFloat(document.getElementById('rm-peso').value);
    const reps = parseFloat(document.getElementById('rm-reps').value);
    const resDiv = document.getElementById('rm-res');

    if (!peso || !reps) {
        resDiv.innerHTML = "<span class='text-red-500 font-bold text-xs'>Ingresa peso y reps.</span>";
        resDiv.classList.remove('hidden');
        return;
    }

    // Fórmula Epley
    const rm = Math.round(peso * (1 + reps / 30));
    
    resDiv.innerHTML = `
        <div class="mt-4 text-center bg-gray-100 p-3 rounded border border-gray-200">
            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Tu 1RM Estimado</p>
            <p class="text-4xl font-bold text-accent-vibrant font-oswald">${rm} <span class="text-lg text-gray-600">kg</span></p>
        </div>
    `;
    resDiv.classList.remove('hidden');
}

function handleFormSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerText = "ENVIANDO...";
    btn.disabled = true;
    
    setTimeout(() => {
        alert("¡Mensaje recibido! Te escribiré al WhatsApp pronto.");
        e.target.reset();
        btn.innerText = originalText;
        btn.disabled = false;
    }, 1500);
}