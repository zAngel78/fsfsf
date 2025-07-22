class App {
    constructor() {
        this.mainView = document.getElementById('main-view');
        this.reservationView = document.getElementById('reservation-form');
        this.adminView = document.getElementById('admin-view');
        this.currentView = null;

        // Manejar navegación inicial
        this.handleNavigation();

        // Escuchar cambios en el hash
        window.addEventListener('hashchange', () => this.handleNavigation());
    }

    handleNavigation() {
        const hash = window.location.hash || '#main-view';
        console.log('Navegando a:', hash);

        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Mostrar la vista correspondiente
        switch (hash) {
            case '#reservation-form':
                console.log('Mostrando formulario de reserva');
                this.mainView.classList.remove('active');
                this.reservationView.classList.add('active');
                this.adminView.classList.remove('active');
                // Inicializar el formulario si hay datos
                if (window.reservation) {
                    window.reservation.mostrarFormulario();
                }
                break;
            case '#admin':
                console.log('Mostrando panel de administración');
                this.mainView.classList.remove('active');
                this.reservationView.classList.remove('active');
                this.adminView.classList.add('active');
                // Recargar datos si es necesario
                if (window.admin) {
                    window.admin.loadInitialData();
                }
                break;
            default:
                console.log('Mostrando vista principal');
                this.mainView.classList.add('active');
                this.reservationView.classList.remove('active');
                this.adminView.classList.remove('active');
                break;
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 