# Requêtes réseau

Ce document explique comment effectuer des requêtes vers l'API en utilisant le hook `useApi`.

## Utilisation de base

```jsx
import { useApi } from 'smartcommon';

const MyComponent = () => {
    const api = useApi();

    // Your code here
};
```

## Requêtes JSON (usage standard)

Par défaut, toutes les requêtes retournent une réponse JSON parsée automatiquement.

### GET

```jsx
// Simple GET request
const data = await api.get('users');

// GET with query parameters
const data = await api.get('users', {
    searchParams: { role: 'admin', active: true }
});
```

### POST

```jsx
// POST with JSON body
const data = await api.post('users', {
    json: {
        name: 'John Doe',
        email: 'john@example.com'
    }
});
```

### PUT

```jsx
// Update a resource
const data = await api.put('users/123', {
    json: {
        name: 'Jane Doe'
    }
});
```

### PATCH

```jsx
// Partial update
const data = await api.patch('users/123', {
    json: {
        status: 'active'
    }
});
```

### DELETE

```jsx
// Delete a resource
const data = await api.del('users/123');
```

## Requêtes binaires (photos, PDFs, fichiers)

Pour télécharger des fichiers binaires comme des photos ou des PDFs, utilisez l'option `raw: true`. Cela retourne l'objet `Response` de ky au lieu de parser automatiquement en JSON.

### Télécharger une photo

```jsx
// Get raw response
const response = await api.get('photos/123', { raw: true });

// Convert to blob
const blob = await response.blob();

// Create object URL for display
const imageUrl = URL.createObjectURL(blob);

// Use in img tag
<img src={imageUrl} alt="Photo" />

// Don't forget to revoke when done
URL.revokeObjectURL(imageUrl);
```

### Télécharger un PDF

```jsx
// Get raw response
const response = await api.get('documents/456/pdf', { raw: true });

// Convert to blob
const blob = await response.blob();

// Create download link
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'document.pdf';
link.click();

// Clean up
URL.revokeObjectURL(url);
```

### Télécharger n'importe quel fichier

```jsx
const downloadFile = async (url, filename) => {
    const response = await api.get(url, { raw: true });
    const blob = await response.blob();

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(objectUrl);
};

// Usage
await downloadFile('files/789', 'report.xlsx');
```

### Uploader un fichier

```jsx
// Upload with FormData
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('description', 'Profile photo');

const data = await api.post('photos/upload', {
    body: formData
});
```

## Options avancées

### Timeout personnalisé

```jsx
const data = await api.get('slow-endpoint', {
    timeout: 30000 // 30 seconds
});
```

### Headers personnalisés

```jsx
const data = await api.get('endpoint', {
    headers: {
        'X-Custom-Header': 'value'
    }
});
```

### Delay (pour tests)

```jsx
const data = await api.get('endpoint', {
    delay: 2000 // Wait 2 seconds before sending
});
```

## Gestion des erreurs

```jsx
try {
    const data = await api.get('users');
} catch (error) {
    if (error.message === 'No internet connection') {
        // Handle offline
    } else if (error.message === 'Circuit breaker open – requests blocked') {
        // Too many errors, requests are temporarily blocked
    } else {
        // Other errors
    }
}
```

## Notes importantes

- Les requêtes `get`, `post`, `put`, `patch`, `del` sont automatiquement authentifiées (utilisent `privateApi`)
- Le refresh token est géré automatiquement en cas d'expiration
- Un circuit breaker bloque les requêtes pendant 10 secondes après une erreur réseau
- L'option `raw: true` est implémentée dans [context.jsx:332-339](../src/lib/hooks/global/useApi/context.jsx#L332-L339)
