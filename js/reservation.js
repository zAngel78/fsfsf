class ReservationForm {
    constructor() {
        this.form = document.getElementById('reservationForm');
        this.checkInInput = document.getElementById('checkIn');
        this.checkOutInput = document.getElementById('checkOut');
        this.placeSelect = document.getElementById('place');
        this.servicesContainer = document.getElementById('services');
        this.basePriceEl = document.getElementById('basePrice');
        this.servicesPriceEl = document.getElementById('servicesPrice');
        this.totalPriceEl = document.getElementById('totalPrice');
        
        this.initializeDatePickers();
        this.loadServices();
        this.loadPlaces();
        this.setupEventListeners();
    }
    
    initializeDatePickers() {
        const config = {
            locale: 'es',
            dateFormat: CONFIG.DATE_FORMAT,
            minDate: 'today',
            onChange: () => this.updatePrices()
        };
        
        this.checkInPicker = flatpickr(this.checkInInput, {
            ...config,
            onChange: (selectedDates) => {
                this.checkOutPicker.set('minDate', selectedDates[0]);
                this.updatePrices();
                this.loadAvailablePlaces();
            }
        });
        
        this.checkOutPicker = flatpickr(this.checkOutInput, {
            ...config,
            onChange: (selectedDates) => {
                this.checkInPicker.set('maxDate', selectedDates[0]);
                this.updatePrices();
                this.loadAvailablePlaces();
            }
        });
    }
    
    async loadServices() {
        try {
            const response = await API.getServicios();
            const servicios = response.servicios.filter(s => s.activo);
            
            this.servicesContainer.innerHTML = servicios.map(servicio => `
                <div class="service-item">
                    <input type="checkbox" 
                           id="service-${servicio.id}" 
                           name="services[]" 
                           value="${servicio.id}"
                           data-price="${servicio.precio}"
                           onchange="window.reservationForm.updatePrices()">
                    <label for="service-${servicio.id}">
                        ${servicio.nombre} (${servicio.precio}€/día)
                    </label>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            this.servicesContainer.innerHTML = '<p>Error al cargar servicios</p>';
        }
    }
    
    async loadPlaces() {
        try {
            const response = await API.getPlazas();
            const plazas = response.plazas.filter(p => p.activa);
            
            this.placeSelect.innerHTML = `
                <option value="">Selecciona una plaza</option>
                ${plazas.map(plaza => `
                    <option value="${plaza.id}">
                        Plaza ${plaza.numero} (${plaza.dimensiones})
                    </option>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error al cargar plazas:', error);
            this.placeSelect.innerHTML = '<option value="">Error al cargar plazas</option>';
        }
    }
    
    async loadAvailablePlaces() {
        const checkIn = this.checkInInput.value;
        const checkOut = this.checkOutInput.value;
        
        if (!checkIn || !checkOut) return;
        
        try {
            const plazas = await API.getPlazasDisponibles(checkIn, checkOut);
            
            this.placeSelect.innerHTML = `
                <option value="">Selecciona una plaza</option>
                ${plazas.map(plaza => `
                    <option value="${plaza.id}">
                        Plaza ${plaza.numero} (${plaza.dimensiones})
                    </option>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error al cargar plazas disponibles:', error);
            this.placeSelect.innerHTML = '<option value="">Error al cargar plazas</option>';
        }
    }
    
    updatePrices() {
        const checkIn = new Date(this.checkInInput.value);
        const checkOut = new Date(this.checkOutInput.value);
        
        if (!checkIn || !checkOut || checkIn >= checkOut) {
            this.resetPrices();
            return;
        }
        
        // Calcular días
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        
        // Precio base
        const basePrice = CONFIG.PLAZA_BASE_PRICE * days;
        this.basePriceEl.textContent = `${basePrice}€`;
        
        // Precio servicios
        let servicesPrice = 0;
        document.querySelectorAll('input[name="services[]"]:checked').forEach(service => {
            servicesPrice += parseFloat(service.dataset.price) * days;
        });
        this.servicesPriceEl.textContent = `${servicesPrice}€`;
        
        // Total
        const total = basePrice + servicesPrice;
        this.totalPriceEl.textContent = `${total}€`;
    }
    
    resetPrices() {
        this.basePriceEl.textContent = '0€';
        this.servicesPriceEl.textContent = '0€';
        this.totalPriceEl.textContent = '0€';
    }
    
    setupEventListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                plazaId: parseInt(this.placeSelect.value),
                fechaEntrada: this.checkInInput.value,
                fechaSalida: this.checkOutInput.value,
                nombre: document.getElementById('name').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('phone').value,
                matricula: document.getElementById('plate').value,
                serviciosContratados: Array.from(
                    document.querySelectorAll('input[name="services[]"]:checked')
                ).map(input => parseInt(input.value)),
                total: parseFloat(this.totalPriceEl.textContent)
            };
            
            try {
                await API.createReserva(formData);
                alert('Reserva creada con éxito');
                this.form.reset();
                this.resetPrices();
            } catch (error) {
                alert(error.message);
            }
        });
    }
}

// Inicializar formulario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.reservationForm = new ReservationForm();
}); 