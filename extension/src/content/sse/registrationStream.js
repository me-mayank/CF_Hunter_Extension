import { BASE_URL } from '../../shared/constants.js';

export function startRegistrationStream(handle, onEvent, onComplete, onError) {
    const url = `${BASE_URL}/hunter/${handle}/events`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.status === 'READY' || data.status === 'FAILED') {
                eventSource.close();
                onComplete(data);
            } else {
                onEvent(data);
            }
        } catch (e) {
            console.error("Hunter System: Failed to parse SSE data", e);
        }
    };

    eventSource.onerror = (err) => {
        console.error("Hunter System: SSE error", err);
        eventSource.close();
        onError(err);
    };

    return () => eventSource.close(); // Cleanup function
}
