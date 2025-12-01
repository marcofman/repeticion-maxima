// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
const SUPABASE_URL = "https://arwxqomdfquhkneufnnh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyd3hxb21kZnF1aGtuZXVmbm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODc3MjUsImV4cCI6MjA3Nzg2MzcyNX0.ts0LsML3MBHAEptN9xmUdsFZDX7wETbbWvAVhtrtcqc";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let userPurchases = new Set();
const ADMIN_EMAIL = "edfmarcoflores@gmail.com"; 

// ==========================================
// BASE DE DATOS DE CONTENIDO (TUS RUTINAS)
// ==========================================
const PROGRAM_CONTENT = {
    // --- MILÓN NIVEL 1 (Tu bosquejo base) ---
    'milon_n1': {
        title: "Milón - Nivel 1: Fundamentos",
        phase: "Fase 1: Adaptación Anatómica",
        desc: "Construyendo la base. Enfócate en aprender los patrones de movimiento y fortalecer tendones. Tempo: 3-0-1-0.",
        days: [
            {
                name: "Día 1: Full Body A",
                exercises: [
                    { name: "Sentadilla Goblet", sets: "3", reps: "10-12", note: "Baja en 3 segundos. Pecho arriba." },
                    { name: "Press Banca Mancuernas", sets: "3", reps: "10-12", note: "Rango completo." },
                    { name: "Remo con Mancuerna", sets: "3", reps: "10-12", note: "Apóyate en banco." },
                    { name: "Plancha Abdominal", sets: "3", reps: "30s", note: "Aprieta glúteos." }
                ]
            },
            {
                name: "Día 2: Full Body B",
                exercises: [
                    { name: "Peso Muerto Rumano (Mancuernas)", sets: "3", reps: "10-12", note: "Siente el estiramiento isquio." },
                    { name: "Press Militar Sentado", sets: "3", reps: "10-12", note: "Sin arquear espalda." },
                    { name: "Jalón al Pecho", sets: "3", reps: "10-12", note: "Codos hacia abajo." },
                    { name: "Zancadas", sets: "2", reps: "10/lado", note: "Paso controlado." }
                ]
            }
        ]
    },

    // --- MILÓN NIVEL 2 (CREADO AHORA) ---
    'milon_n2': {
        title: "Milón - Nivel 2: Hipertrofia Base",
        phase: "Fase 2: Acumulación",
        desc: "Aumentamos el volumen y la complejidad. El objetivo es generar fatiga muscular controlada (RIR 2).",
        days: [
            {
                name: "Día 1: Tren Inferior (Enfoque Cuádriceps)",
                exercises: [
                    { name: "Sentadilla Trasera", sets: "4", reps: "8-10", note: "Barra alta o baja según comodidad." },
                    { name: "Prensa 45º", sets: "3", reps: "12-15", note: "Pies ancho de hombros. Rango completo." },
                    { name: "Zancadas Estáticas", sets: "3", reps: "10/pierna", note: "Torso vertical." },
                    { name: "Extensiones de Cuádriceps", sets: "3", reps: "15-20", note: "Aguanta 1 segundo arriba." }
                ]
            },
            {
                name: "Día 2: Tren Superior (Empuje + Tracción)",
                exercises: [
                    { name: "Press Banca Plano (Barra)", sets: "4", reps: "8-10", note: "Retrae escápulas." },
                    { name: "Remo con Barra (Pendlay)", sets: "4", reps: "8-10", note: "Torso paralelo al suelo." },
                    { name: "Press Militar Mancuernas", sets: "3", reps: "10-12", note: "Sentado o de pie." },
                    { name: "Dominadas (o Jalón)", sets: "3", reps: "Al fallo - 1", note: "Controla la bajada." }
                ]
            },
            {
                name: "Día 3: Tren Inferior (Enfoque Cadena Posterior)",
                exercises: [
                    { name: "Peso Muerto Convencional", sets: "3", reps: "6-8", note: "Técnica perfecta. Reset en cada rep." },
                    { name: "Hip Thrust", sets: "4", reps: "10-12", note: "Pausa de 2 segundos arriba." },
                    { name: "Curl Femoral Tumbado", sets: "3", reps: "12-15", note: "No levantes la cadera del banco." },
                    { name: "Pantorrilla de Pie", sets: "4", reps: "15-20", note: "Rango máximo." }
                ]
            }
        ]
    },

    // --- MILÓN NIVEL 4 (Ejemplo anterior) ---
    'milon_n4': {
        title: "Milón - Nivel 4: Intensificación",
        phase: "Fase 4: Fuerza Mixta",
        desc: "Cargas altas, descansos largos. Prioridad: Mover kilos.",
        days: [
            {
                name: "Día 1: Fuerza Máxima",
                exercises: [
                    { name: "Sentadilla Low Bar", sets: "5", reps: "3-5", note: "Descansa 3-5 min." },
                    { name: "Press Banca Competición", sets: "5", reps: "3-5", note: "Pausa en el pecho." }
                ]
            }
        ]
    },

    // --- AFRODITA NIVEL 1 ---
    'afrodita_n1': {
        title: "Afrodita - Nivel 1: Activación",
        phase: "Fase 1: Glúteo Despierto",
        desc: "Conexión mente-músculo. Aprende a usar la cadera.",
        days: [
            {
                name: "Día 1: Glúteo Pump",
                exercises: [
                    { name: "Glute Bridge", sets: "3", reps: "15-20", note: "Aguanta arriba." },
                    { name: "Clamshells", sets: "3", reps: "15/lado", note: "Con banda elástica." }
                ]
            }
        ]
    },
    
    // Mapeo de IDs reales de Supabase (UUIDs) a nuestras claves de texto
    '9ba1907c-01f4-4dc9-9b68-87653e136ea5': 'milon_n1' 
};

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================

