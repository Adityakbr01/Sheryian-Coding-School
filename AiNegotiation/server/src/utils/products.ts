export interface Product {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    minimumPrice: number;
    emoji: string;
}

export const PRODUCTS: Product[] = [
    {
        id: 'laptop-pro',
        name: 'ProBook Laptop',
        description: 'High-performance laptop with 16GB RAM, 512GB SSD',
        basePrice: 55000,
        minimumPrice: 32000,    // ~42% headroom (was 42000 = only 24%)
        emoji: '💻',
    },
    {
        id: 'smartphone-x',
        name: 'PhoneX Ultra',
        description: 'Latest flagship smartphone with 200MP camera',
        basePrice: 45000,
        minimumPrice: 25000,    // ~44% headroom (was 35000 = only 22%)
        emoji: '📱',
    },
    {
        id: 'vintage-watch',
        name: 'Heritage Timepiece',
        description: 'Handcrafted vintage watch, limited edition',
        basePrice: 12000,
        minimumPrice: 6000,     // 50% headroom (was 8000 = only 33%)
        emoji: '⌚',
    },
    {
        id: 'sneakers-limited',
        name: 'AirRun Pro Sneakers',
        description: 'Limited edition running sneakers, only 500 pairs',
        basePrice: 8000,
        minimumPrice: 4000,     // 50% headroom (was 5500 = only 31%)
        emoji: '👟',
    },
    {
        id: 'antique-vase',
        name: 'Ming Dynasty Vase (Replica)',
        description: 'Museum-quality antique vase replica',
        basePrice: 3500,
        minimumPrice: 1500,     // 57% headroom (was 2200 = only 37%)
        emoji: '🏺',
    },
    {
        id: 'camera-dslr',
        name: 'ShootPro DSLR Camera',
        description: '24MP DSLR with 18-55mm kit lens',
        basePrice: 35000,
        minimumPrice: 18000,    // ~49% headroom (was 27000 = only 23%!)
        emoji: '📷',
    },
];

export function getProduct(productId: string): Product | undefined {
    return PRODUCTS.find((p) => p.id === productId);
}

