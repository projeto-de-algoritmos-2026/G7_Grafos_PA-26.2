const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('stockio_token') : null;
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
}

export async function getAllParentCategories() {
    try {
        // Ajuste a rota se necessário de acordo com seu backend FastAPI
        const res = await fetch(`${BASE_URL}/api/categories?parent=true`);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getChildCategories(parentId: number) {
    try {
        const res = await fetch(`${BASE_URL}/api/categories/${parentId}/children`);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getAllProducts() {
    try {
        const res = await fetch(`${BASE_URL}/api/products`);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getProductsById(productId: number | string) {
    try {
        const res = await fetch(`${BASE_URL}/api/products/${productId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getUserById(userId: string | number) {
    try {
        const res = await fetch(`${BASE_URL}/api/users/${userId}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function processCheckout(payload: { items: any[], cep: string, user_id?: string | null }) {
    try {
        const res = await fetch(`${BASE_URL}/api/checkout`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Checkout failed");
        return await res.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
}