window.addEventListener('load', () => {
    checkSession();
    setupStoreButtons(); 
});

async function checkSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        currentUser = session.user;
        updateUI(true);
        await loadUserPrograms(); 
    } else {
        updateUI(false);
    }
}

function updateUI(isLoggedIn) {
    const authStatus = document.getElementById('auth-status');
    if (authStatus) {
        if (isLoggedIn) {
            authStatus.innerHTML = `Hola, <span class="text-accent-vibrant font-bold">${currentUser.email.split('@')[0]}</span>`;
            authStatus.classList.remove('hidden');
        } else {
            authStatus.innerHTML = `<button onclick="login()" class="underline hover:text-accent-vibrant font-bold">Iniciar Sesión</button>`;
            authStatus.classList.remove('hidden');
        }
    }
}

async function login() {
    const email = prompt("Ingresa tu correo para iniciar sesión:");
    if (!email) return;
    alert("Enviando enlace mágico...");
    const { error } = await sb.auth.signInWithOtp({ email });
    if (error) alert("Error: " + error.message);
    else alert("Revisa tu correo para entrar.");
}

// ==========================================
// 2. CARGA DE COMPRAS
// ==========================================

async function loadUserPrograms() {
    if (!currentUser) return;

    const { data: purchases, error } = await sb
        .from('purchases')
        .select('plan_id, status')
        .eq('user_id', currentUser.id);

    if (error) { console.error(error); return; }

    userPurchases.clear();
    purchases.forEach(p => userPurchases.add(p.plan_id));
    renderMyPrograms(purchases);
}

function renderMyPrograms(purchases) {
    const grid = document.getElementById('mis-programas-grid');
    if (!grid) return;

    if (purchases && purchases.length > 0) {
        grid.innerHTML = ''; 
        
        purchases.forEach(p => {
            // Lógica de mapeo UUID -> Texto
            let contentKey = p.plan_id;
            // Si el ID es un UUID y lo tenemos mapeado, usamos la clave corta
            if (PROGRAM_CONTENT[p.plan_id] && typeof PROGRAM_CONTENT[p.plan_id] === 'string') {
                contentKey = PROGRAM_CONTENT[p.plan_id]; 
            }

            const content = PROGRAM_CONTENT[contentKey];
            const nombre = content ? content.title : 'Programa Exclusivo';
            
            const card = document.createElement('div');
            card.className = "bg-primary-dark text-white p-6 rounded-xl border border-gray-700 flex flex-col justify-between shadow-lg hover:border-accent-vibrant transition-colors";
            card.innerHTML = `
                <div>
                    <h3 class="text-xl font-bold text-accent-vibrant mb-2 font-oswald uppercase">${nombre}</h3>
                    <p class="text-xs text-gray-400 mb-4">Estado: <span class="text-green-400">Activo</span></p>
                </div>
                <button onclick="openProgramViewer('${contentKey}')" class="w-full py-3 bg-white text-black font-bold uppercase text-sm rounded hover:bg-gray-200 transition-colors">
                    ABRIR PROGRAMA
                </button>
            `;
            grid.appendChild(card);
        });
    }
}

// ==========================================
// 3. TIENDA Y BOTONES
// ==========================================

