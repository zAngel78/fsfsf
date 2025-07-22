const API = {
    async getServicios() {
        const response = await fetch(`${CONFIG.API_URL}/servicios`);
        if (!response.ok) throw new Error('Error al obtener servicios');
        return response.json();
    },

    async getPlazas() {
        const response = await fetch(`${CONFIG.API_URL}/plazas`);
        if (!response.ok) throw new Error('Error al obtener plazas');
        return response.json();
    },

    async getPlazasDisponibles(fechaInicio, fechaFin) {
        const response = await fetch(
            `${CONFIG.API_URL}/plazas/disponibles?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
        );
        if (!response.ok) throw new Error('Error al obtener plazas disponibles');
        return response.json();
    },

    async getReservas() {
        const response = await fetch(`${CONFIG.API_URL}/reservas`);
        if (!response.ok) throw new Error('Error al obtener reservas');
        return response.json();
    },

    async createReserva(reservaData) {
        const response = await fetch(`${CONFIG.API_URL}/reservas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al crear reserva');
        }
        return response.json();
    }
}; 