export function useImagePreload() {
    const preloadImage = (url: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve()
            img.onerror = reject
            img.src = url
        })
    }

    return { preloadImage }
}