function setupStoreButtons() {
    const buttons = document.querySelectorAll('button[data-plan-id]');
    buttons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            const planId = newBtn.getAttribute('data-plan-id');
            // Mapeo simple
            const realId = planId; 

            if (currentUser && userPurchases.has(realId)) {
                openProgramViewer(realId);
            } else {
                if(currentUser) alert("Aún no tienes acceso a este nivel. ¡Cómpralo para desbloquear!");
                else {
                     alert("Inicia sesión para comprar.");
                     login();
                }
            }
        });
    });
}

// ==========================================
// 4. VISOR DE PROGRAMA
// ==========================================

function openProgramViewer(planId) {
    const content = PROGRAM_CONTENT[planId];

    if (!content) {
        alert("El contenido de este programa se está cargando. Contacta a soporte.");
        return;
    }

    let daysHTML = '';
    content.days.forEach(day => {
        let exercisesHTML = '';
        day.exercises.forEach(ex => {
            exercisesHTML += `
                <div class="bg-black p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 border border-gray-800 hover:border-accent-vibrant transition-all">
                    <div class="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-[10px] text-gray-500 font-mono">VIDEO</div>
                    <div class="flex-1">
                        <h4 class="font-bold text-lg text-white mb-1">${ex.name}</h4>
                        <p class="text-sm text-gray-400">${ex.note}</p>
                    </div>
                    <div class="bg-gray-900 px-4 py-2 rounded border border-gray-700 text-center min-w-[100px]">
                        <span class="block text-accent-vibrant font-bold text-xl font-oswald">${ex.sets} x ${ex.reps}</span>
                    </div>
                </div>
            `;
        });

        daysHTML += `
            <div class="mb-8">
                <h3 class="text-2xl font-oswald uppercase text-white border-b border-gray-700 pb-2 mb-4">${day.name}</h3>
                <div class="space-y-4">${exercisesHTML}</div>
            </div>
        `;
    });

    const viewerHTML = `
    <div id="program-viewer" class="fixed inset-0 z-[100] bg-black text-white overflow-y-auto animate-fade-in">
        <div class="max-w-5xl mx-auto min-h-screen bg-gray-900 relative border-x border-gray-800 shadow-2xl">
            <div class="sticky top-0 bg-black/95 backdrop-blur-md p-4 border-b border-gray-800 flex justify-between items-center z-50">
                <h2 class="text-xl font-oswald text-accent-vibrant uppercase tracking-wider">${content.title}</h2>
                <button onclick="document.getElementById('program-viewer').remove(); document.body.style.overflow='';" class="px-4 py-2 bg-white text-black font-bold text-xs rounded hover:bg-gray-300 transition-colors uppercase">✕ Cerrar</button>
            </div>
            <div class="p-6 md:p-12">
                <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl border-l-4 border-accent-vibrant shadow-lg mb-10">
                    <h1 class="text-3xl font-bold mb-3 font-oswald uppercase text-white">${content.phase}</h1>
                    <p class="text-gray-300 text-lg">${content.desc}</p>
                </div>
                ${daysHTML}
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', viewerHTML);
    document.body.style.overflow = 'hidden';
}

// ==========================================
// 5. EXTRAS
// ==========================================

function openAuthModal() {
    if (!currentUser) { login(); return; }
    if (currentUser.email === ADMIN_EMAIL) {
        const dashHTML = `<div id="teacher-dash" class="fixed inset-0 z-[100] bg-gray-900 text-white p-10"><h1 class="text-3xl">Panel Profe</h1><button onclick="this.parentElement.remove()" class="bg-red-500 p-2 mt-4">Cerrar</button></div>`;
        document.body.insertAdjacentHTML('beforeend', dashHTML);
    } else {
        alert("⛔ Acceso Denegado");
    }
}

function generateQuickRoutine() {
    const authors = [
        { name: "John Meadows", text: "Drop sets y tensión constante." },
        { name: "Mark Rippetoe", text: "5x5 Fuerza básica." }
    ];
    const sel = authors[Math.floor(Math.random()*authors.length)];
    const res = document.getElementById('routine-res');
    res.innerHTML = `<strong>${sel.name}</strong><br>${sel.text}`;
    res.classList.remove('hidden');
}

function calc1RM() {
     const p = document.getElementById('rm-peso').value;
     const r = document.getElementById('rm-reps').value;
     if(p && r) document.getElementById('rm-res').innerHTML = `1RM: <b>${Math.round(p*(1+r/30))} kg</b>`;
     document.getElementById('rm-res').classList.remove('hidden');
}