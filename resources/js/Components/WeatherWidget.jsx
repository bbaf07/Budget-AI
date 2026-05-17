import { useState, useEffect } from 'react';

// Codes météo Open-Meteo → emoji + texte
const weatherInfo = {
    0:  { icon: '☀️', label: 'Ciel dégagé' },
    1:  { icon: '🌤️', label: 'Plutôt clair' },
    2:  { icon: '⛅', label: 'Partiellement nuageux' },
    3:  { icon: '☁️', label: 'Couvert' },
    45: { icon: '🌫️', label: 'Brouillard' },
    48: { icon: '🌫️', label: 'Brouillard givrant' },
    51: { icon: '🌦️', label: 'Bruine légère' },
    53: { icon: '🌦️', label: 'Bruine modérée' },
    55: { icon: '🌦️', label: 'Bruine dense' },
    61: { icon: '🌧️', label: 'Pluie légère' },
    63: { icon: '🌧️', label: 'Pluie modérée' },
    65: { icon: '🌧️', label: 'Pluie forte' },
    71: { icon: '🌨️', label: 'Neige légère' },
    73: { icon: '🌨️', label: 'Neige modérée' },
    75: { icon: '❄️', label: 'Neige forte' },
    80: { icon: '🌧️', label: 'Averses légères' },
    81: { icon: '🌧️', label: 'Averses modérées' },
    82: { icon: '⛈️', label: 'Averses violentes' },
    95: { icon: '⛈️', label: 'Orage' },
    96: { icon: '⛈️', label: 'Orage avec grêle' },
    99: { icon: '⛈️', label: 'Orage violent avec grêle' },
};

const card = {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a1a 100%)',
    border: '1px solid #c9a84c44',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
};

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Géolocalisation non supportée');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`/weather?lat=${latitude}&lon=${longitude}`, {
                        credentials: 'same-origin',
                    });
                    const data = await res.json();
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setWeather(data);
                    }
                } catch (e) {
                    setError('Impossible de récupérer la météo');
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError('Localisation refusée');
                setLoading(false);
            }
        );
    }, []);

    if (loading) {
        return (
            <div style={card}>
                <span style={{ fontSize: '2rem' }}>🌍</span>
                <div>
                    <p style={{ color: '#ffffff88', fontSize: '0.85rem' }}>Chargement de la météo...</p>
                </div>
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div style={card}>
                <span style={{ fontSize: '2rem' }}>📍</span>
                <div>
                    <p style={{ color: '#c9a84c', fontSize: '0.85rem', fontWeight: '600' }}>Météo indisponible</p>
                    <p style={{ color: '#ffffff66', fontSize: '0.75rem' }}>{error || 'Active la géolocalisation'}</p>
                </div>
            </div>
        );
    }

    const info = weatherInfo[weather.weather_code] || { icon: '🌍', label: 'Météo' };

    return (
        <div style={card}>
            <span style={{ fontSize: '2.5rem' }}>{info.icon}</span>
            <div style={{ flex: 1 }}>
                <p style={{ color: '#c9a84c', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                    {weather.city}{weather.country ? `, ${weather.country}` : ''}
                </p>
                <p style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                    {Math.round(weather.temperature)}°C
                </p>
                <p style={{ color: '#ffffff88', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    {info.label} • Vent {Math.round(weather.wind_speed)} km/h
                </p>
            </div>
        </div>
    );
}