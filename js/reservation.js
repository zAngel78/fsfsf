class Reservation {
    constructor() {
        this.form = document.getElementById('booking-form');
        this.mainView = document.getElementById('main-view');
        this.reservationView = document.getElementById('reservation-form');
        this.backButton = this.reservationView.querySelector('.back-button');

        // Event listeners
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.backButton.addEventListener('click', () => this.volverAPlazas());

        // Inicializar Flatpickr para las fechas
        this.initializeDatePickers();
    }

    initializeDatePickers() {
        const config = {
            locale: 'es',
            dateFormat: 'Y-m-d',
            minDate: 'today',
            disableMobile: true
        };

        this.fechaEntrada = flatpickr('#fecha-entrada', {
            ...config,
            onChange: (selectedDates) => {
                // Actualizar fecha mínima de salida
                if (selectedDates[0]) {
                    this.fechaSalida.set('minDate', selectedDates[0]);
                }
                this.actualizarResumen();
            }
        });

        this.fechaSalida = flatpickr('#fecha-salida', {
            ...config,
            onChange: () => this.actualizarResumen()
        });
    }

    mostrarFormulario() {
        console.log('Mostrando formulario de reserva');
        // Obtener datos guardados
        const reservaData = JSON.parse(sessionStorage.getItem('reserva') || '{}');
        console.log('Datos de reserva:', reservaData);

        if (!reservaData.plaza) {
            console.log('No hay datos de reserva');
            this.volverAPlazas();
            return;
        }

        // Establecer fecha de entrada
        if (reservaData.fecha) {
            this.fechaEntrada.setDate(reservaData.fecha);
            
            // Establecer fecha de salida al día siguiente por defecto
            const fechaSalida = new Date(reservaData.fecha);
            fechaSalida.setDate(fechaSalida.getDate() + 1);
            this.fechaSalida.setDate(fechaSalida);
        }

        // Mostrar servicios seleccionados
        const serviciosContainer = document.getElementById('servicios-seleccionados');
        serviciosContainer.innerHTML = reservaData.servicios.map(servicio => `
            <div class="servicio-seleccionado">
                <span>${servicio.nombre}</span>
                <span>${servicio.precio}€/día</span>
            </div>
        `).join('');

        this.actualizarResumen();
    }

    actualizarResumen() {
        const reservaData = JSON.parse(sessionStorage.getItem('reserva') || '{}');
        const fechaEntrada = this.fechaEntrada.selectedDates[0];
        const fechaSalida = this.fechaSalida.selectedDates[0];

        if (!fechaEntrada || !fechaSalida) return;

        // Calcular número de días
        const dias = Math.ceil((fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24));
        
        // Actualizar resumen
        document.getElementById('resumen-plaza').textContent = reservaData.plaza || '';
        document.getElementById('resumen-dias').textContent = dias;
        document.getElementById('resumen-servicios').textContent = 
            reservaData.servicios?.map(s => s.nombre).join(', ') || '';
        
        // Calcular precio total
        const precioTotal = parseFloat(reservaData.precioTotal) * dias;
        document.getElementById('resumen-total').textContent = `${precioTotal}€`;
    }

    async handleSubmit(e) {
        e.preventDefault();
        console.log('Enviando formulario');

        const reservaData = JSON.parse(sessionStorage.getItem('reserva') || '{}');
        const formData = new FormData(this.form);

        try {
            const response = await API.createReserva({
                plazaId: parseInt(reservaData.plaza.replace('P', '')),
                nombre: formData.get('nombre'),
                apellidos: formData.get('apellidos'),
                email: formData.get('email'),
                telefono: formData.get('telefono'),
                fechaEntrada: this.fechaEntrada.selectedDates[0].toISOString().split('T')[0],
                fechaSalida: this.fechaSalida.selectedDates[0].toISOString().split('T')[0],
                serviciosContratados: reservaData.servicios.map(s => s.id)
            });

            if (response.id) {
                alert('Reserva completada con éxito');
                sessionStorage.removeItem('reserva');
                this.form.reset();
                this.volverAPlazas();
            }
        } catch (error) {
            console.error('Error al crear reserva:', error);
            alert('Error al procesar la reserva. Por favor, inténtelo de nuevo.');
        }
    }

    volverAPlazas() {
        window.location.hash = '';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.reservation = new Reservation();
}); 