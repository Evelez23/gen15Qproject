// patients.js - Versión completa con todas las funcionalidades
document.addEventListener('DOMContentLoaded', function() {
    // Fuentes de datos (primero remoto, luego local como fallback)
    const DATA_SOURCES = [
        'https://raw.githubusercontent.com/Evelez23/gen15Qproject/main/data/pacientes.json',
        './data/pacientes.json'
    ];
    
    // Elementos del DOM
    const container = document.getElementById('patients-container');
    const searchInput = document.getElementById('search-input');
    const resetBtn = document.getElementById('reset-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    
    // Variables globales
    let allPatients = [];
    let filteredPatients = [];
    
    // Inicialización
    init();
    
    async function init() {
        showLoading(true);
        clearError();
        
        try {
            // Cargar datos
            allPatients = await loadPatients();
            
            if (allPatients.length === 0) {
                throw new Error("No se encontraron datos de pacientes");
            }
            
            // Mostrar todos los pacientes inicialmente
            filteredPatients = [...allPatients];
            renderPatients(filteredPatients);
            
            // Configurar eventos
            setupEventListeners();
            
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }
    
    // Cargar datos de pacientes
    async function loadPatients() {
        for (const source of DATA_SOURCES) {
            try {
                const response = await fetch(source);
                
                if (!response.ok) {
                    continue; // Intentar con la siguiente fuente
                }
                
                const data = await response.json();
                return data.pacientes || [];
                
            } catch (error) {
                console.error(`Error al cargar ${source}:`, error);
                // Continuar con la siguiente fuente
            }
        }
        
        throw new Error("No se pudieron cargar los datos desde ninguna fuente");
    }
    
    // Renderizar pacientes
    function renderPatients(patients) {
        container.innerHTML = '';
        
        if (patients.length === 0) {
            container.innerHTML = '<p>No se encontraron pacientes que coincidan con los criterios de búsqueda.</p>';
            return;
        }
        
        patients.forEach(patient => {
            const card = document.createElement('div');
            card.className = 'patient-card';
            
            // Formatear síntomas y necesidades
            const symptoms = formatItems(patient['Síntomas principales']);
            const needs = patient.Necesidades ? formatItems(patient.Necesidades) : 'No especificadas';
            
            card.innerHTML = `
                <h3>${patient.Nombre}</h3>
                <p><strong>Edad:</strong> ${patient.Edad} años</p>
                <p><strong>Género:</strong> ${patient.Género}</p>
                <div class="symptoms"><strong>Síntomas principales:</strong> ${symptoms}</div>
                <div class="needs"><strong>Necesidades:</strong> ${needs}</div>
                <p><strong>Nivel de afectación:</strong> ${patient['Nivel de afectación'].replace(/\(.*?\)/g, '')}</p>
            `;
            
            container.appendChild(card);
        });
    }
    
    // Formatear listas de items (síntomas, necesidades)
    function formatItems(text) {
        if (!text) return '';
        return text.split(';')
            .map(item => `<span class="tag">${item.trim()}</span>`)
            .join(' ');
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Búsqueda en tiempo real
        searchInput.addEventListener('input', () => {
            filterPatients();
        });
        
        // Botón de reinicio
        resetBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterPatients();
        });
    }
    
    // Filtrar pacientes según búsqueda
    function filterPatients() {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (!searchTerm) {
            filteredPatients = [...allPatients];
        } else {
            filteredPatients = allPatients.filter(patient => {
                return (
                    patient.Nombre.toLowerCase().includes(searchTerm) ||
                    (patient['Síntomas principales'] && patient['Síntomas principales'].toLowerCase().includes(searchTerm)) ||
                    (patient.Necesidades && patient.Necesidades.toLowerCase().includes(searchTerm))
                );
            });
        }
        
        renderPatients(filteredPatients);
    }
    
    // Mostrar/ocultar indicador de carga
    function showLoading(show) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    // Mostrar mensaje de error
    function showError(message) {
        errorMessage.textContent = `Error: ${message}`;
        errorMessage.style.display = 'block';
    }
    
    // Limpiar mensaje de error
    function clearError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }
});
