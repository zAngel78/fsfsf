class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.availablePlaces = [];
        
        // Elementos DOM
        this.calendarEl = document.getElementById('calendar');
        this.currentMonthEl = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.availablePlacesEl = document.getElementById('availablePlaces');
        
        // Event listeners
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        
        // Inicializar
        this.render();
    }
    
    async render() {
        this.updateMonthDisplay();
        await this.renderCalendar();
    }
    
    updateMonthDisplay() {
        const options = { year: 'numeric', month: 'long' };
        this.currentMonthEl.textContent = this.currentDate.toLocaleDateString('es-ES', options);
    }
    
    async renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Primer día del mes
        const firstDay = new Date(year, month, 1);
        // Último día del mes
        const lastDay = new Date(year, month + 1, 0);
        
        // Obtener disponibilidad del mes
        try {
            const response = await API.getPlazasDisponibles(
                this.formatDate(firstDay),
                this.formatDate(lastDay)
            );
            this.availablePlaces = response;
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            this.availablePlaces = [];
        }
        
        // Limpiar calendario
        this.calendarEl.innerHTML = '';
        
        // Añadir encabezados de días
        const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            this.calendarEl.appendChild(dayHeader);
        });
        
        // Añadir espacios en blanco para el primer día
        let firstDayIndex = firstDay.getDay() || 7;
        for (let i = 1; i < firstDayIndex; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            this.calendarEl.appendChild(emptyDay);
        }
        
        // Añadir días del mes
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'day';
            dayEl.textContent = day;
            
            const currentDay = new Date(year, month, day);
            const isAvailable = this.checkAvailability(currentDay);
            
            if (isAvailable) {
                dayEl.classList.add('available');
            } else {
                dayEl.classList.add('unavailable');
            }
            
            dayEl.addEventListener('click', () => this.selectDate(currentDay));
            this.calendarEl.appendChild(dayEl);
        }
    }
    
    checkAvailability(date) {
        // Verificar si hay plazas disponibles para esta fecha
        return this.availablePlaces.some(plaza => {
            const plazaDate = new Date(plaza.fecha);
            return plazaDate.getDate() === date.getDate() &&
                   plazaDate.getMonth() === date.getMonth() &&
                   plazaDate.getFullYear() === date.getFullYear();
        });
    }
    
    selectDate(date) {
        if (!this.checkAvailability(date)) return;
        
        this.selectedDate = date;
        this.updateAvailablePlaces();
        
        // Actualizar vista visual
        document.querySelectorAll('.day').forEach(day => {
            day.classList.remove('selected');
        });
        
        const selectedDay = Array.from(document.querySelectorAll('.day')).find(
            day => !day.classList.contains('empty') && 
                  parseInt(day.textContent) === date.getDate()
        );
        
        if (selectedDay) {
            selectedDay.classList.add('selected');
        }
    }
    
    async updateAvailablePlaces() {
        if (!this.selectedDate) return;
        
        try {
            const response = await API.getPlazasDisponibles(
                this.formatDate(this.selectedDate),
                this.formatDate(this.selectedDate)
            );
            
            this.availablePlacesEl.innerHTML = '';
            response.forEach(plaza => {
                const plazaEl = document.createElement('div');
                plazaEl.className = 'plaza-item';
                plazaEl.innerHTML = `
                    <h4>Plaza ${plaza.numero}</h4>
                    <p>Dimensiones: ${plaza.dimensiones}</p>
                    <button class="btn-primary" onclick="window.location.href='#reservation-view'">
                        Reservar
                    </button>
                `;
                this.availablePlacesEl.appendChild(plazaEl);
            });
        } catch (error) {
            console.error('Error al obtener plazas disponibles:', error);
            this.availablePlacesEl.innerHTML = '<p>Error al cargar plazas disponibles</p>';
        }
    }
    
    changeMonth(delta) {
        this.currentDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + delta,
            1
        );
        this.render();
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
}

// Inicializar calendario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.calendar = new Calendar();
}); 