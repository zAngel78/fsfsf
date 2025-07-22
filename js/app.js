class App {
    constructor() {
        this.views = {
            calendar: document.getElementById('calendar-view'),
            reservation: document.getElementById('reservation-view')
        };
        
        this.navButtons = document.querySelectorAll('.nav-btn');
        
        this.setupNavigation();
    }
    
    setupNavigation() {
        this.navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.dataset.view;
                this.showView(view);
            });
        });
        
        // Manejar navegación por hash
        window.addEventListener('hashchange', () => this.handleHashChange());
        this.handleHashChange();
    }
    
    showView(viewName) {
        // Actualizar botones
        this.navButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.view === viewName);
        });
        
        // Actualizar vistas
        Object.entries(this.views).forEach(([name, element]) => {
            element.classList.toggle('active', name === viewName);
        });
        
        // Actualizar hash
        window.location.hash = viewName;
    }
    
    handleHashChange() {
        const hash = window.location.hash.slice(1) || 'calendar';
        this.showView(hash);
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 