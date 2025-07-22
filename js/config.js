const CONFIG = {
    API_URL: 'https://e79d945072b2.ngrok-free.app/api',
    PLAZA_BASE_PRICE: 15, // Precio base por día
    DATE_FORMAT: 'Y-m-d',
    SERVICES: {
        'Electricidad': 5,
        'Agua': 3,
        'WiFi': 2
    },
    FETCH_OPTIONS: {
        mode: 'cors',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'Access-Control-Allow-Origin': '*'
        }
    }
}; 