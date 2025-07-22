class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        
        // Elementos DOM
        this.calendarEl = document.getElementById('calendar');
        this.currentMonthEl = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        
        // Event listeners
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        
        // Inicializar
        this.render();
    }
    
    async render() {
        this.updateMonthDisplay();
        this.renderCalendar();
    }
    
    updateMonthDisplay() {
        const options = { year: 'numeric', month: 'long' };
        this.currentMonthEl.textContent = this.currentDate.toLocaleDateString('es-ES', options).replace(/^\w/, c => c.toUpperCase());
    }
    
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Primer día del mes
        const firstDay = new Date(year, month, 1);
        // Último día del mes
        const lastDay = new Date(year, month + 1, 0);
        
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
        
        // Calcular el día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
        let firstDayIndex = firstDay.getDay();
        // Ajustar para que la semana empiece en lunes
        firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        
        // Añadir espacios en blanco para el primer día
        for (let i = 0; i < firstDayIndex; i++) {
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
            
            // No permitir seleccionar días pasados
            if (currentDay < new Date().setHours(0,0,0,0)) {
                dayEl.classList.add('unavailable');
            } else {
                dayEl.classList.add('available');
                
                if (this.selectedDate && 
                    currentDay.getDate() === this.selectedDate.getDate() &&
                    currentDay.getMonth() === this.selectedDate.getMonth() &&
                    currentDay.getFullYear() === this.selectedDate.getFullYear()) {
                    dayEl.classList.add('selected');
                }
                
                dayEl.addEventListener('click', () => this.selectDate(currentDay));
            }
            
            this.calendarEl.appendChild(dayEl);
        }
    }
    
    async selectDate(date) {
        this.selectedDate = date;
        
        // Actualizar visual del calendario
        document.querySelectorAll('.day').forEach(day => {
            day.classList.remove('selected');
            if (!day.classList.contains('empty') && 
                parseInt(day.textContent) === date.getDate()) {
                day.classList.add('selected');
            }
        });
        
        // Mostrar las plazas para la fecha seleccionada
        await window.places.showPlaces(this.formatDate(date));
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
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Inicializar calendario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
}); 